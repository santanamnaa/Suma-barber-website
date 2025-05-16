export const formatStats = {
  currency: (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },
  shortCurrency: (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
    return value.toString();
  },
  percentage: (value: number) => `${(value * 100).toFixed(1)}%`,
  number: (value: number) => new Intl.NumberFormat("id-ID").format(value),
  decimal: (value: number, digits = 1) =>
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value),
};