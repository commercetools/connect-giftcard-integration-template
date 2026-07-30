export interface GiftCardComponent {
  submit(opts: { amount?: Amount }): void;
  balance(): Promise<BalanceType>;
  mount(selector: string): void;
}

export type Amount = {
  centAmount: number;
  currencyCode: string;
};

export interface GiftCardBuilder {
  build(config: GiftCardOptions): GiftCardComponent;
}

export type GiftCardOptions = {
  onGiftCardReady?: () => Promise<void>;
  onValueChange?: (hasValue: boolean) => Promise<void>;
  onEnter?: () => Promise<void>;
};

export type BaseOptions = {
  sessionId: string;
  processorUrl: string;
  locale?: string;
  // The enabler always falls back to its own default handlers, so components
  // can rely on these being present.
  onComplete: (result: PaymentResult) => void;
  onError: (error: any) => void;
};

export type BalanceType = {
  status: {
    state: 'Valid' | 'NotFound' | 'Expired' | 'CurrencyNotMatch' | 'GenericError';
    errors?: {
      code: string;
      message: string;
    };
  };
  amount?: {
    centAmount: number;
    currencyCode: string;
  };
};

export type EnablerOptions = {
  processorUrl: string;
  sessionId: string;
  locale?: string;
  onComplete?: (result: PaymentResult) => void;
  onError?: (error: any) => void;
};

export type PaymentResult =
  | {
      isSuccess: true;
      paymentReference: string;
    }
  | { isSuccess: false };

export interface GiftCardEnabler {
  /**
   * @throws {Error}
   */
  createGiftCardBuilder: (type: string) => Promise<GiftCardBuilder | never>;
}
