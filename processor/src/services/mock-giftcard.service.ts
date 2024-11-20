import {
  CommercetoolsCartService,
  CommercetoolsPaymentService,
  healthCheckCommercetoolsPermissions,
  statusHandler,
  CommercetoolsOrderService,
  ErrorGeneral,
} from '@commercetools/connect-payments-sdk';
import {
  CancelPaymentRequest,
  CapturePaymentRequest,
  PaymentProviderModificationResponse,
  StatusResponse,
} from './types/operation.type';
import { RedeemRequestDTO } from '../dtos/mock-giftcards.dto';
import { getConfig } from '../config/config';
import { appLogger, paymentSDK } from '../payment-sdk';
import { AbstractGiftCardService } from './abstract-giftcard.service';
import { GiftCardClient as MockGiftCardClient } from '../clients/mock-giftcard.client';
import {
  MockClientBalanceResponse,
  MockClientRedeemRequest,
  MockClientRedeemResponse,
  GiftCardCodeType,
} from '../clients/types/mock-giftcard.client.type';
import { getCartIdFromContext, getPaymentInterfaceFromContext } from '../libs/fastify/context/context';
import { BalanceResponseSchemaDTO, RedeemResponseDTO } from '../dtos/mock-giftcards.dto';
import { MockCustomError } from '../errors/mock-api.error';
import { BalanceConverter } from './converters/balance-converter';
import { RedemptionConverter } from './converters/redemption-converter';

import packageJSON from '../../package.json';

export type MockGiftCardServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
  ctOrderService: CommercetoolsOrderService;
};

export class MockGiftCardService extends AbstractGiftCardService {
  constructor(opts: MockGiftCardServiceOptions) {
    super(opts.ctCartService, opts.ctPaymentService, opts.ctOrderService);
  }

  /**
   * Get status
   *
   * @remarks
   * Implementation to provide mocking status of external systems
   *
   * @returns Promise with mocking data containing a list of status from different external systems
   */
  async status(): Promise<StatusResponse> {
    const handler = await statusHandler({
      timeout: getConfig().healthCheckTimeout,
      log: appLogger,
      checks: [
        healthCheckCommercetoolsPermissions({
          requiredPermissions: [
            'manage_payments',
            'view_sessions',
            'view_api_clients',
            'manage_orders',
            'introspect_oauth_tokens',
            'manage_checkout_payment_intents',
          ],
          ctAuthorizationService: paymentSDK.ctAuthorizationService,
          projectKey: getConfig().projectKey,
        }),
        async () => {
          try {
            // TODO: Make request to healthcheck API of external giftcard service provider
            return {
              name: 'mock giftcard API call',
              status: 'UP',
              details: {
                // TODO : Implement result
              },
            };
          } catch (e) {
            return {
              name: 'mock giftcard API call',
              status: 'DOWN',
              message: `Not able to communicate with giftcard service provider API`,
              details: {
                error: e,
              },
            };
          }
        },
      ],
      metadataFn: async () => ({
        name: packageJSON.name,
        description: packageJSON.description,
      }),
    })();

    return handler.body;
  }

  async balance(code: string): Promise<BalanceResponseSchemaDTO> {
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });
    const amountPlanned = await this.ctCartService.getPaymentAmount({ cart: ctCart });
    const cartCurrencyCode = amountPlanned.currencyCode;
    const mockGiftCardClient = new MockGiftCardClient(cartCurrencyCode);
    const getBalanceResult: MockClientBalanceResponse = await mockGiftCardClient.balance(code);

    return BalanceConverter.convert(getBalanceResult, cartCurrencyCode);
  }

  async redeem(opts: { data: RedeemRequestDTO }): Promise<RedeemResponseDTO> {
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    const amountPlanned = await this.ctCartService.getPaymentAmount({ cart: ctCart });
    const cartCurrencyCode = amountPlanned.currencyCode;
    const redeemAmount = opts.data.redeemAmount;
    const redeemCode = opts.data.code;

    /* Mock mechanism to obtain the currency covered by the given giftcard.
     *  It is supposed that a valid giftcard should be with a giftcard code format as "Valid-<amount>-<currency>"
     */
    const giftCardCurrencyCode =
      redeemCode.startsWith('Valid', 5) && redeemCode.split('-').length > 3 ? redeemCode.split('-')[2] : '';

    if (giftCardCurrencyCode !== cartCurrencyCode) {
      throw new MockCustomError({
        message: 'cart and gift card currency do not match',
        code: 400,
        key: GiftCardCodeType.CURRENCY_NOT_MATCH,
      });
    }

    const ctPayment = await this.ctPaymentService.createPayment({
      amountPlanned: redeemAmount,
      paymentMethodInfo: {
        paymentInterface: getPaymentInterfaceFromContext() || 'mock-giftcard-provider',
        method: 'giftcard',
      },
      ...(ctCart.customerId && {
        customer: {
          typeId: 'customer',
          id: ctCart.customerId,
        },
      }),
      ...(!ctCart.customerId &&
        ctCart.anonymousId && {
          anonymousId: ctCart.anonymousId,
        }),
    });
    await this.ctCartService.addPayment({
      resource: {
        id: ctCart.id,
        version: ctCart.version,
      },
      paymentId: ctPayment.id,
    });

    const mockGiftCardClient = new MockGiftCardClient(cartCurrencyCode);
    const request: MockClientRedeemRequest = {
      code: redeemCode,
      amount: redeemAmount,
    };

    const response: MockClientRedeemResponse = await mockGiftCardClient.redeem(request);

    const updatedPayment = await this.ctPaymentService.updatePayment({
      id: ctPayment.id,
      pspReference: response.redemptionReference,
      transaction: {
        type: 'Charge',
        amount: ctPayment.amountPlanned,
        interactionId: response.redemptionReference,
        state: RedemptionConverter.convertMockClientResultCode(response.resultCode),
      },
    });

    return RedemptionConverter.convert({ redemptionResult: response, paymentResult: updatedPayment });
  }

  /**
   * Capture payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment capture in external PSPs
   *
   * @param request - contains the amount and {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  async capturePayment(request: CapturePaymentRequest): Promise<PaymentProviderModificationResponse> {
    throw new ErrorGeneral('operation not supported', {
      fields: {
        pspReference: request.payment.interfaceId,
      },
      privateMessage: "connector doesn't support capture operation",
    });
  }

  /**
   * Cancel payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment cancel in external PSPs
   *
   * @param request - contains {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  async cancelPayment(request: CancelPaymentRequest): Promise<PaymentProviderModificationResponse> {
    throw new ErrorGeneral('operation not supported', {
      fields: {
        pspReference: request.payment.interfaceId,
      },
      privateMessage: "connector doesn't support cancel operation",
    });
  }

  async refundPayment(): Promise<void> {
    // TODO : implement refund logic with mock client
  }
}
