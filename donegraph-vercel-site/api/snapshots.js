const {
  envConfig,
  findUploadSpace,
  publicBaseUrl,
  readJsonBody,
  send,
  setupMessage,
  supabaseRequest,
  uploadTokenFromRequest
} = require("./_cloud");

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

module.exports = async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    send(res, 405, { error: "Method not allowed." });
    return;
  }

  const config = envConfig();
  if (!config) {
    send(res, 503, setupMessage());
    return;
  }

  try {
    if (req.method === "GET") {
      const id = new URL(req.url, "https://donegraph.space").searchParams.get("id");
      if (!id) {
        send(res, 400, { error: "Missing snapshot id." });
        return;
      }
      const rows = await supabaseRequest(
        config,
        `${config.snapshotTable}?id=eq.${encodeURIComponent(id)}&select=id,snapshot,created_at&limit=1`
      );
      const row = Array.isArray(rows) ? rows[0] : undefined;
      if (!row) {
        send(res, 404, { error: "Snapshot not found." });
        return;
      }
      send(res, 200, { id: row.id, snapshot: row.snapshot, created_at: row.created_at });
      return;
    }

    const snapshot = await readJsonBody(req);
    if (!isSafeSnapshot(snapshot)) {
      send(res, 400, { error: "Only DoneGraph safe snapshots can be published." });
      return;
    }
    const uploadToken = uploadTokenFromRequest(req);
    const space = await findUploadSpace(config, uploadToken);
    if (!space) {
      send(res, 401, {
        error: "Create an upload space first, then publish with its Agent token.",
        action: `${publicBaseUrl(req, config)}/share`
      });
      return;
    }

    const rows = await supabaseRequest(config, config.snapshotTable, {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({
        space_id: space.id,
        snapshot,
        goal: snapshot.goal || null,
        generated_at: snapshot.generated_at || null,
        privacy_mode: snapshot.privacy.mode,
        summary: snapshot.summary || null
      })
    });
    const row = Array.isArray(rows) ? rows[0] : rows;
    const id = row?.id;
    const baseUrl = publicBaseUrl(req, config);
    send(res, 200, {
      id,
      share_url: id ? `${baseUrl}/share?id=${encodeURIComponent(id)}` : `${baseUrl}/share`,
      space_id: space.id,
      stored: true
    });
  } catch (error) {
    send(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
};
