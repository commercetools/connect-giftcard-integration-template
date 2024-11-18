import { MockGiftCardClientResult, GiftCardCodeType } from './types/mock-giftcard.client.type';
export class GiftCardClient {
  private static client: GiftCardClient;
  private currencyCode: string;
  private constructor(currencyCode: string) {
    this.currencyCode = currencyCode;
  }

  static init(currencyCode: string): GiftCardClient {
    if (this.client === undefined) {
      this.client = new GiftCardClient(currencyCode);
    }
    return this.client;
  }

  public balance(giftCardCode: string): MockGiftCardClientResult {
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
}
