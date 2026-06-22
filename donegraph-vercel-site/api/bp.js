const BP_FILES = {
  pdf: {
    pathname: "bp/donegraph-trust-layer-bp.pdf",
    download: false
  },
  pptx: {
    pathname: "bp/donegraph-trust-layer-bp.pptx",
    download: true
  }
};

async function signedBlobUrl(pathname) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BP storage is not configured.");
  const { issueSignedToken, presignUrl } = await import("@vercel/blob");
  const signed = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil: Date.now() + 1000 * 60 * 30,
    token
  });
  const result = await presignUrl(signed, {
    pathname,
    operation: "get",
    access: "private"
  });
  return result.presignedUrl;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed." }));
    return;
  }

  try {
    const file = new URL(req.url, "https://donegraph.space").searchParams.get("file") || "pdf";
    const target = BP_FILES[file] || BP_FILES.pdf;
    const url = new URL(await signedBlobUrl(target.pathname));
    if (target.download) url.searchParams.set("download", "1");
    res.statusCode = 302;
    res.setHeader("cache-control", "no-store");
    res.setHeader("location", url.toString());
    res.end();
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
  }
};
