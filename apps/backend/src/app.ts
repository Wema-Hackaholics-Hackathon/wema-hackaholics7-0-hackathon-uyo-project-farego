import express, { type Request } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config.js";
import { prisma } from "./lib/prisma.js";
import { authRouter } from "./routes/auth.js";
import { driversRouter } from "./routes/drivers.js";
import { paymentsRouter } from "./routes/payments.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { errorHandler, notFoundHandler } from "./lib/errors.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN.split(",").map((origin) => origin.trim()) }));
app.use(express.json({
  limit: "1mb",
  verify: (req, _res, buffer) => {
    (req as Request).rawBody = Buffer.from(buffer);
  },
}));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/ready", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ready" });
});

app.use("/api/auth", authRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/webhooks", webhooksRouter);
app.use(notFoundHandler);
app.use(errorHandler);
