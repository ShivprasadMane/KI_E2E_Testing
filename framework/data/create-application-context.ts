import type { CreateApplicationFormData } from '../../helpers/applications/create/form-data.types';

const context = new WeakMap<object, CreateApplicationRunContext>();

export type CreateApplicationRunContext = {
  data?: CreateApplicationFormData;
  applicationId?: string;
  referenceId?: string;
};

export function setCreateApplicationContext(
  page: object,
  patch: Partial<CreateApplicationRunContext>,
): CreateApplicationRunContext {
  const current = context.get(page) ?? {};
  const next = { ...current, ...patch };
  context.set(page, next);
  return next;
}

export function getCreateApplicationContext(page: object): CreateApplicationRunContext {
  return context.get(page) ?? {};
}
