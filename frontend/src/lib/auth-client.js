import { createAuthClient } from "better-auth/react";

// Same origin as the page: in dev, Vite proxies /api/* to the Express backend,
// so the session cookie is first-party and no CORS setup is needed.
export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
});
