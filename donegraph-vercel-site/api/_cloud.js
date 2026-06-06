const crypto = require("node:crypto");

const DEFAULT_PUBLIC_URL = "https://donegraph.space";
const DEFAULT_SNAPSHOT_TABLE = "donegraph_snapshots";
const DEFAULT_SPACE_TABLE = "donegraph_upload_spaces";
const MAX_BODY_BYTES = 1024 * 1024;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body) {
      resolve(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
      return;
    }
    let size = 0;
    let raw = "";
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("The upload is larger than 1MB."));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}

function envConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return undefined;
  return {
    publicUrl: (process.env.DONEGRAPH_PUBLIC_URL || DEFAULT_PUBLIC_URL).replace(/\/$/, ""),
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    serviceKey,
    snapshotTable: process.env.DONEGRAPH_SNAPSHOT_TABLE || DEFAULT_SNAPSHOT_TABLE,
    spaceTable: process.env.DONEGRAPH_SPACE_TABLE || DEFAULT_SPACE_TABLE
  };
}

function setupMessage() {
  return {
    error: "Cloud upload is not turned on for this deployment yet.",
    setup:
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then create donegraph_upload_spaces and donegraph_snapshots."
  };
}

function publicBaseUrl(req, config) {
  if (config?.publicUrl) return config.publicUrl;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return host ? `${proto}://${host}` : DEFAULT_PUBLIC_URL;
}

async function supabaseRequest(config, path, options = {}) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`,
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(typeof body === "string" ? body : body?.message || `Supabase HTTP ${response.status}`);
  }
  return body;
}

function generateUploadToken() {
  return `dgup_${crypto.randomBytes(32).toString("base64url")}`;
}

function hashUploadToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function uploadTokenFromRequest(req) {
  const direct = req.headers["x-donegraph-upload-token"];
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const authorization = req.headers.authorization || req.headers.Authorization;
  if (typeof authorization === "string" && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }
  return undefined;
}

async function findUploadSpace(config, token) {
  if (!token) return undefined;
  const tokenHash = hashUploadToken(token);
  const rows = await supabaseRequest(
    config,
    `${config.spaceTable}?upload_token_hash=eq.${encodeURIComponent(tokenHash)}&select=id,name,email&limit=1`
  );
  return Array.isArray(rows) ? rows[0] : undefined;
}

module.exports = {
  envConfig,
  findUploadSpace,
  generateUploadToken,
  hashUploadToken,
  publicBaseUrl,
  readJsonBody,
  send,
  setupMessage,
  supabaseRequest,
  uploadTokenFromRequest
};
