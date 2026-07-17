import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { koboToNaira, nairaToKobo } from "../lib/money.js";
import { paymentProvider } from "../providers/payments.js";
import { completePayment } from "../services/payments.js";

export const paymentsRouter = Router();

paymentsRouter.post("/", async (req, res) => {
  const input = z.object({
    driverPublicId: z.string().min(1),
    amount: z.number().positive().max(1_000_000),
    description: z.string().trim().max(140).optional(),
    customerName: z.string().trim().min(2).max(100).default("FareGo Passenger"),
    customerEmail: z.string().email().default("passenger@farego.demo"),
    customerPhone: z.string().min(10).max(20).optional(),
  }).parse(req.body);

  const driver = await prisma.driver.findUnique({ where: { publicId: input.driverPublicId } });
  if (!driver) throw new AppError(404, "Driver not found", "DRIVER_NOT_FOUND");

  const payment = await prisma.payment.create({
    data: {
      orderId: `FG-${Date.now()}-${randomUUID().slice(0, 8)}`,
      driverId: driver.id,
      amountKobo: nairaToKobo(input.amount),
      description: input.description ?? null,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone ?? null,
      provider: paymentProvider.mode === "mock" ? "ALATPAY_MOCK" : "ALATPAY",
    },
  });

  const [firstName, ...lastNameParts] = input.customerName.split(" ");
  const checkout = await paymentProvider.createCheckout({
    paymentId: payment.id,
    orderId: payment.orderId,
    amount: input.amount,
    email: input.customerEmail,
    ...(input.customerPhone ? { phone: input.customerPhone } : {}),
    firstName: firstName || "FareGo",
    lastName: lastNameParts.join(" ") || "Passenger",
  });

  res.status(201).json({
    id: payment.id,
    orderId: payment.orderId,
    status: payment.status,
    amount: input.amount,
    checkout,
  });
});

paymentsRouter.post("/:id/mock-complete", async (req, res) => {
  if (paymentProvider.mode !== "mock") {
    throw new AppError(404, "Mock completion is disabled", "MOCK_DISABLED");
  }
  const payment = await completePayment(req.params.id, `mock-${req.params.id}`, { source: "mock" });
  res.json({ id: payment.id, status: payment.status, amount: koboToNaira(payment.amountKobo) });
});

paymentsRouter.get("/:id", async (req, res) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: { driver: { select: { publicId: true, fullName: true } } },
  });
  if (!payment) throw new AppError(404, "Payment not found", "PAYMENT_NOT_FOUND");
  res.json({
    id: payment.id,
    orderId: payment.orderId,
    amount: koboToNaira(payment.amountKobo),
    description: payment.description,
    status: payment.status,
    driver: payment.driver,
    completedAt: payment.completedAt,
  });
});
