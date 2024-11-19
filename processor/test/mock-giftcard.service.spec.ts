import { describe, test, expect, afterEach, jest, beforeEach } from '@jest/globals';
import { paymentSDK } from '../src/payment-sdk';
import { MockGiftCardService, MockGiftCardServiceOptions } from '../src/services/mock-giftcard.service';
import { DefaultCartService } from '@commercetools/connect-payments-sdk/dist/commercetools/services/ct-cart.service';
import { mockGetCartResult, mockGetPaymentAmount } from './utils/mock-cart-data';
import { GiftCardCodeType } from '../src/clients/types/mock-giftcard.client.type';
import { MockCustomError } from '../src/errors/mock-api.error';
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

  test('input valid giftcard', async () => {
    jest.spyOn(DefaultCartService.prototype, 'getCart').mockReturnValue(Promise.resolve(mockGetCartResult()));
    jest.spyOn(DefaultCartService.prototype, 'getPaymentAmount').mockReturnValue(Promise.resolve(mockGetPaymentAmount));

    const result = await mockGiftCardService.balance('Valid-100-USD');
    expect(result.status).toBeDefined();
    expect(result.status.state).toStrictEqual(GiftCardCodeType.VALID);
    expect(result.amount).toBeDefined();
    expect(result.amount.centAmount).toStrictEqual(100);
    expect(result.amount.currencyCode).toStrictEqual('USD');
  });

  test('input giftcard with wrong currency code', async () => {
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
  test('input expired giftcard', async () => {
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
  test('input expired giftcard', async () => {
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
  test('input non-existing giftcard', async () => {
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
});
