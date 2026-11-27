import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// One place to read environment variables, with defaults.
export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  // Comma-separated list, e.g. "http://localhost:5173,https://assets.example.com"
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  databaseUrl: required("DATABASE_URL"),
  betterAuthSecret: required("BETTER_AUTH_SECRET"),
  // Better Auth Dash (dashboard / infra). Optional: without it the plugin stays off.
  betterAuthApiKey: process.env.BETTER_AUTH_API_KEY || "",
  // Single sign-on. A provider is switched on only when both its ID and secret are set.
  sso: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      // "common" = any work/school or personal account; use your tenant ID to restrict to NimitTech.
      tenantId: process.env.MICROSOFT_TENANT_ID || "common",
    },
    zoho: {
      clientId: process.env.ZOHO_CLIENT_ID,
      clientSecret: process.env.ZOHO_CLIENT_SECRET,
      // Zoho data centre: accounts.zoho.com (US), .in (India), .eu, .com.au, .jp ...
      accountsUrl: (process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com").replace(/\/$/, ""),
    },
  },
  betterAuthUrl: process.env.BETTER_AUTH_URL || `http://localhost:${Number(process.env.PORT) || 3000}`,
};

export const isDev = env.nodeEnv === "development";
