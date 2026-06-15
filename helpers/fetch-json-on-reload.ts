import type { Page, Response } from '@playwright/test';

function listenForJson<T>(
  page: Page,
  match: (response: Response) => boolean,
  timeout: number,
  gate: () => boolean,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      page.off('response', onResponse);
      clearTimeout(timer);
    };

    const onResponse = (response: Response): void => {
      if (settled || !gate() || !match(response)) return;

      void response
        .json()
        .then((data) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(data as T);
        })
        .catch(() => {
          // Body evicted during navigation — wait for the next matching response.
        });
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`Timed out after ${timeout}ms waiting for matching API response`));
    }, timeout);

    page.on('response', onResponse);
  });
}

/**
 * Wait for an API response during reload and parse JSON in the response handler.
 * Avoids CDP "No resource with given identifier" when reload races response.json().
 */
export async function fetchJsonOnReload<T>(
  page: Page,
  match: (response: Response) => boolean,
  options?: { timeout?: number },
): Promise<T> {
  const timeout = options?.timeout ?? 60_000;
  let acceptResponses = false;

  const dataPromise = listenForJson<T>(page, match, timeout, () => acceptResponses);

  acceptResponses = true;
  await page.reload({ waitUntil: 'domcontentloaded' });

  const data = await dataPromise;
  await page.getByText('Loading...').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});

  return data;
}

/** Same as fetchJsonOnReload but triggers a user action instead of reload. */
export async function fetchJsonOnAction<T>(
  page: Page,
  match: (response: Response) => boolean,
  action: () => Promise<void>,
  options?: { timeout?: number },
): Promise<T> {
  const timeout = options?.timeout ?? 60_000;
  let acceptResponses = false;

  const dataPromise = listenForJson<T>(page, match, timeout, () => acceptResponses);

  acceptResponses = true;
  await action();

  return dataPromise;
}
