import { MockClientRedeemResponse } from '../../clients/types/mock-giftcard.client.type';

import { RedeemResponseDTO } from '../../dtos/mock-giftcards.dto';
import { Payment } from '@commercetools/connect-payments-sdk';

export class RedemptionConverter {
  public convertMockClientResultCode(resultCode: string) {
    if (resultCode === 'SUCCESS') {
      return 'Success';
    } else if (resultCode === 'FAILURE') {
      return 'Failure';
    }
    return 'Initial';
  }

  public convert(opts: {
    redemptionResult: MockClientRedeemResponse;
    createPaymentResult: Payment;
  }): RedeemResponseDTO {
    const redemptionResultObj = opts?.redemptionResult;
    return {
      result: this.convertMockClientResultCode(redemptionResultObj.resultCode || ''),
      paymentReference: opts?.createPaymentResult.id || '',
      redemptionId: redemptionResultObj.redemptionReference || '',
    };
  }
}
