import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";
import { hashValue } from "../lib/crypto.js";
import { AppError } from "../lib/errors.js";

export const requireDriver: RequestHandler = async (req, _res, next) => {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw new AppError(401, "Authentication required", "UNAUTHENTICATED");
  }

  const session = await prisma.authSession.findUnique({
    where: { tokenHash: hashValue(token) },
    include: { driver: true },
  });

  if (!session || session.expiresAt <= new Date() || !session.driver) {
    throw new AppError(401, "Session is invalid or expired", "INVALID_SESSION");
  }

  req.driver = session.driver;
  next();
};
