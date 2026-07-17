import { createHash, randomBytes } from "node:crypto";

export const hashValue = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export const createOpaqueToken = () => randomBytes(32).toString("hex");
