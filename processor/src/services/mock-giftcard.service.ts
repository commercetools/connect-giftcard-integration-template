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
import { getConfig } from '../config/config';
import { appLogger, paymentSDK } from '../payment-sdk';
import { AbstractGiftCardService } from './abstract-giftcard.service';
import { GiftCardClient as MockGiftCardClient } from '../clients/mock-giftcard.client';
import { MockGiftCardClientResult } from '../clients/types/mock-giftcard.client.type';
import { getCartIdFromContext } from '../libs/fastify/context/context';
import { BalanceResponseSchemaDTO } from '../dtos/mock-giftcards.dto';
import { BalanceConverter } from './converters/balance-converter';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJSON = require('../../package.json');

export type VoucherifyGiftCardServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
  ctOrderService: CommercetoolsOrderService;
};

export class MockGiftCardService extends AbstractGiftCardService {
  constructor(opts: VoucherifyGiftCardServiceOptions) {
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
    const mockGiftCardClient = MockGiftCardClient.init(cartCurrencyCode);
    const getBalanceResult: MockGiftCardClientResult = mockGiftCardClient.balance(code);

    return BalanceConverter.convert(getBalanceResult, cartCurrencyCode);
  }

  async redeem(): Promise<void> {
    // TODO : implement redeem logic with mock client
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
