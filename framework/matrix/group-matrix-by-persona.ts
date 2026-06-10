import type { Persona, MatrixRow } from '../data/matrix.types';

const PERSONA_ORDER: Persona[] = ['guest', 'investor', 'funeral', 'adviser', 'admin'];

/** Preserve Excel order within each persona bucket. */
export function groupMatrixRowsByPersona(rows: MatrixRow[]): Map<Persona, MatrixRow[]> {
  const groups = new Map<Persona, MatrixRow[]>();

  for (const row of rows) {
    const list = groups.get(row.persona) ?? [];
    list.push(row);
    groups.set(row.persona, list);
  }

  return groups;
}

export function orderedPersonaGroups(rows: MatrixRow[]): Array<[Persona, MatrixRow[]]> {
  const groups = groupMatrixRowsByPersona(rows);
  return PERSONA_ORDER.filter((persona) => groups.has(persona)).map((persona) => [
    persona,
    groups.get(persona)!,
  ]);
}

export function splitRowsByExpectedResult(rows: MatrixRow[]): {
  success: MatrixRow[];
  validationError: MatrixRow[];
} {
  return {
    success: rows.filter((row) => row.expectedResult === 'success'),
    validationError: rows.filter((row) => row.expectedResult === 'validation_error'),
  };
}

export function getPersonaGroupLabel(persona: Persona, rows: MatrixRow[]): string {
  const caseNos = rows.map((row) => row.caseNo).join(', ');
  return `[${persona}] ${rows.length} Excel row(s) — ${caseNos} (login once)`;
}
