import { expect, type Locator } from '@playwright/test';

/** Parse portal currency text (`$1,000.00`, `1,000`) to a number. */
export function parseNumericInput(value: string): number {
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * MUI + react-hook-form inputs ignore plain `.fill()`.
 * Real keystrokes through the focused field trigger investOptions `initialContributionAmt` onChange.
 */
export async function setReactControlledInput(input: Locator, value: string): Promise<void> {
  const expected = parseNumericInput(value);
  if (Number.isNaN(expected)) {
    throw new Error(`Invalid numeric input value: "${value}"`);
  }

  await input.waitFor({ state: 'visible', timeout: 30_000 });
  await expect(input).toBeEditable({ timeout: 30_000 });

  const typeSequentially = async () => {
    await input.click({ clickCount: 3 });
    await input.press('Backspace');
    await input.pressSequentially(value, { delay: 50 });
    await input.press('Tab');
  };

  const typeLikeUser = async () => {
    await input.click({ clickCount: 3 });
    await input.press('Backspace');
    await input.page().keyboard.insertText(value);
    await input.press('Tab');
  };

  const applyNativeSetter = async () => {
    await input.evaluate((element, val) => {
      const el = element as HTMLInputElement & { _valueTracker?: { setValue: (v: string) => void } };
      el.focus();
      el._valueTracker?.setValue('');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(el, val);
      el.dispatchEvent(
        new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertFromPaste', data: val }),
      );
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    await input.blur();
  };

  for (const strategy of [typeSequentially, typeLikeUser, applyNativeSetter]) {
    await strategy();
    if (parseNumericInput(await input.inputValue()) === expected) {
      return;
    }
  }

  await expect.poll(async () => parseNumericInput(await input.inputValue()), { timeout: 20_000 }).toBe(
    expected,
  );
}
