import { env } from "../config.js";
import { prisma } from "../lib/prisma.js";
import { createOpaqueToken, hashValue } from "../lib/crypto.js";
import { AppError } from "../lib/errors.js";

export const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
};

export const requestOtp = async (phone: string) => {
  const normalizedPhone = normalizePhone(phone);
  await prisma.otpChallenge.create({
    data: {
      phone: normalizedPhone,
      codeHash: hashValue(env.MOCK_OTP_CODE),
      expiresAt: new Date(Date.now() + env.OTP_TTL_MINUTES * 60_000),
    },
  });
  return { phone: normalizedPhone, expiresInSeconds: env.OTP_TTL_MINUTES * 60 };
};

export const verifyOtp = async (phone: string, code: string) => {
  const normalizedPhone = normalizePhone(phone);
  const challenge = await prisma.otpChallenge.findFirst({
    where: { phone: normalizedPhone, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge || challenge.expiresAt <= new Date()) {
    throw new AppError(400, "OTP is invalid or expired", "INVALID_OTP");
  }

  if (challenge.attempts >= 5) {
    throw new AppError(429, "Too many OTP attempts", "OTP_ATTEMPTS_EXCEEDED");
  }

  if (challenge.codeHash !== hashValue(code)) {
    await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    throw new AppError(400, "OTP is invalid or expired", "INVALID_OTP");
  }

  const driver = await prisma.driver.findUnique({ where: { phone: normalizedPhone } });
  const token = createOpaqueToken();

  await prisma.$transaction([
    prisma.otpChallenge.update({ where: { id: challenge.id }, data: { verifiedAt: new Date() } }),
    prisma.authSession.create({
      data: {
        tokenHash: hashValue(token),
        phone: normalizedPhone,
        driverId: driver?.id ?? null,
        expiresAt: new Date(Date.now() + env.SESSION_TTL_DAYS * 86_400_000),
      },
    }),
  ]);

  return { token, driverExists: Boolean(driver), driverPublicId: driver?.publicId ?? null };
};
