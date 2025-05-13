import {
  CommercetoolsCartService,
  CommercetoolsOrderService,
  CommercetoolsPaymentService,
  ErrorInvalidOperation,
} from '@commercetools/connect-payments-sdk';
import {
  CancelPaymentRequest,
  CapturePaymentRequest,
  ModifyPayment,
  PaymentProviderModificationResponse,
  RefundPaymentRequest,
  ReversePaymentRequest,
  StatusResponse,
} from './types/operation.type';
import { PaymentIntentResponseSchemaDTO } from '../dtos/operations/payment-intents.dto';
import { BalanceResponseSchemaDTO, RedeemRequestDTO, RedeemResponseDTO } from '../dtos/mock-giftcards.dto';

export abstract class AbstractGiftCardService {
  protected ctCartService: CommercetoolsCartService;
  protected ctPaymentService: CommercetoolsPaymentService;
  protected ctOrderService: CommercetoolsOrderService;

  constructor(
    ctCartService: CommercetoolsCartService,
    ctPaymentService: CommercetoolsPaymentService,
    ctOrderService: CommercetoolsOrderService,
  ) {
    this.ctCartService = ctCartService;
    this.ctPaymentService = ctPaymentService;
    this.ctOrderService = ctOrderService;
  }

  /**
   * Get stats information
   * @returns
   */
  abstract status(): Promise<StatusResponse>;

  /**
   * Validate Code and return balance
   * @returns
   */
  abstract balance(code: string): Promise<BalanceResponseSchemaDTO>;

  /**
   * Redeem Code
   * @returns
   */
  abstract redeem(opt: { data: RedeemRequestDTO }): Promise<RedeemResponseDTO>;

  /**
   * Capture payment
   * @param request
   * @returns
   */
  abstract capturePayment(request: CapturePaymentRequest): Promise<PaymentProviderModificationResponse>;

  /**
   * Cancel payment
   * @param request
   * @returns
   */
  abstract cancelPayment(request: CancelPaymentRequest): Promise<PaymentProviderModificationResponse>;

  /**
   * Refund payment
   * @param request
   * @returns
   */
  abstract refundPayment(request: RefundPaymentRequest): Promise<PaymentProviderModificationResponse>;

  /**
   * Reverse payment
   *
   * @remarks
   * Abstract method to execute payment reversals in support of automated reversals to be triggered by checkout api. The actual invocation to PSPs should be implemented in subclasses
   *
   * @param request
   * @returns Promise with outcome containing operation status and PSP reference
   */
  abstract reversePayment(request: ReversePaymentRequest): Promise<PaymentProviderModificationResponse>;

  public async modifyPayment(opts: ModifyPayment): Promise<PaymentIntentResponseSchemaDTO> {
    const ctPayment = await this.ctPaymentService.getPayment({
      id: opts.paymentId,
    });
    const request = opts.data.actions[0];

    switch (request.action) {
      case 'cancelPayment': {
        return await this.cancelPayment({ payment: ctPayment, merchantReference: request.merchantReference });
      }
      case 'capturePayment': {
        return await this.capturePayment({
          payment: ctPayment,
          merchantReference: request.merchantReference,
          amount: request.amount,
        });
      }
      case 'refundPayment': {
        return await this.refundPayment({
          amount: request.amount,
          payment: ctPayment,
          merchantReference: request.merchantReference,
        });
      }
      case 'reversePayment': {
        return await this.reversePayment({
          payment: ctPayment,
          merchantReference: request.merchantReference,
        });
      }
      default: {
        throw new ErrorInvalidOperation('Operation not supported.');
      }
    }
  }

  //   log.info(`Processing payment modification.`, {
  //     paymentId: updatedPayment.id,
  //     action: request.action,
  //   });

  //   const res = await this.processPaymentModification(updatedPayment, transactionType, requestAmount);

  //   updatedPayment = await this.ctPaymentService.updatePayment({
  //     id: ctPayment.id,
  //     transaction: {
  //       type: transactionType,
  //       amount: requestAmount,
  //       interactionId: res.pspReference,
  //       state: this.convertPaymentModificationOutcomeToState(res.outcome),
  //     },
  //   });

  //   log.info(`Payment modification completed.`, {
  //     paymentId: updatedPayment.id,
  //     action: request.action,
  //     result: res.outcome,
  //   });

  //   return {
  //     outcome: res.outcome,
  //   };
  // }

  // protected getPaymentTransactionType(action: string): string {
  //   switch (action) {
  //     case 'cancelPayment': {
  //       return 'CancelAuthorization';
  //     }
  //     case 'capturePayment': {
  //       return 'Charge';
  //     }
  //     case 'refundPayment': {
  //       return 'Refund';
  //     }
  //     default: {
  //       log.error(`Operation ${action} not supported when modifying payment.`);
  //       throw new ErrorInvalidJsonInput(`Request body does not contain valid JSON.`);
  //     }
  //   }
  // }

  // protected async processPaymentModification(
  //   payment: Payment,
  //   transactionType: string,
  //   requestAmount: AmountSchemaDTO,
  // ) {
  //   switch (transactionType) {
  //     case 'CancelAuthorization': {
  //       return await this.cancelPayment({ payment });
  //     }
  //     case 'Charge': {
  //       return await this.capturePayment({ amount: requestAmount, payment });
  //     }
  //     case 'Refund': {
  //       return await this.refundPayment({ amount: requestAmount, payment });
  //     }
  //     default: {
  //       throw new ErrorInvalidOperation(`Operation ${transactionType} not supported.`);
  //     }
  //   }
  // }

  // protected convertPaymentModificationOutcomeToState(
  //   outcome: PaymentModificationStatus,
  // ): 'Pending' | 'Success' | 'Failure' {
  //   if (outcome === PaymentModificationStatus.RECEIVED) {
  //     return 'Pending';
  //   } else if (outcome === PaymentModificationStatus.APPROVED) {
  //     return 'Success';
  //   } else {
  //     return 'Failure';
  //   }
  // }
}
