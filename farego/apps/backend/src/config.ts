import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  PUBLIC_WEB_URL: z.string().default("http://localhost:3000"),
  MOCK_OTP_CODE: z.string().regex(/^\d{6}$/).default("123456"),
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(10),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
  PAYMENT_PROVIDER: z.enum(["mock", "alatpay"]).default("mock"),
  ALATPAY_PUBLIC_KEY: z.string().optional(),
  ALATPAY_SECRET_KEY: z.string().optional(),
  ALATPAY_BUSINESS_ID: z.string().optional(),
  ALATPAY_WEBHOOK_SECRET: z.string().optional(),
  ALATPAY_BASE_URL: z.string().url().default("https://apibox.alatpay.ng"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid backend environment", parsed.error.flatten().fieldErrors);
  throw new Error("Backend environment validation failed");
}

if (
  parsed.data.PAYMENT_PROVIDER === "alatpay" &&
  (!parsed.data.ALATPAY_PUBLIC_KEY ||
    !parsed.data.ALATPAY_SECRET_KEY ||
    !parsed.data.ALATPAY_BUSINESS_ID ||
    !parsed.data.ALATPAY_WEBHOOK_SECRET)
) {
  throw new Error("ALATPay mode requires all ALATPAY_* credentials");
}

export const env = parsed.data;
