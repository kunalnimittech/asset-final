import { isDev } from "../config/env.js";

// Express 5 forwards thrown errors and rejected promises here automatically.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    error: {
      message: status >= 500 && !isDev ? "Internal server error" : err.message,
      ...(err.details && { details: err.details }),
      ...(isDev && status >= 500 && { stack: err.stack }),
    },
  });
}
