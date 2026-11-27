import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { dash } from "@better-auth/infra";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma-client.js";
import { env, isDev } from "../config/env.js";
import { DEFAULT_ROLE } from "../constants/roles.js";

const { google, microsoft, zoho } = env.sso;
const configured = (p) => Boolean(p.clientId && p.clientSecret);

// Which single sign-on providers have credentials. The frontend reads this
// (GET /api/auth-providers) to enable or disable its buttons.
export const enabledProviders = {
  google: configured(google),
  microsoft: configured(microsoft),
  zoho: configured(zoho),
};

const socialProviders = {};
if (enabledProviders.google) {
  socialProviders.google = {
    clientId: google.clientId,
    clientSecret: google.clientSecret,
    prompt: "select_account",
  };
}
if (enabledProviders.microsoft) {
  socialProviders.microsoft = {
    clientId: microsoft.clientId,
    clientSecret: microsoft.clientSecret,
    tenantId: microsoft.tenantId,
    prompt: "select_account",
  };
}

// Zoho isn't built into better-auth, so it is added as a generic OpenID Connect
// provider. It still signs in through the same signIn.social / callback routes.
const plugins = [];
if (enabledProviders.zoho) {
  plugins.push(
    genericOAuth({
      config: [
        {
          providerId: "zoho",
          name: "Zoho",
          clientId: zoho.clientId,
          clientSecret: zoho.clientSecret,
          discoveryUrl: `${zoho.accountsUrl}/.well-known/openid-configuration`,
          scopes: ["openid", "email", "profile"],
          prompt: "consent",
          accessType: "offline",
        },
      ],
    }),
  );
}

// Better Auth Dash: the hosted dashboard for users, sessions and sign-in
// activity. Only switched on when BETTER_AUTH_API_KEY is set.
if (env.betterAuthApiKey) {
  plugins.push(dash({ apiKey: env.betterAuthApiKey }));
}

export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // In development, trust any localhost port so the app still signs in when
  // Vite picks 5174/5175 or the page is opened on 127.0.0.1.
  trustedOrigins: [...env.corsOrigins, ...(isDev ? ["http://localhost:*", "http://127.0.0.1:*"] : [])],
  emailAndPassword: { enabled: true },
  socialProviders,
  plugins,
  account: {
    // Someone who signed up with email can later use Google/Microsoft/Zoho with
    // the same address and land in the same account (and vice versa).
    // updateUserInfoOnLink: when an existing (email) account is linked to a
    // provider, copy its profile photo and name onto the user. Email is never changed.
    accountLinking: { enabled: true, trustedProviders: ["google", "microsoft", "zoho"], updateUserInfoOnLink: true },
  },
  user: {
    additionalFields: {
      // input: false -> users can't pick their own role at sign-up.
      role: { type: "string", required: false, defaultValue: DEFAULT_ROLE, input: false },
    },
  },
});
