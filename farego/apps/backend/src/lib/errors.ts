import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = "REQUEST_ERROR",
  ) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "Route not found", "NOT_FOUND"));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof AppError) {
    res
      .status(error.statusCode)
      .json({ error: error.message, code: error.code });
    return;
  }

  console.error(error);
  res
    .status(500)
    .json({ error: "Internal server error", code: "INTERNAL_ERROR" });
};
