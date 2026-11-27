import "dotenv/config";

// One place to read environment variables, with defaults.
export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};

export const isDev = env.nodeEnv === "development";
