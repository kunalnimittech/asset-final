// Vercel Function: forwards every /api/* request to the Express backend.
//
// vercel.json rewrites /api/:path* to /api/proxy?__path=:path*, and this
// function sends it on to `${BACKEND_URL}/api/<path>`. The browser only ever
// talks to the frontend domain, so better-auth's session cookie stays
// first-party (no cross-site cookie settings needed).
//
// Set BACKEND_URL in the frontend Vercel project's Environment Variables,
// e.g. https://asset-backend-xi.vercel.app (no trailing slash).

// Hop-by-hop headers must not be forwarded; host/length are recomputed by fetch.
const DROP_REQUEST = new Set(["host", "connection", "content-length", "transfer-encoding", "keep-alive", "upgrade"]);
// fetch() already decoded the body, so the original encoding/length no longer apply.
const DROP_RESPONSE = new Set(["content-encoding", "content-length", "transfer-encoding", "connection", "keep-alive"]);

async function forward(request) {
  const backend = (process.env.BACKEND_URL || "").replace(/\/+$/, "");
  if (!backend) {
    return Response.json({ message: "BACKEND_URL is not set on the frontend project" }, { status: 500 });
  }

  const incoming = new URL(request.url);
  const path = incoming.searchParams.get("__path") ?? "";
  incoming.searchParams.delete("__path");
  const query = incoming.searchParams.toString();
  const target = `${backend}/api/${path}${query ? `?${query}` : ""}`;

  const headers = new Headers();
  for (const [key, value] of request.headers) {
    if (!DROP_REQUEST.has(key.toLowerCase())) headers.set(key, value);
  }
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));

  const hasBody = !["GET", "HEAD"].includes(request.method);
  let upstream;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      // OAuth hands back redirects (to Google/Zoho and back to the app):
      // pass them to the browser instead of following them here.
      redirect: "manual",
    });
  } catch {
    return Response.json({ message: "Can't reach the backend" }, { status: 502 });
  }

  const out = new Headers();
  for (const [key, value] of upstream.headers) {
    const k = key.toLowerCase();
    if (DROP_RESPONSE.has(k) || k === "set-cookie") continue;
    out.append(key, value);
  }
  // Every Set-Cookie separately (sign-in can set more than one).
  for (const cookie of upstream.headers.getSetCookie()) out.append("set-cookie", cookie);

  return new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const OPTIONS = forward;
export const HEAD = forward;
