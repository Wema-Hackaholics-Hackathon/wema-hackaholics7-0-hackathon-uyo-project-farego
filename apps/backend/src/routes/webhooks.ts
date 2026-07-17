import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { paymentProvider } from "../providers/payments.js";
import { completePayment } from "../services/payments.js";

export const webhooksRouter = Router();

webhooksRouter.post("/alatpay", async (req, res) => {
  const signature = req.header("x-alatpay-signature") || req.header("x-webhook-signature") || undefined;
  if (!paymentProvider.verifyWebhook(req.rawBody || Buffer.alloc(0), signature)) {
    throw new AppError(401, "Invalid webhook signature", "INVALID_WEBHOOK_SIGNATURE");
  }

  const data = req.body?.Value?.Data ?? req.body?.value?.data ?? req.body?.data ?? req.body;
  const event = z.object({
    OrderId: z.string().optional(),
    orderId: z.string().optional(),
    Id: z.string().optional(),
    id: z.string().optional(),
    TransactionId: z.string().optional(),
    transactionId: z.string().optional(),
    Status: z.string().optional(),
    status: z.string().optional(),
  }).passthrough().parse(data);

  const orderId = event.OrderId || event.orderId;
  const transactionId = event.TransactionId || event.transactionId || event.Id || event.id;
  const status = (event.Status || event.status || "").toLowerCase();
  if (!orderId || !transactionId) throw new AppError(400, "Webhook identifiers are missing", "INVALID_WEBHOOK");

  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) throw new AppError(404, "Payment not found", "PAYMENT_NOT_FOUND");

  if (status !== "completed" && status !== "successful" && status !== "success") {
    res.json({ received: true, completed: false });
    return;
  }

  if (!(await paymentProvider.verifyTransaction(transactionId))) {
    throw new AppError(409, "Provider could not verify this transaction", "PAYMENT_NOT_VERIFIED");
  }

  await completePayment(payment.id, transactionId, req.body as object);
  res.json({ received: true, completed: true });
});
