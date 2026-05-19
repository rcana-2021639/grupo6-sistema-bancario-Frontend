export const CURRENCY_SYMBOLS = {
  GTQ: 'Q',
  MXN: '$',
  COP: '$',
  USD: '$',
  EUR: 'EUR',
  HNL: 'L',
  PEN: 'S/',
  JPY: 'JPY',
};

export const getCurrencySymbol = (currency = 'GTQ') => CURRENCY_SYMBOLS[currency] || currency || 'GTQ';

export const formatMoney = (value, currency = 'GTQ') => (
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: currency || 'GTQ',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
);

const compactFormatter = new Intl.NumberFormat('es-GT', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const compactUnits = [
  { value: 1_000_000_000, suffix: 'B' },
  { value: 1_000_000, suffix: 'M' },
  { value: 1_000, suffix: 'K' },
];

export const formatCompactMoney = (value, currency = 'GTQ') => {
  const amount = Number(value || 0);
  const absoluteAmount = Math.abs(amount);
  const symbol = getCurrencySymbol(currency);
  const sign = amount < 0 ? '-' : '';
  const unit = compactUnits.find((item) => absoluteAmount >= item.value);

  if (!unit) {
    return formatMoney(amount, currency);
  }

  return `${sign}${symbol} ${compactFormatter.format(absoluteAmount / unit.value)}${unit.suffix}`;
};

export const getMoneyTitle = (value, currency = 'GTQ') => formatMoney(value, currency);
