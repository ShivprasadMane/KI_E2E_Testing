/** Portal shows currency like "$1,000.00"; Excel stores plain amounts like "1000". */
export function amountDisplayPattern(amount: string): RegExp {
  const value = Number(amount.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(value)) {
    return new RegExp(amount.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }

  const [intPart, decPart] = value.toFixed(2).split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const commaGroup = withCommas.replace(/,/g, ',?');
  return new RegExp(`(?:\\$\\s*)?(?:${commaGroup}|${intPart})\\.?${decPart}?`, 'i');
}
