import { Router } from "express";
import { z } from "zod";
import { env } from "../config.js";
import { requestOtp, verifyOtp } from "../services/auth.js";

export const authRouter = Router();

const phoneSchema = z.object({ phone: z.string().min(10).max(20) });

authRouter.post("/otp/request", async (req, res) => {
  const { phone } = phoneSchema.parse(req.body);
  const result = await requestOtp(phone);
  res.status(201).json({
    ...result,
    ...(env.NODE_ENV !== "production" ? { demoCode: env.MOCK_OTP_CODE } : {}),
  });
});

authRouter.post("/otp/verify", async (req, res) => {
  const { phone, code } = phoneSchema.extend({ code: z.string().regex(/^\d{6}$/) }).parse(req.body);
  res.json(await verifyOtp(phone, code));
});
