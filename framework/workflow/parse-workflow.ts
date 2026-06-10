import { NAMED_WORKFLOWS } from './workflow-definitions';

/** Split on >, |, comma, newline, or spaced dash (e.g. "Login - Dashboard"). */
const STEP_SEPARATORS = /\s*(?:>|[-–|]|,)\s*|\n+/;

/**
 * Expand a named workflow shortcut (e.g. "dashboard-full") to its full step chain.
 * If the value is not a recognised shortcut, it is returned as-is.
 */
export function expandNamedWorkflow(workflow: string): string {
  const key = workflow.trim().toLowerCase();
  return NAMED_WORKFLOWS[key] ?? workflow;
}

export function parseWorkflow(workflow: string): string[] {
  const expanded = expandNamedWorkflow(workflow);
  return expanded
    .split(STEP_SEPARATORS)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function summarizeWorkflow(workflow: string): string {
  const steps = parseWorkflow(workflow);
  return steps.join(' > ') || workflow;
}
