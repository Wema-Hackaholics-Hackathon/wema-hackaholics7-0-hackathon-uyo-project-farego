import { createHash } from "node:crypto";

export type BankAccountInput = {
  driverId: string;
  fullName: string;
  phone: string;
};

export type IssuedBankAccount = {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  provider: string;
  providerReference: string;
};

export interface BankingProvider {
  createAccount(input: BankAccountInput): Promise<IssuedBankAccount>;
}

class MockWemaBankingProvider implements BankingProvider {
  async createAccount(input: BankAccountInput): Promise<IssuedBankAccount> {
    const digits = createHash("sha256")
      .update(`${input.driverId}:${input.phone}`)
      .digest("hex")
      .replace(/[^0-9]/g, "")
      .padEnd(10, "0")
      .slice(0, 10);

    return {
      accountNumber: `9${digits.slice(1)}`,
      accountName: input.fullName.toUpperCase(),
      bankCode: "035",
      provider: "WEMA_MOCK",
      providerReference: `mock-wema-${input.driverId}`,
    };
  }
}

export const bankingProvider: BankingProvider = new MockWemaBankingProvider();
