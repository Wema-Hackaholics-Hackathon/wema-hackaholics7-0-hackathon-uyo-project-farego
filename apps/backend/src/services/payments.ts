import { LedgerEntryType, PaymentStatus } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { koboToNaira } from "../lib/money.js";
import { notificationProvider } from "../providers/notifications.js";

export const completePayment = async (
  paymentId: string,
  providerTransactionId: string,
  providerPayload?: object,
) => {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { driver: { include: { wallet: true } } },
    });

    if (!payment) throw new AppError(404, "Payment not found", "PAYMENT_NOT_FOUND");
    if (!payment.driver.wallet) throw new AppError(409, "Driver wallet is unavailable", "WALLET_UNAVAILABLE");
    if (payment.status === PaymentStatus.COMPLETED) return { payment, credited: false };
    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError(409, "Only pending payments can be completed", "INVALID_PAYMENT_STATE");
    }

    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: PaymentStatus.PENDING },
      data: {
        status: PaymentStatus.COMPLETED,
        completedAt: new Date(),
        providerTransactionId,
        ...(providerPayload ? { providerPayload } : {}),
      },
    });

    if (claimed.count === 0) {
      const current = await tx.payment.findUniqueOrThrow({ where: { id: payment.id } });
      return { payment: current, credited: false };
    }

    await tx.ledgerEntry.create({
      data: {
        walletId: payment.driver.wallet.id,
        paymentId: payment.id,
        type: LedgerEntryType.CREDIT,
        amountKobo: payment.amountKobo,
        description: payment.description || "Passenger fare",
      },
    });

    await tx.walletAccount.update({
      where: { id: payment.driver.wallet.id },
      data: { balanceKobo: { increment: payment.amountKobo } },
    });

    return {
      payment: await tx.payment.findUniqueOrThrow({ where: { id: payment.id } }),
      credited: true,
    };
  });

  if (result.credited) {
    await notificationProvider.sendPaymentAlert({
      driverId: result.payment.driverId,
      title: "Fare received",
      message: `You received ₦${koboToNaira(result.payment.amountKobo).toLocaleString("en-NG")}`,
    });
  }

  return result.payment;
};
