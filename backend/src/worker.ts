import { handleAsNodeRequest } from "cloudflare:node";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { withWorkerBindings } from "./config/env";
import apiRouter from "./routes/api.routes";
import { errorHandler } from "./middleware/error.middleware";

function workerRateLimit(
  limit: number,
  windowMs: number,
): express.RequestHandler {
  const requests = new Map<string, { count: number; resetAt: number }>();
  return (req, res, next) => {
    const clientIp =
      req.get("cf-connecting-ip") ||
      req.get("x-forwarded-for")?.split(",")[0].trim() ||
      "unknown";
    const now = Date.now();
    let entry = requests.get(clientIp);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
    }

    entry.count++;
    requests.delete(clientIp);
    requests.set(clientIp, entry);
    if (requests.size > 10_000) {
      const oldestClient = requests.keys().next().value;
      if (oldestClient !== undefined) requests.delete(oldestClient);
    }

    const remaining = Math.max(0, limit - entry.count);
    const resetSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader(
      "RateLimit",
      `limit=${limit}, remaining=${remaining}, reset=${resetSeconds}`,
    );
    res.setHeader(
      "RateLimit-Policy",
      `${limit};w=${Math.ceil(windowMs / 1000)}`,
    );

    if (entry.count > limit) {
      res.setHeader("Retry-After", String(resetSeconds));
      res
        .status(429)
        .json({ error: "Too many requests, please try again later." });
      return;
    }

    next();
  };
}

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      const allowedOrigins = (process.env.FRONTEND_URL || "")
        .split(",")
        .map((value) => value.trim().replace(/\/$/, ""))
        .filter(Boolean);

      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(new Error("Origin is not allowed by CORS."));
      }
    },
  }),
);

app.use(express.json({ limit: "12mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth/login", workerRateLimit(10, 15 * 60 * 1000));

app.use("/api/payments", workerRateLimit(30, 60 * 60 * 1000));

app.use("/api", apiRouter);
app.use("/api", (_req, res) =>
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  }),
);
app.use(errorHandler);
app.listen(3000);

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return withWorkerBindings(env, () => handleAsNodeRequest(3000, request));
  },
};