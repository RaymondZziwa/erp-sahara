//@ts-nocheck
export const formatCurrencyOld = (
  amount: number | string,
  currency: string = "TZS",
  locale: string = "en-US"
): string => {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};
export const formatCurrency = (
  amount: number | string,
  currency: string = "TZS",
  locale: string = "en-US"
): string => {
  return amount
};
