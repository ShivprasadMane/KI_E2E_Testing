import type { Persona } from '../data/matrix.types';
import {
  NAMED_WORKFLOWS,
  resolveApplicationsFullWorkflow,
  resolveClientsFullWorkflow,
  resolveDashboardFullWorkflow,
  resolvePoliciesFullWorkflow,
} from './workflow-definitions';

/** Split on >, |, comma, newline, or spaced dash (e.g. "Login - Dashboard"). */
const STEP_SEPARATORS = /\s*(?:>|[-–|]|,)\s*|\n+/;

/**
 * Expand a named workflow shortcut (e.g. "dashboard-full") to its full step chain.
 * `dashboard-full` uses the Persona column to pick the correct suite.
 */
export function expandNamedWorkflow(workflow: string, persona?: Persona): string {
  const key = workflow.trim().toLowerCase();

  if (key === 'dashboard-full') {
    if (!persona) {
      throw new Error('Workflow "dashboard-full" requires a Persona column value');
    }
    return resolveDashboardFullWorkflow(persona);
  }

  if (key === 'clients-full') {
    if (!persona) {
      throw new Error('Workflow "clients-full" requires a Persona column value');
    }
    return resolveClientsFullWorkflow(persona);
  }

  if (key === 'policies-full') {
    if (!persona) {
      throw new Error('Workflow "policies-full" requires a Persona column value');
    }
    return resolvePoliciesFullWorkflow(persona);
  }

  if (key === 'applications-full') {
    if (!persona) {
      throw new Error('Workflow "applications-full" requires a Persona column value');
    }
    return resolveApplicationsFullWorkflow(persona);
  }

  if (key === 'create-application-full' || key === 'create-application-tmd' || key === 'create-application-validation') {
    return NAMED_WORKFLOWS[key] ?? workflow;
  }

  return NAMED_WORKFLOWS[key] ?? workflow;
}

export function parseWorkflow(workflow: string, persona?: Persona): string[] {
  const expanded = expandNamedWorkflow(workflow, persona);
  return expanded
    .split(STEP_SEPARATORS)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function summarizeWorkflow(workflow: string, persona?: Persona): string {
  const steps = parseWorkflow(workflow, persona);
  return steps.join(' > ') || workflow;
}
