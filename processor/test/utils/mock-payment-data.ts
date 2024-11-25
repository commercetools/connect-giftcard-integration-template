import { Payment } from '@commercetools/connect-payments-sdk';

export const mockCreatePaymentResult: Payment = {
  id: '123456',
  version: 1,
  createdAt: '2024-01-01T00:00:00z',
  lastModifiedAt: '2024-01-01T00:00:00z',
  amountPlanned: {
    type: 'centPrecision',
    currencyCode: 'USD',
    centAmount: 100,
    fractionDigits: 2,
  },
  paymentMethodInfo: {
    paymentInterface: 'mock-giftcard-provider',
    method: 'giftcard',
  },

  paymentStatus: {},
  transactions: [],
  interfaceInteractions: [],
  anonymousId: '',
};




export const mockUpdatePaymentResult: Payment = {
  id: '123456',
  version: 3,
  interfaceId: 'mock-redemption-ref',
  createdAt: '2024-01-01T00:00:00z',
  lastModifiedAt: '2024-01-01T00:00:00z',
  amountPlanned: {
    type: 'centPrecision',
    currencyCode: 'USD',
    centAmount: 100,
    fractionDigits: 2,
  },
  paymentMethodInfo: { paymentInterface: 'mock-giftcard-provider', method: 'giftcard' },
  paymentStatus: {},
  transactions: [
    {
      id: '24680',
      type: 'Charge',
      amount: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 100,
        fractionDigits: 2,
      },
      interactionId: 'mock-redemption-ref',
      state: 'Success',
    },
  ],
  interfaceInteractions: [],
  anonymousId: '',
};

export const mockGetPaymentResultForRollbackRedemption: Payment = mockUpdatePaymentResult

export const mockUpdatePaymentResultForRollbackRedemption: Payment = {
  id: '123456',
  version: 3,
  interfaceId: 'mock-redemption-ref',
  createdAt: '2024-01-01T00:00:00z',
  lastModifiedAt: '2024-01-01T00:00:00z',
  amountPlanned: {
    type: 'centPrecision',
    currencyCode: 'USD',
    centAmount: 100,
    fractionDigits: 2,
  },
  paymentMethodInfo: { paymentInterface: 'mock-giftcard-provider', method: 'giftcard' },
  paymentStatus: {},
  transactions: [
    {
      id: '24680',
      type: 'Charge',
      amount: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 100,
        fractionDigits: 2,
      },
      interactionId: 'mock-redemption-ref',
      state: 'Success',
    },
    {
      id: '13579',
      type: 'refundPayment',
      amount: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 100,
        fractionDigits: 2,
      },
      interactionId: 'mock-redemption-ref',
      state: 'Success',
    },
  ],
  interfaceInteractions: [],
  anonymousId: '',
};
