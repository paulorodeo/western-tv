import { createFileRoute } from "@tanstack/react-router";

const ORIGIN = "https://tv.fazenda.rodeo/hls/";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range, Content-Type",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
};

function contentTypeFor(path: string): string | null {
  if (path.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
  if (path.endsWith(".ts")) return "video/mp2t";
  if (path.endsWith(".m4s") || path.endsWith(".mp4")) return "video/mp4";
  if (path.endsWith(".key")) return "application/octet-stream";
  return null;
}

async function proxy(request: Request, splat: string, method: "GET" | "HEAD") {
  const url = ORIGIN + splat;
  const headers: Record<string, string> = {};
  const range = request.headers.get("range");
  if (range) headers["Range"] = range;

  const upstream = await fetch(url, { method, headers });
  const outHeaders = new Headers();
  const ct = contentTypeFor(splat) ?? upstream.headers.get("content-type") ?? "application/octet-stream";
  outHeaders.set("Content-Type", ct);
  for (const h of ["content-length", "content-range", "accept-ranges", "cache-control", "etag", "last-modified"]) {
    const v = upstream.headers.get(h);
    if (v) outHeaders.set(h, v);
  }
  if (!outHeaders.has("cache-control")) {
    outHeaders.set("Cache-Control", splat.endsWith(".m3u8") ? "no-cache" : "public, max-age=60");
  }
  for (const [k, v] of Object.entries(CORS)) outHeaders.set(k, v);

  return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
}

export const Route = createFileRoute("/api/public/hls/$")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: { ...CORS, "Access-Control-Max-Age": "86400" } }),
      GET: async ({ request, params }) => proxy(request, (params as { _splat: string })._splat, "GET"),
      HEAD: async ({ request, params }) => proxy(request, (params as { _splat: string })._splat, "HEAD"),
    },
  },
});
