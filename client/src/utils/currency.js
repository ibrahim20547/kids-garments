/**
 * Currency Formatting Utilities for Pakistan (PKR / ₨)
 */

export function formatPKR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₨ 0';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₨ ${numeric.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

export function formatPKRDecimals(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₨ 0.00';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₨ ${numeric.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export default formatPKR;
