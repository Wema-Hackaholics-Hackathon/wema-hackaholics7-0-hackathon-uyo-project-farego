export const isNigerianPhone = (value: string) =>
  /^(?:\+234|234|0)[789]\d{9}$/.test(value.replace(/[\s()-]/g, ""));

export const isFullName = (value: string) => {
  const name = value.trim().replace(/\s+/g, " ");
  return name.length >= 3 && name.length <= 100 && name.split(" ").length >= 2 && /^[\p{L}][\p{L}' -]+$/u.test(name);
};

export const isWemaAccount = (value: string) => /^\d{10}$/.test(value);
export const isOtp = (value: string) => /^\d{6}$/.test(value);

export const validMoneyAmount = (value: string | number, maximum: number) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= maximum && Math.round(amount * 100) === amount * 100;
};

export const isIdentityNumber = (value: string) => /^\d{11}$/.test(value);
export const isPlateNumber = (value: string) => /^[A-Z]{2,3}[- ]?\d{2,3}[- ]?[A-Z]{2}$/i.test(value.trim());
export const isAddress = (value: string) => value.trim().length >= 10 && value.trim().length <= 160;
export const isOrganizationName = (value: string) => value.trim().length >= 3 && value.trim().length <= 100;
