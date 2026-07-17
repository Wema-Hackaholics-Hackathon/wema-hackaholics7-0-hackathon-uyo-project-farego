import type { Driver } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      driver?: Driver;
      rawBody?: Buffer;
    }
  }
}

export {};
