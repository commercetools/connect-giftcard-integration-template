export type MockGiftCardClientResult = {
  message: string;
  code: string;
  amount?: {
    centAmount: number;
    currencyCode: string;
  };
};

export enum GiftCardCodeType {
  EXPIRED = 'Expired',
  GENERIC_ERROR = 'GenericError',
  VALID = 'Valid',
  CURRENCY_NOT_MATCH = 'CurrencyNotMatch',
  NOT_FOUND = 'NotFound',
}
