import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import apiRouter from "./routes/api.routes";
import { errorHandler } from "./middleware/error.middleware";
import { getEnv } from "./config/env";

async function startServer(): Promise<void> {
  const required = [
    "ADMIN_PASSCODE",
    "JWT_SECRET",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_D1_DATABASE_ID",
    "CLOUDFLARE_API_TOKEN",
  ];
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}.`,
    );
  }
  if ((process.env.ADMIN_PASSCODE || "").trim().length < 8) {
    throw new Error("ADMIN_PASSCODE must be at least 8 characters.");
  }
  if ((process.env.JWT_SECRET || "").trim().length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters.");
  }
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.FRONTEND_URL?.trim()
  ) {
    throw new Error("FRONTEND_URL must be configured in production.");
  }

  const env = await getEnv();
  if (!env.DB) throw new Error("Cloudflare D1 is not configured.");

  const normalizeOrigin = (origin: string): string | null => {
    try {
      const { origin: normalizedOrigin } = new URL(origin.trim());
      return normalizedOrigin;
    } catch {
      return null;
    }
  };
  const allowedOrigins = new Set(
    (process.env.FRONTEND_URL || "")
      .split(",")
      .map((origin) => normalizeOrigin(origin))
      .filter((origin): origin is string => Boolean(origin)),
  );
  const isLocalDevOrigin = (origin: string): boolean => {
    try {
      const { hostname } = new URL(origin);
      const normalizedHostname = hostname.toLowerCase();
      return (
        process.env.NODE_ENV !== "production" &&
        (normalizedHostname === "localhost" ||
          normalizedHostname === "127.0.0.1" ||
          normalizedHostname === "::1" ||
          normalizedHostname === "[::1]" ||
          normalizedHostname.endsWith(".localhost"))
      );
    } catch {
      return false;
    }
  };
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
        if (!origin || allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin is not allowed by CORS."));
      },
    }),
  );
  app.use(express.json({ limit: "12mb" }));
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use(
    "/api/auth/login",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use(
    "/api/payments",
    rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 30,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use("/api", apiRouter);
  app.use("/api", (_req, res) => {
    res
      .status(404)
      .json({ success: false, message: "API endpoint not found." });
  });
  app.use(errorHandler);

  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => {
    console.log(`PRG Trust API listening on http://localhost:${port}`);
  });
}

void startServer().catch((error: unknown) => {
  console.error("Failed to start PRG Trust API:", error);
  process.exitCode = 1;
});
