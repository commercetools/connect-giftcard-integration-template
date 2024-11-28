import { MockClientRedeemResponse } from '../../clients/types/mock-giftcard.client.type';

import { RedeemResponseDTO } from '../../dtos/mock-giftcards.dto';
import { Payment } from '@commercetools/connect-payments-sdk';

export class RedemptionConverter {
  public static convertMockClientResultCode(resultCode: string) {
    if (resultCode === 'SUCCESS') {
      return 'Success';
    } else if (resultCode === 'FAILURE') {
      return 'Failure';
    }
    return 'Initial';
  }

  public static convert(opts: {
    redemptionResult: MockClientRedeemResponse;
    paymentResult: Payment;
  }): RedeemResponseDTO {
    const redemptionResult = opts?.redemptionResult;
    return {
      result: this.convertMockClientResultCode(redemptionResult.resultCode || ''),
      paymentReference: opts?.paymentResult.id || '',
      redemptionId: redemptionResult.redemptionReference || '',
    };
  }
}
