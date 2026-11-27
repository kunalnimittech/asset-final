import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { ApiError } from "../utils/ApiError.js";

// Attaches req.user / req.session, or 401s if not signed in.
export async function requireAuth(req, _res, next) {
  const result = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!result) throw ApiError.unauthorized();
  req.user = result.user;
  req.session = result.session;
  next();
}

// Use after requireAuth: requireRole("admin"), requireRole("admin", "manager")
export const requireRole = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) throw ApiError.forbidden();
  next();
};
