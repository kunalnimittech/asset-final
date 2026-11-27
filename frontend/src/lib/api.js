// Small JSON client for the backend (/api is same-origin: Vite proxy in dev,
// api/proxy.js on Vercel). Throws an Error with the server's message.
export async function api(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Make sure the backend is running and try again.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const details = Array.isArray(data?.details) ? `: ${data.details.join(", ")}` : "";
    throw new Error((data?.message || `Request failed (${res.status})`) + details);
  }
  return data;
}
