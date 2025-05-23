# Giftcard Integration Processor
This module provides an application based on [commercetools Connect](https://docs.commercetools.com/connect), which is triggered by HTTP requests from Checkout UI for giftcard operations.

The corresponding payment, cart or order details would be fetched from composable commerce platform, and then be sent to external giftcard service providers for various operations such as balance validation, redemption and refund.

The module also provides template scripts for post-deployment and pre-undeployment action. After deployment or before undeployment via connect service completed, customized actions can be performed based on users' needs.

## Getting Started

These instructions will get you up and running on your local machine for development and testing purposes.
Please run following npm commands under `processor` folder.

#### Install giftcard SDK
In case SDK is provided by giftcard service provider for communication purpose, you can import the SDK by following commands
```
$ npm install <giftcard-sdk>
```
#### Install dependencies
```
$ npm install
```
#### Build the application in local environment. NodeJS source codes are then generated under dist folder
```
$ npm run build
```
#### Run automation test
```
$ npm run test
```
#### Run the application in local environment. Remind that the application has been built before it runs
```
$ npm run start
```
#### Fix the code style
```
$ npm run lint:fix
```
#### Verify the code style
```
$ npm run lint
```
#### Run post-deploy script in local environment
```
$ npm run connector:post-deploy
```
#### Run pre-undeploy script in local environment
```
$ npm run connector:pre-undeploy
```

## Running application

Setup correct environment variables: check `processor/src/config/config.ts` for default values.

Make sure commercetools client credential have at least the following permissions:

* `manage_payments`
* `manage_checkout_payment_intents`
* `view_sessions`
* `introspect_oauth_tokens`

```
npm run dev
```

## Authentication

Some of the services have authentication mechanism. 

* `oauth2`: Relies on commercetools OAuth2 server
* `session`: Relies on commercetools session service
* `jwt`: Relies on the jwt token injected by the merchant center via the forward-to proxy

### OAuth2
OAuth2 token can be obtained from commercetools OAuth2 server. It requires API Client created beforehand. For details, please refer to [Requesting an access token using the Composable Commerce OAuth 2.0 service](https://docs.commercetools.com/api/authorization#requesting-an-access-token-using-the-composable-commerce-oauth-20-service).

### Session
Giftcard connectors relies on session to be able to share information between `enabler` and `processor`.
To create session before sharing information between these two modules, please execute following request to commercetools session service
```
POST https://session.<region>.commercetools.com/<commercetools-project-key>/sessions
Authorization: Bearer <oauth token with manage_sessions scope>

{
  "cart": {
    "cartRef": {
      "id": "<cart-id>" 
    }
  },
  "metadata": {
    "allowedPaymentMethods": ["card", "ideal", ...],
    "paymentInterface"?: "<payment interface that will be set on payment method info https://docs.commercetools.com/api/projects/payments#ctp:api:type:PaymentMethodInfo>"
  }
}
```

Afterwards, session ID can be obtained from response, which is necessary to be put as `x-session-id` inside request header when sending request to endpoints such as `/operations/config` and `/operations/payments`.

### JSON web token (JWT)

`jwt` needs some workaround to be able to test locally as it depends on the merchant center forward-to proxy.

In order to make easy running the application locally, following commands help to build up a jwt mock server:

####Set environment variable to point to the jwksUrl
```
export CTP_JWKS_URL="http://localhost:9000/jwt/.well-known/jwks.json"
```
####Run the jwt server
```
docker compose up -d
```

####Obtain JWT
```
# Request token
curl --location 'http://localhost:9000/jwt/token' \
--header 'Content-Type: application/json' \
--data '{
    "iss": "https://mc-api.europe-west1.gcp.commercetools.com",
    "sub": "subject",
    "https://mc-api.europe-west1.gcp.commercetools.com/claims/project_key": "<commercetools-project-key>"
}'
```
Token can be found in response
```
{"token":"<token>"}
```

Use the token to authenticate requests protected by JWT: `Authorization: Bearer <token>`. 

## APIs

The processor exposes following endpoints to execute various operations on giftcard connector:

### Get status

It provides health check feature for checkout front-end so that the correctness of configurations can be verified.

#### Endpoint

`GET /operations/status`

#### Request Parameters

N/A

#### Response Parameters

It returns following attributes in response:

- status: It indicates the health check status. It can be `OK`, `Partially Available` or `Unavailable`
- timestamp: The timestamp of the status request
- version: Current version of the payment connector.
- checks: List of health check result details. It contains health check result with various external system including commercetools composable commerce and giftcard service providers.

```
    [
        {
            name: <name of external system>
            status: <status with indicator UP or DOWN>
            details: <additional information for connection checking>
        }
    ]
```

- metadata: It lists a collection of metadata including the name/description of the connector and the version of SDKs used to connect to external system.

### Modify payment

Private endpoint called by Checkout frontend to support various payment update requests such as cancel/refund/capture payment. It is protected by `manage_checkout_payment_intents` access right of composable commerce OAuth2 token.

#### Endpoint

`POST /operations/payment-intents/{paymentsId}`

#### Request Parameters

The request payload is different based on different update operations:

- Cancel Payment

```
{
    actions: [{
        action: "cancelPayment",
    }]
}
```

- Capture Payment
  - centAmount: Amount in the smallest indivisible unit of a currency. For example, 5 EUR is specified as 500 while 5 JPY is specified as 5.
  - currencyCode: Currency code compliant to [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
  ```
  {
      actions: [{
          action: "capturePayment",
          amount: {
              centAmount: <amount>,
              currencyCode: <currecy code>
          }
      }]
  }
  ```
- Refund Payment
  - centAmount: Amount in the smallest indivisible unit of a currency. For example, 5 EUR is specified as 500 while 5 JPY is specified as 5.
  - currencyCode: Currency code compliant to [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
  ```
  {
      actions: [{
          action: "refundPayment",
          amount: {
              centAmount: <amount>,
              currencyCode: <currecy code>
          }
      }]
  }
  ```

#### Response Parameters

```
{
    outcome: "approved|rejected|received"
}

```