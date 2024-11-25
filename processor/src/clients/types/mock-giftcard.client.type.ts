export type MockClientBalanceResponse = {
  message: string;
  code: string;
  amount?: {
    centAmount: number;
    currencyCode: string;
  };
};

export type MockClientRedeemRequest = {
  code: string;
  amount: {
    centAmount: number;
    currencyCode: string;
  };
};

export type MockClientRedeemResponse = {
  resultCode: string;
  redemptionReference?: string;
  code: string;
  amount: {
    centAmount: number;
    currencyCode: string;
  };
};

export type MockClientRollbackResponse = {
  result: string;
  id: string;
};

export enum GiftCardCodeType {
  EXPIRED = 'Expired',
  GENERIC_ERROR = 'GenericError',
  VALID = 'Valid',
  CURRENCY_NOT_MATCH = 'CurrencyNotMatch',
  NOT_FOUND = 'NotFound',
}
