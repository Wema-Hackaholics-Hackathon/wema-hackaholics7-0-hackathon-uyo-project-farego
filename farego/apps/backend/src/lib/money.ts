export const nairaToKobo = (amount: number) => BigInt(Math.round(amount * 100));

export const koboToNaira = (amount: bigint) => Number(amount) / 100;
