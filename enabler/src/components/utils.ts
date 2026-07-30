import { GiftCardOptions } from '../providers/definitions';
import inputFieldStyles from '../style/inputField.module.scss';

export const getInput = (field: string) => document.querySelector(`#${field}`) as HTMLInputElement;

export const showError = (field: string, textContent: string) => {
  const parent = getInput(field).parentElement!;
  parent.classList.add(inputFieldStyles.error);
  const errorElement = parent.querySelector(`#${field} + .${inputFieldStyles.errorField}`)!;
  errorElement.textContent = textContent;
  errorElement.classList.remove(inputFieldStyles.hidden);
};

export const hideError = (field: string) => {
  const parent = getInput(field).parentElement!;
  parent.classList.remove(inputFieldStyles.error);
  const errorElement = parent.querySelector(`#${field} + .${inputFieldStyles.errorField}`)!;
  errorElement.textContent = '';
  errorElement.classList.add(inputFieldStyles.hidden);
};

export const fieldIds = {
  code: 'giftcard-code',
};

const handleChangeEvent = (field: string, onValueChange?: (hasValue: boolean) => Promise<void>) => {
  const input = getInput(field);
  if (input) {
    input.addEventListener('input', () => {
      onValueChange?.(input.value !== '');
    });
  }

  input.addEventListener('focusout', () => {
    const parent = input.parentElement!;
    input.value.length > 0
      ? parent.classList.add(inputFieldStyles.containValue)
      : parent.classList.remove(inputFieldStyles.containValue);
  });
};

export const addFormFieldsEventListeners = (giftcardOptions: GiftCardOptions) => {
  handleChangeEvent(fieldIds.code, giftcardOptions?.onValueChange);
  handleChangeEvent(fieldIds.code, async () => hideError(fieldIds.code));
  handleEnter(fieldIds.code, giftcardOptions?.onEnter);
};

type Res = {
  status: {
    state: string;
    errors?: {
      code: string;
      message: string;
    }[];
  };
  amount?: {
    centAmount: number;
    currencyCode: string;
  };
};

export const getErrorCode = (res: Res): string | null =>
  res.status.state !== 'Valid' ? res.status.errors?.[0].code || 'GenericError' : null;

export const handleEnter = (field: string, callback?: (e: Event) => void) => {
  getInput(field).addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      callback?.(e);
    }
  });
};
