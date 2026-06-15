import type { Page } from '@playwright/test';
import type { Persona } from '../../../framework/data/matrix.types';
import { getApiUrl } from '../../env';

export type TmdQuestion = {
  id: number;
  question: string;
  answer: string;
  role?: string;
  bondsubtype?: string;
};

export function filterFuneralDirectorFuneralBondQuestions(questions: TmdQuestion[]): TmdQuestion[] {
  return questions.filter(
    (q) => q.role === 'Funeral Director' && q.bondsubtype === 'Funeral Bond',
  );
}

export function filterClientFuneralBondQuestions(questions: TmdQuestion[]): TmdQuestion[] {
  return questions.filter((q) => q.role === 'Client' && q.bondsubtype === 'Funeral Bond');
}

export function filterTmdQuestionsForPersona(questions: TmdQuestion[], persona: Persona): TmdQuestion[] {
  if (persona === 'guest' || persona === 'investor') {
    return filterClientFuneralBondQuestions(questions);
  }
  return filterFuneralDirectorFuneralBondQuestions(questions);
}

export async function getPortalAccessToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const raw =
      sessionStorage.getItem('auth_session') ?? localStorage.getItem('auth_session');
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as { tokens?: { accessToken?: string } };
      return session.tokens?.accessToken ?? null;
    } catch {
      return null;
    }
  });
}

export async function fetchTmdQuestions(page: Page): Promise<TmdQuestion[]> {
  const base = getApiUrl().replace(/\/$/, '');
  const token = await getPortalAccessToken(page);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await page.request.get(`${base}/ki/tmd-questions`, { headers });
  if (!response.ok()) {
    throw new Error(`GET /ki/tmd-questions failed: ${response.status()} ${response.statusText()}`);
  }
  return response.json() as Promise<TmdQuestion[]>;
}

const PREPAID_FUNERAL_PATTERN = /pre-?paid funeral|more than one funeral bond/i;

export function isPrepaidFuneralQuestion(question: string): boolean {
  return PREPAID_FUNERAL_PATTERN.test(question);
}

export function parseTmdAnswersCsv(csv: string): Array<'yes' | 'no'> {
  return csv.split(',').map((part) => {
    const v = part.trim().toLowerCase();
    if (v !== 'yes' && v !== 'no') {
      throw new Error(`Invalid TMD answer "${part}". Use comma-separated yes/no values.`);
    }
    return v;
  });
}

export function tmdAnswersEnableConfirm(
  questions: TmdQuestion[],
  answers: Record<number, string>,
  bondSelected: boolean,
): boolean {
  if (!bondSelected) return false;
  return questions.every((item) => {
    const answer = answers[item.id];
    if (isPrepaidFuneralQuestion(item.question)) {
      return answer === 'yes' || answer === 'no';
    }
    return answer === item.answer;
  });
}

export const FALLBACK_FUNERAL_DIRECTOR_TMD: TmdQuestion[] = [
  {
    id: 1,
    question:
      'Is the client 10 years of age or older and is investing solely to cover future funeral costs?',
    answer: 'yes',
  },
  {
    id: 2,
    question: 'Do they currently have a pre-paid funeral, or more than one funeral bond?',
    answer: 'no',
  },
  {
    id: 3,
    question: 'Do they intend to contribute more than the actual or reasonable cost of a funeral?',
    answer: 'no',
  },
  {
    id: 4,
    question: 'Will they require access to the investment after the 30 day cooling off period?',
    answer: 'no',
  },
];

export const FALLBACK_CLIENT_FUNERAL_TMD: TmdQuestion[] = [
  {
    id: 1,
    question: 'Are you 10 years of age or older and investing solely to cover future funeral costs?',
    answer: 'yes',
  },
  {
    id: 2,
    question: 'Do you currently have a pre-paid funeral, or more than one funeral bond?',
    answer: 'no',
  },
  {
    id: 3,
    question: 'Do you intend to contribute more than the actual or reasonable cost of a funeral?',
    answer: 'no',
  },
  {
    id: 4,
    question: 'Will you require access to the investment after the 30 day cooling off period?',
    answer: 'no',
  },
];

export async function loadTmdQuestionsForPersona(page: Page, persona: Persona): Promise<TmdQuestion[]> {
  try {
    const filtered = filterTmdQuestionsForPersona(await fetchTmdQuestions(page), persona);
    if (filtered.length > 0) {
      return filtered;
    }
  } catch {
    // API unreachable — use seed fallback
  }
  return persona === 'guest' || persona === 'investor'
    ? FALLBACK_CLIENT_FUNERAL_TMD
    : FALLBACK_FUNERAL_DIRECTOR_TMD;
}
