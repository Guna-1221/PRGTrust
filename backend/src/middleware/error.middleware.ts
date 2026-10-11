import type { ErrorRequestHandler } from "express";
import multer from "multer";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  console.error("API request failed:", error);
  if (res.headersSent) return;

  const statusCode =
    error instanceof multer.MulterError
      ? 400
      : typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof error.statusCode === "number" &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ? error.statusCode
        : 500;
  const message = error instanceof Error ? error.message : "Request failed.";

  res.status(statusCode).json({
    success: false,
    message: statusCode < 500 ? message : "Internal server error.",
    error: statusCode < 500 ? message : "Internal server error.",
  });
};
