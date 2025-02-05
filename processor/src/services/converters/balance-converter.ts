import { GiftCardCodeType, MockClientBalanceResponse } from '../../clients/types/mock-giftcard.client.type';
import { BalanceResponseSchemaDTO } from '../../dtos/mock-giftcards.dto';
import { MockCustomError } from '../../errors/mock-api.error';
export class BalanceConverter {
  public convert(opts: MockClientBalanceResponse): BalanceResponseSchemaDTO {
    switch (opts?.code) {
      case GiftCardCodeType.VALID:
        return {
          status: {
            state: GiftCardCodeType.VALID,
          },
          amount: {
            centAmount: opts?.amount!.centAmount,
            currencyCode: opts.amount!.currencyCode,
          },
        };

      case GiftCardCodeType.CURRENCY_NOT_MATCH:
        throw new MockCustomError({
          message: opts.message || 'Currency does not match',
          code: 400,
          key: GiftCardCodeType.CURRENCY_NOT_MATCH,
        });

      case GiftCardCodeType.EXPIRED:
        throw new MockCustomError({
          message: opts.message || 'Gift card is expired',
          code: 400,
          key: GiftCardCodeType.EXPIRED,
        });
      case GiftCardCodeType.NOT_FOUND:
        throw new MockCustomError({
          message: opts.message || 'Gift card is not found',
          code: 404,
          key: GiftCardCodeType.NOT_FOUND,
        });
      default:
        throw new MockCustomError({
          message: opts.message || 'An error happened during this requests',
          code: 400,
          key: GiftCardCodeType.GENERIC_ERROR,
        });
    }
  }
}
