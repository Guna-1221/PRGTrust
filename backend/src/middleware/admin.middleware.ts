import type { Request, RequestHandler } from "express";
import { authenticateRequest } from "../services/auth.service";

function toWebRequest(req: Request): globalThis.Request {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }
  return new globalThis.Request(
    `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    {
      headers,
    },
  );
}

export const requireAdmin: RequestHandler = (req, res, next) => {
  void authenticateRequest(toWebRequest(req)).then((auth) => {
    if (!auth.authenticated) {
      res.status(401).json({
        success: false,
        message: auth.error || "Unauthorized.",
        error: auth.error || "Unauthorized.",
      });
      return;
    }
    next();
  }, next);
};
