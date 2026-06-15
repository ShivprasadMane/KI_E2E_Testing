export type FuneralBondType = 'NOMINATED' | 'PREPAID';

export const FUNERAL_BOND_TYPES: readonly FuneralBondType[] = ['NOMINATED', 'PREPAID'] as const;

export function normalizeFuneralBondType(value: string): FuneralBondType {
  const v = value.trim().toUpperCase();
  if (v === 'NOMINATED' || v === 'NOMINATED FUNERAL BOND') return 'NOMINATED';
  if (v === 'PREPAID' || v === 'PRE-PAID' || v === 'PREPAID FUNERAL BOND' || v === 'PRE-PAID FUNERAL BOND') {
    return 'PREPAID';
  }
  throw new Error(`Unknown funeral bond type "${value}". Use NOMINATED or PREPAID.`);
}

export function funeralBondRadioLabel(bondType: FuneralBondType): RegExp {
  return bondType === 'NOMINATED' ? /nominated funeral bond/i : /pre-?paid funeral bond/i;
}
