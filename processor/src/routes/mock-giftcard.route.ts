import {
  SessionHeaderAuthenticationHook,
  SessionQueryParamAuthenticationHook,
} from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { MockGiftCardService } from '../services/mock-giftcard.service';
import {
  BalanceResponseSchema,
  BalanceResponseSchemaDTO,
  RedeemRequestDTO,
  RedeemResponseSchema,
} from '../dtos/mock-giftcards.dto';
import { Type } from '@sinclair/typebox';
import { AmountSchema } from '../dtos/operations/payment-intents.dto';

type RoutesOptions = {
  giftCardService: MockGiftCardService;
  sessionHeaderAuthHook: SessionHeaderAuthenticationHook;
  sessionQueryParamAuthHook: SessionQueryParamAuthenticationHook;
};

export const mockGiftCardServiceRoutes = async (
  fastify: FastifyInstance,

  opts: FastifyPluginOptions & RoutesOptions,
) => {
  fastify.get<{
    Reply: BalanceResponseSchemaDTO | void;
    Params: { code: string };
  }>(
    '/balance/:code',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        params: {
          type: 'object',
          properties: {
            code: Type.String(),
          },
        },
        response: {
          200: BalanceResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { code } = request.params;
      const res = await opts.giftCardService.balance(code);
      return reply.status(200).send(res);
    },
  );

  fastify.post<{ Body: RedeemRequestDTO; Reply: void }>(
    '/redemption',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        body: {
          type: 'object',
          properties: {
            code: Type.String(),
            redeemAmount: AmountSchema,
          },
          required: ['code', 'redeemAmount'],
        },
        response: {
          200: RedeemResponseSchema,
        },
      },
    },
    async (request, reply) => {
      await opts.giftCardService.redeem();

      return reply.status(200).send('done');
    },
  );
};
