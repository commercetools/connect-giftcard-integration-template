import {
  MockClientBalanceResponse,
  MockClientRedeemRequest,
  MockClientRedeemResponse,
  GiftCardCodeType,
} from './types/mock-giftcard.client.type';
export class GiftCardClient {
  private currencyCode: string;
  public constructor(currencyCode: string) {
    this.currencyCode = currencyCode;
  }

  public async balance(giftCardCode: string): Promise<MockClientBalanceResponse> {
    /** In mock example, we categorize different use cases based on the input giftcard code
     *
     * "Valid-<amount>-<currency>" - It represents a valid giftcard with specified balance and currency.
     * "Expired" - The giftcard code represents an expired giftcard.
     * "GenericError" - It represents a giftcard code which leads to generic error from giftcard service provider.
     * "NotFound" - It represents a non-existing giftcard code.
     */
    const giftCardCodeBreakdown = giftCardCode.split('-');

    switch (giftCardCodeBreakdown[0]) {
      case GiftCardCodeType.EXPIRED:
        return {
          message: 'The giftcard is expired.',
          code: GiftCardCodeType.EXPIRED,
        };
      case GiftCardCodeType.GENERIC_ERROR:
        return {
          message: 'Generic error occurs.',
          code: GiftCardCodeType.GENERIC_ERROR,
        };
      case GiftCardCodeType.VALID: {
        if (giftCardCodeBreakdown.length != 3) break;

        const giftCardCentAmount = giftCardCodeBreakdown[1];
        const giftCardCurrencyCode = giftCardCodeBreakdown[2];

        if (this.currencyCode !== giftCardCurrencyCode) {
          return {
            message: 'Currency does not match.',
            code: GiftCardCodeType.CURRENCY_NOT_MATCH,
          };
        } else {
          return {
            message: 'The giftcard is valid.',
            code: GiftCardCodeType.VALID,
            amount: {
              centAmount: Number(giftCardCentAmount),
              currencyCode: giftCardCurrencyCode,
            },
          };
        }
      }
      default:
        break;
    }

    return {
      message: 'The giftcard is not found.',
      code: GiftCardCodeType.NOT_FOUND,
    };
  }
  public async redeem(request: MockClientRedeemRequest): Promise<MockClientRedeemResponse> {
    const giftCardCode = request.code;
    if (giftCardCode.split('-').length === 3 && giftCardCode.split('-')[0] === GiftCardCodeType.VALID)
      return {
        resultCode: 'SUCCESS',
        redemptionReference: 'mock-redemption-ref',
        code: request.code,
        amount: request.amount,
      };
    return {
      resultCode: 'FAILURE',
      redemptionReference: 'mock-redemption-ref',
      code: request.code,
      amount: request.amount,
    };
  }
}
