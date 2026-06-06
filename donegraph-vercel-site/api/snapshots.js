const MAX_BODY_BYTES = 1024 * 1024;
const DEFAULT_TABLE = "donegraph_snapshots";

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body) {
      resolve(typeof req.body === "string" ? req.body : JSON.stringify(req.body));
      return;
    }
    let size = 0;
    let raw = "";
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Snapshot is larger than 1MB."));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on("end", () => resolve(raw));
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
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    serviceKey,
    table: process.env.DONEGRAPH_SNAPSHOT_TABLE || DEFAULT_TABLE
  };
}

function isSafeSnapshot(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.kind === "donegraph.safe_snapshot" &&
      value.version === "1" &&
      value.privacy &&
      value.privacy.raw_session_included === false
  );
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

module.exports = async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    send(res, 405, { error: "Method not allowed." });
    return;
  }

  const config = envConfig();
  if (!config) {
    send(res, 503, {
      error: "Cloud snapshot storage is not configured.",
      setup: "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then create a donegraph_snapshots table."
    });
    return;
  }

  try {
    if (req.method === "GET") {
      const id = new URL(req.url, "https://donegraph.space").searchParams.get("id");
      if (!id) {
        send(res, 400, { error: "Missing snapshot id." });
        return;
      }
      const rows = await supabaseRequest(config, `${config.table}?id=eq.${encodeURIComponent(id)}&select=id,snapshot,created_at&limit=1`);
      const row = Array.isArray(rows) ? rows[0] : undefined;
      if (!row) {
        send(res, 404, { error: "Snapshot not found." });
        return;
      }
      send(res, 200, { id: row.id, snapshot: row.snapshot, created_at: row.created_at });
      return;
    }

    const raw = await readBody(req);
    const snapshot = JSON.parse(raw);
    if (!isSafeSnapshot(snapshot)) {
      send(res, 400, { error: "Only DoneGraph safe snapshots can be published." });
      return;
    }
    const rows = await supabaseRequest(config, config.table, {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({
        snapshot,
        goal: snapshot.goal || null,
        generated_at: snapshot.generated_at || null,
        privacy_mode: snapshot.privacy.mode,
        summary: snapshot.summary || null
      })
    });
    const row = Array.isArray(rows) ? rows[0] : rows;
    const id = row?.id;
    send(res, 200, {
      id,
      share_url: id ? `/share.html?id=${encodeURIComponent(id)}` : "/share.html",
      stored: true
    });
  } catch (error) {
    send(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
};
