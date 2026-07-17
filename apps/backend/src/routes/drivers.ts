import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashValue } from "../lib/crypto.js";
import { AppError } from "../lib/errors.js";
import { koboToNaira } from "../lib/money.js";
import { requireDriver } from "../middleware/auth.js";
import { bankingProvider } from "../providers/banking.js";

export const driversRouter = Router();

const bearerToken = (header?: string) => header?.startsWith("Bearer ") ? header.slice(7) : undefined;

driversRouter.post("/register", async (req, res) => {
  const input = z.object({
    fullName: z.string().trim().min(3).max(100)
      .regex(/^[\p{L}][\p{L}' -]+$/u, "Name contains invalid characters")
      .refine((name) => name.split(/\s+/).length >= 2, "Enter first and last name"),
    email: z.string().email().optional(),
    consent: z.literal(true),
  }).parse(req.body);
  const token = bearerToken(req.header("authorization"));
  if (!token) throw new AppError(401, "Verified OTP session required", "UNAUTHENTICATED");

  const session = await prisma.authSession.findUnique({ where: { tokenHash: hashValue(token) } });
  if (!session || session.expiresAt <= new Date()) {
    throw new AppError(401, "Session is invalid or expired", "INVALID_SESSION");
  }
  if (session.driverId) throw new AppError(409, "Driver is already registered", "DRIVER_EXISTS");

  const existing = await prisma.driver.findUnique({ where: { phone: session.phone } });
  if (existing) throw new AppError(409, "Phone number is already registered", "DRIVER_EXISTS");

  const driverId = crypto.randomUUID();
  const account = await bankingProvider.createAccount({
    driverId,
    fullName: input.fullName,
    phone: session.phone,
  });

  const driver = await prisma.$transaction(async (tx) => {
    const created = await tx.driver.create({
      data: {
        id: driverId,
        fullName: input.fullName,
        phone: session.phone,
        email: input.email ?? null,
        consentedAt: new Date(),
        kycProfile: { create: {} },
        wallet: { create: account },
      },
      include: { kycProfile: true, wallet: true },
    });
    await tx.authSession.update({ where: { id: session.id }, data: { driverId: created.id } });
    return created;
  });

  res.status(201).json({
    driver: {
      publicId: driver.publicId,
      fullName: driver.fullName,
      phone: driver.phone,
      kycLevel: driver.kycProfile?.level,
      wallet: driver.wallet && {
        accountNumber: driver.wallet.accountNumber,
        accountName: driver.wallet.accountName,
        bankCode: driver.wallet.bankCode,
      },
    },
  });
});

driversRouter.get("/me", requireDriver, async (req, res) => {
  const driver = await prisma.driver.findUniqueOrThrow({
    where: { id: req.driver!.id },
    include: { kycProfile: true, wallet: true },
  });
  res.json({
    publicId: driver.publicId,
    fullName: driver.fullName,
    phone: driver.phone,
    email: driver.email,
    kycLevel: driver.kycProfile?.level,
    wallet: driver.wallet && {
      accountNumber: driver.wallet.accountNumber,
      accountName: driver.wallet.accountName,
      bankCode: driver.wallet.bankCode,
      balance: koboToNaira(driver.wallet.balanceKobo),
    },
  });
});

driversRouter.get("/me/dashboard", requireDriver, async (req, res) => {
  const driver = await prisma.driver.findUniqueOrThrow({
    where: { id: req.driver!.id },
    include: {
      kycProfile: true,
      wallet: true,
      payments: { where: { status: "COMPLETED" }, orderBy: { completedAt: "desc" }, take: 10 },
      notifications: { where: { channel: "IN_APP" }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  res.json({
    driver: { publicId: driver.publicId, fullName: driver.fullName, kycLevel: driver.kycProfile?.level },
    wallet: driver.wallet && {
      accountNumber: driver.wallet.accountNumber,
      accountName: driver.wallet.accountName,
      bankName: "Wema Bank",
      balance: koboToNaira(driver.wallet.balanceKobo),
    },
    transactions: driver.payments.map((payment) => ({
      id: payment.id,
      amount: koboToNaira(payment.amountKobo),
      description: payment.description || "Passenger fare",
      status: payment.status,
      createdAt: payment.completedAt || payment.createdAt,
    })),
    notifications: driver.notifications,
  });
});

driversRouter.get("/me/transactions", requireDriver, async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { driverId: req.driver!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(payments.map((payment) => ({
    id: payment.id,
    orderId: payment.orderId,
    amount: koboToNaira(payment.amountKobo),
    description: payment.description,
    status: payment.status,
    createdAt: payment.createdAt,
  })));
});

driversRouter.get("/:publicId", async (req, res) => {
  const driver = await prisma.driver.findUnique({
    where: { publicId: req.params.publicId },
    include: { kycProfile: true },
  });
  if (!driver) throw new AppError(404, "Driver not found", "DRIVER_NOT_FOUND");
  res.json({ publicId: driver.publicId, fullName: driver.fullName, kycLevel: driver.kycProfile?.level });
});
