import { describe, test, expect, afterEach, jest, beforeEach } from '@jest/globals';
import { paymentSDK } from '../src/payment-sdk';
import { MockGiftCardService, MockGiftCardServiceOptions } from '../src/services/mock-giftcard.service';
import { DefaultCartService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-cart.service';
import { DefaultPaymentService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-payment.service';
import { mockGetCartResult, mockGetPaymentAmount } from './utils/mock-cart-data';
import {
  mockUpdatePaymentResult,
  mockCreatePaymentResult,
  mockGetPaymentResultForRollbackRedemption,
  mockUpdatePaymentResultForRollbackRedemption,
} from './utils/mock-payment-data';
import { GiftCardCodeType } from '../src/clients/types/mock-giftcard.client.type';
import { RedeemRequestDTO } from '../src/dtos/mock-giftcards.dto';
import { MockCustomError } from '../src/errors/mock-api.error';
import { ModifyPayment } from '../src/services/types/operation.type';

import crypto from 'crypto';
describe('mock-giftcard.service', () => {
  // Please customize test cases below
  const opts: MockGiftCardServiceOptions = {
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
    ctOrderService: paymentSDK.ctOrderService,
  };
  const mockGiftCardService: MockGiftCardService = new MockGiftCardService(opts);
  beforeEach(() => {
    jest.setTimeout(10000);
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('When checking balance by inputting valid giftcard, it should return status as Valid', async () => {
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockReturnValue(Promise.resolve(mockGetPaymentAmount));

    const result = await mockGiftCardService.balance('Valid-100-USD');
    expect(result.status).toBeDefined();
    expect(result.status.state).toStrictEqual(GiftCardCodeType.VALID);
    expect(result.amount).toBeDefined();
    expect(result.amount.centAmount).toStrictEqual(100);
    expect(result.amount.currencyCode).toStrictEqual('USD');
  });

  test('When checking balance by inputting giftcard with wrong currency code', async () => {
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockReturnValue(Promise.resolve(mockGetPaymentAmount));
    try {
      await mockGiftCardService.balance('Valid-100-EUR');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(MockCustomError);

      expect((error as MockCustomError).code).toStrictEqual(GiftCardCodeType.CURRENCY_NOT_MATCH);
      expect((error as MockCustomError).httpErrorStatus).toStrictEqual(400);
      expect((error as MockCustomError).message).toStrictEqual('Currency does not match.');
    }
  });
  test('When checking balance by inputting an expired giftcard, it should throw error with Expired code', async () => {
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockReturnValue(Promise.resolve(mockGetPaymentAmount));
    try {
      await mockGiftCardService.balance('Expired');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(MockCustomError);

      expect((error as MockCustomError).code).toStrictEqual(GiftCardCodeType.EXPIRED);
      expect((error as MockCustomError).httpErrorStatus).toStrictEqual(400);
      expect((error as MockCustomError).message).toStrictEqual('The giftcard is expired.');
    }
  });
  test('When checking balance by inputting an errorneous giftcard, it should throw error with GenericError code', async () => {
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockReturnValue(Promise.resolve(mockGetPaymentAmount));
    try {
      await mockGiftCardService.balance('GenericError');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(MockCustomError);

      expect((error as MockCustomError).code).toStrictEqual(GiftCardCodeType.GENERIC_ERROR);
      expect((error as MockCustomError).httpErrorStatus).toStrictEqual(400);
      expect((error as MockCustomError).message).toStrictEqual('Generic error occurs.');
    }
  });
  test('When checking balance by inputting a non-existing giftcard, it should throw error with NotFound code', async () => {
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockReturnValue(Promise.resolve(mockGetPaymentAmount));
    try {
      await mockGiftCardService.balance('123ABC');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(MockCustomError);

      expect((error as MockCustomError).code).toStrictEqual(GiftCardCodeType.NOT_FOUND);
      expect((error as MockCustomError).httpErrorStatus).toStrictEqual(404);
      expect((error as MockCustomError).message).toStrictEqual('The giftcard is not found.');
    }
  });
  test('When redeeming a valid giftcard, it should return Success as result', async () => {
    const dummyUUID = 'It-is-a-dummy-uuid';
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockReturnValue(Promise.resolve(mockGetPaymentAmount));
    jest.spyOn(DefaultCartService.prototype, 'addPayment').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(dummyUUID);

    jest
      .spyOn(DefaultPaymentService.prototype, 'createPayment')
      .mockReturnValue(Promise.resolve(mockCreatePaymentResult));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));

    const opts: RedeemRequestDTO = {
      code: 'Valid-100-USD',
      redeemAmount: {
        centAmount: 100,
        currencyCode: 'USD',
      },
    };
    const result = await mockGiftCardService.redeem({ data: opts });
    expect(result.result).toBeDefined();
    expect(result.paymentId).toBeDefined();
    expect(result.redemptionId).toBeDefined();
    expect(result.result).toStrictEqual('Success');
    expect(result.paymentId).toStrictEqual('123456');
    expect(result.redemptionId).toStrictEqual(dummyUUID);
  });
  test('when redeeming giftcard with wrong currency, it should throw error with code CuurencyNotMatch', async () => {
    const dummyUUID = 'It-is-a-dummy-uuid';
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockReturnValue(Promise.resolve(mockGetPaymentAmount));
    jest.spyOn(DefaultCartService.prototype, 'addPayment').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(dummyUUID);

    jest
      .spyOn(DefaultPaymentService.prototype, 'createPayment')
      .mockReturnValue(Promise.resolve(mockCreatePaymentResult));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));

    const opts: RedeemRequestDTO = {
      code: 'Valid-100-EUR',
      redeemAmount: {
        centAmount: 100,
        currencyCode: 'EUR',
      },
    };
    try {
      await mockGiftCardService.redeem({ data: opts });
    } catch (error) {
      expect(error).toBeInstanceOf(MockCustomError);
      expect((error as MockCustomError).code).toBeDefined();
      expect((error as MockCustomError).httpErrorStatus).toBeDefined();
      expect((error as MockCustomError).message).toBeDefined();
      expect((error as MockCustomError).code).toStrictEqual(GiftCardCodeType.CURRENCY_NOT_MATCH);
      expect((error as MockCustomError).httpErrorStatus).toStrictEqual(400);
      expect((error as MockCustomError).message).toStrictEqual('cart and gift card currency do not match');
    }
  });
  test('when redeem giftcard with correct currency but failed the redemption, it should return Failure as result', async () => {
    const dummyUUID = 'It-is-a-dummy-uuid';
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockReturnValue(Promise.resolve(mockGetPaymentAmount));
    jest.spyOn(DefaultCartService.prototype, 'addPayment').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(dummyUUID);

    jest
      .spyOn(DefaultPaymentService.prototype, 'createPayment')
      .mockReturnValue(Promise.resolve(mockCreatePaymentResult));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResult));

    const opts: RedeemRequestDTO = {
      code: 'Valid-0-USD',
      redeemAmount: {
        centAmount: 0,
        currencyCode: 'USD',
      },
    };
    const result = await mockGiftCardService.redeem({ data: opts });
    expect(result.result).toBeDefined();
    expect(result.paymentId).toBeDefined();
    expect(result.redemptionId).toBeDefined();
    expect(result.result).toStrictEqual('Failure');
    expect(result.paymentId).toStrictEqual('123456');
    expect(result.redemptionId).toStrictEqual('');
  });

  test('when refund giftcard successfully, it should return approved as outcome', async () => {
    const modifyPaymentOpts: ModifyPayment = {
      paymentId: 'dummy-paymentId',
      data: {
        actions: [
          {
            action: 'refundPayment',
            amount: {
              centAmount: 150000,
              currencyCode: 'USD',
            },
          },
        ],
      },
    };
    jest
      .spyOn(DefaultPaymentService.prototype, 'getPayment')
      .mockReturnValue(Promise.resolve(mockGetPaymentResultForRollbackRedemption));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResultForRollbackRedemption));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResultForRollbackRedemption));

    const result = await mockGiftCardService.modifyPayment(modifyPaymentOpts);
    expect(result?.outcome).toStrictEqual('approved');
  });

  test('when refund giftcard failed, it should return rejected as outcome', async () => {
    const modifyPaymentOpts: ModifyPayment = {
      paymentId: 'dummy-paymentId',
      data: {
        actions: [
          {
            action: 'refundPayment',
            amount: {
              centAmount: 150000,
              currencyCode: 'USD',
            },
          },
        ],
      },
    };
    // Mock a payment result with invalid redemption reference from giftcard service provider
    const mockPaymentWithIncorrectRedemptionRef = {
      ...mockGetPaymentResultForRollbackRedemption,
      interfaceId: 'ABCDEF',
    };

    jest
      .spyOn(DefaultPaymentService.prototype, 'getPayment')
      .mockReturnValue(Promise.resolve(mockPaymentWithIncorrectRedemptionRef));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResultForRollbackRedemption));
    jest
      .spyOn(DefaultPaymentService.prototype, 'updatePayment')
      .mockReturnValue(Promise.resolve(mockUpdatePaymentResultForRollbackRedemption));

    const result = await mockGiftCardService.modifyPayment(modifyPaymentOpts);
    expect(result?.outcome).toStrictEqual('rejected');
  });
});
