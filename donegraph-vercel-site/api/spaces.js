const {
  envConfig,
  generateUploadToken,
  hashUploadToken,
  publicBaseUrl,
  readJsonBody,
  send,
  setupMessage,
  supabaseRequest
} = require("./_cloud");

function cleanText(value, fallback, limit) {
  const text = typeof value === "string" ? value.trim() : "";
  return (text || fallback).slice(0, limit);
}

function cleanEmail(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  return text.slice(0, 160);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    send(res, 405, { error: "Method not allowed." });
    return;
  }

  const config = envConfig();
  if (!config) {
    send(res, 503, setupMessage());
    return;
  }

  try {
    const body = await readJsonBody(req);
    const name = cleanText(body.name, "My DoneGraph Space", 96);
    const email = cleanEmail(body.email);
    const uploadToken = generateUploadToken();
    const rows = await supabaseRequest(config, config.spaceTable, {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({
        name,
        email,
        upload_token_hash: hashUploadToken(uploadToken)
      })
    });
    const row = Array.isArray(rows) ? rows[0] : rows;
    const baseUrl = publicBaseUrl(req, config);
    send(res, 200, {
      id: row?.id,
      name: row?.name || name,
      email: row?.email || email,
      created_at: row?.created_at,
      upload_token: uploadToken,
      upload_url: `${baseUrl}/api/snapshots`,
      share_url: `${baseUrl}/share`,
      skill_url: `${baseUrl}/skill.md`
    });
  } catch (error) {
    send(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
};
