import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config.js";

export type CheckoutInput = {
  paymentId: string;
  orderId: string;
  amount: number;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
};

export type CheckoutDetails = {
  mode: "mock" | "alatpay";
  publicKey?: string;
  businessId?: string;
};

export interface PaymentProvider {
  readonly mode: "mock" | "alatpay";
  createCheckout(input: CheckoutInput): Promise<CheckoutDetails>;
  verifyWebhook(rawBody: Buffer, signature?: string): boolean;
  verifyTransaction(transactionId: string): Promise<boolean>;
}

class MockAlatPayProvider implements PaymentProvider {
  readonly mode = "mock" as const;
  async createCheckout(): Promise<CheckoutDetails> {
    return { mode: this.mode };
  }
  verifyWebhook(): boolean {
    return true;
  }
  async verifyTransaction(): Promise<boolean> {
    return true;
  }
}

class LiveAlatPayProvider implements PaymentProvider {
  readonly mode = "alatpay" as const;

  async createCheckout(): Promise<CheckoutDetails> {
    return {
      mode: this.mode,
      publicKey: env.ALATPAY_PUBLIC_KEY!,
      businessId: env.ALATPAY_BUSINESS_ID!,
    };
  }

  verifyWebhook(rawBody: Buffer, signature?: string): boolean {
    if (!signature || !env.ALATPAY_WEBHOOK_SECRET) return false;
    const expected = createHmac("sha256", env.ALATPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
    const received = signature.replace(/^sha256=/, "");
    if (expected.length !== received.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  }

  async verifyTransaction(transactionId: string): Promise<boolean> {
    const response = await fetch(
      `${env.ALATPAY_BASE_URL}/alatpaytransaction/api/v1/transactions/${encodeURIComponent(transactionId)}`,
      { headers: { "Ocp-Apim-Subscription-Key": env.ALATPAY_SECRET_KEY! } },
    );
    if (!response.ok) return false;
    const result = (await response.json()) as { data?: { status?: string }; status?: boolean };
    return result.status === true && result.data?.status?.toLowerCase() === "completed";
  }
}

export const paymentProvider: PaymentProvider =
  env.PAYMENT_PROVIDER === "alatpay" ? new LiveAlatPayProvider() : new MockAlatPayProvider();
