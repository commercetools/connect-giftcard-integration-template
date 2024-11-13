import { paymentSDK } from '../payment-sdk';
import { MockGiftCardService } from '../services/mock-giftcard.service';

const giftCardService = new MockGiftCardService({
  ctCartService: paymentSDK.ctCartService,
  ctPaymentService: paymentSDK.ctPaymentService,
  ctOrderService: paymentSDK.ctOrderService,
});

export const app = {
  services: {
    giftCardService,
  },
  hooks: {},
};
