import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { env, isDev } from "./config/env.js";
import { auth, enabledProviders } from "./lib/auth.js";
import routes from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// credentials: true so the browser sends/receives the auth session cookie.
const LOCALHOST = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
app.use(cors({ origin: isDev ? [...env.corsOrigins, LOCALHOST] : env.corsOrigins, credentials: true }));

// better-auth must come before express.json() — it reads the raw body itself.
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

// Which sign-in methods are switched on, so the login page can show them.
app.get("/api/auth-providers", (req, res) => {
  res.json({ emailPassword: true, ...enabledProviders });
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is healthy" });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
