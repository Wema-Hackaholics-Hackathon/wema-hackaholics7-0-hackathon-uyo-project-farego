import { NotificationChannel, NotificationStatus } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export type PaymentNotification = {
  driverId: string;
  title: string;
  message: string;
};

export interface NotificationProvider {
  sendPaymentAlert(input: PaymentNotification): Promise<void>;
}

class MockNotificationProvider implements NotificationProvider {
  async sendPaymentAlert(input: PaymentNotification) {
    await prisma.notification.createMany({
      data: [
        { ...input, channel: NotificationChannel.IN_APP, status: NotificationStatus.SENT, sentAt: new Date() },
        { ...input, channel: NotificationChannel.SMS, status: NotificationStatus.SENT, sentAt: new Date() },
        { ...input, channel: NotificationChannel.FCM, status: NotificationStatus.SENT, sentAt: new Date() },
      ],
    });

    console.info(`[mock-notification] ${input.title}: ${input.message}`);
  }
}

export const notificationProvider: NotificationProvider = new MockNotificationProvider();
