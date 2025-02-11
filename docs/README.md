# Developer documentation

## Overview

This documentation defines a standardized approach for integrating gift card providers with commercetools Checkout. The integration pattern and structure are provided as a template, enabling gift card providers to implement their own solutions in a consistent and efficient manner. This framework ensures that gift cards are treated as a payment method , such as credit cards, ensuring a seamless checkout experience for users, streamlining the integration process and enhancing flexibility for different providers. 

## Scope

This document provides a comprehensive overview of the system architecture and a detailed guide for implementing the integration. It covers the necessary technical specifications and outlines how to manage gift cards as part of the payment workflow within commercetools.

## Solution

### System Architecture Diagram


### Components Overview

The integration is composed of several interconnected components, each playing a specific role in enabling the seamless use of gift cards as a payment method within commercetools. Below is an overview of these components:

1. #### commercetools Connect
commercetools Connect provides a runtime environment for executing small applications or "connectors" within the commercetools platform. The integration runs within this environment and consists of two key applications:
   * **Enabler**
   A JavaScript library that is loaded into the browser during the commercetools Checkout process. The Enabler is responsible for displaying the necessary input fields for gift card information (e.g., card number, PIN) and exposes functions like `balance()` and `submit()` to facilitate interaction between the frontend and backend systems.
   * **Processor**
   A backend application that exposes an API to handle requests from both the Enabler (frontend) and commercetools Checkout (backend). The Processor acts as the middle layer that interacts with the gift card provider (e.g., for balance checks, redemptions) and ensures the payment information is updated in the commercetools Core Commerce platform.

2. #### Gift Card Provider
The external system responsible for managing the gift card details. It holds the gift card information, including balance retrieval, redemption, cancellation, and voiding operations. The Processor communicates with the Gift Card Provider to execute these operations.

3. #### commercetools Checkout
commercetools Checkout is the system that orchestrates the payment process. It displays available payment methods (e.g., gift cards, credit cards) to the user on the merchant’s website and is responsible for converting a Cart into an Order. The Checkout system uses the integration to handle gift cards as a payment method.

4. #### commercetools Session
The commercetools Session API allows the storage and management of session data. The session is critical for maintaining state and trust between the frontend (Enabler) and backend (Processor), ensuring secure interactions during the payment flow.

5. #### commercetools OAuth
The OAuth server is responsible for issuing and validating client credentials for server-to-server authentication. OAuth is used to authorize requests between the Processor and commercetools Core Commerce.


### Data Flow

The integration follows a structured data flow to ensure smooth operation between commercetools Checkout, the gift card provider, and the connector components. The key steps in the data flow are as follows:

1. **Session Creation:** 
   * commercetools Checkout creates a session to store the necessary cart information. The session holds details such as the processor URL, payment service provider (PSP), and the `paymentInterface` information (which will be set on the `PaymentMethodInfo` object in the payment payload) as defined in the [commercetools Payments API](https://docs.commercetools.com/api/projects/payments#ctp:api:type:PaymentMethodInfo).

2. **Displaying Input Fields:** 
   * The Enabler, loaded by commercetools Checkout, displays the required input fields for the user to input their gift card details (e.g., card number, security code). Additionally, it exposes a `balance()` function, which commercetools Checkout invokes to retrieve the gift card balance.

3. **Balance Check:** 
   * The Enabler calls the Processor’s API to retrieve the gift card balance. The Processor, in turn, communicates with the Gift Card Provider to authenticate and fetch the current balance.

4. Evaluate Payment Amount: 
   * Once the balance is retrieved, commercetools Checkout evaluates the available amount on the gift card and determines how much can be applied toward the total payment.

5. **Payment Submission:** 
   * commercetools Checkout calls the submit() function, exposed by the Enabler, to initiate the payment process. Along with this call, the checkout system sends the amount that needs to be charged against the gift card.

7. **Gift Card Redemption and Order Finalization:** 
   * The Enabler communicates with the Processor, which interacts with the Gift Card Provider to redeem the specified amount. 
   * The Processor then updates the payment status and records the necessary payment transactions in commercetools Core Commerce, completing the payment process and finalizing the order.

### Integration Type

The integration follows a **connector-based architecture** where two main components - **Enabler** (frontend) and **Processor** (backend) — work together. The connector offers:

* **API functionality**: Through the Processor, which communicates with the gift card provider and commercetools Core Commerce.
* **Frontend functionality**: Through the Enabler, which presents the UI elements and facilitates interactions with commercetools Checkout.

This flexible design allows the connector to operate within commercetools Checkout but can also be used as a standalone solution for custom integrations, depending on the merchant’s specific requirements.

### Integration Prerequisites

#### commercetools Setup
To integrate the gift card system with commercetools Checkout, you will need to configure API credentials with the appropriate permissions. These are the key requirements for setting up commercetools:

**API Credentials**

The integration requires an API client with specific access scopes to manage payments, carts, sessions, and other necessary operations. Ensure the API client is configured with at least the following scopes (other scopes may be required):

* `manage_payments`: Enables the management of payment information, including creating and updating payment methods.
* `manage_orders`: Allows access and updates to the cart and related order information.
* `view_sessions`: Grants permission to retrieve session information used for establishing trust between the frontend and backend.
* `view_api_clients`: Validates if the API credentials provided have the required permissions.
* `manage_checkout_payment_intents`: Supports interaction with the `/operations/*` endpoint for managing payment intents during checkout.
* `introspect_oauth_tokens`: Allows introspection of OAuth tokens to validate permissions and ensure secure authentication.

**API Client for Connector Operations**

In addition to the API credentials above, you'll need an API client capable of managing connector-related operations. This includes tasks like:

* Installing the connector
* Deploying and updating the connector
* Performing connector-related maintenance operations

For more details on setting up and managing connectors, refer to the commercetools [Connector Deployment Documentation](https://docs.commercetools.com/certifications/build-and-deploy-custom-connector/overview).

#### Gift Card System Setup

The setup for the gift card provider may vary depending on the specific system being integrated. However, there are some common configuration steps required:

1. **Gift Card Provider Configuration**
   Most gift card systems require some form of authentication or access key to interact with their API. Typically, this configuration will involve:
   * API keys or other credentials that need to be securely stored to allow the Processor to access the gift card provider’s system.

2. **Balance Retrieval**
   The gift card provider must support the ability to retrieve the balance of a specific gift card. This is a core operation required for the integration to function, as commercetools Checkout needs to know the available balance before processing the payment.

3. **Transaction Operations**
   The gift card provider should support key operations for handling transactions, including:
   * **Cancel**: Ability to cancel or void a transaction.
   * **Capture**: Support for capture of a transaction when necessary.
   * **Refund**: Ability to refund a transaction if the payment needs to be reversed.

These operations are essential for managing the payment lifecycle in case of errors, cancellations, or customer refunds.

#### Access & Authentication

The integration uses several authentication methods to ensure secure communication between different components. These include:

1. **Session Authentication**
   The integration will use session-based authentication for frontend-to-backend communication. The session information is passed via the `X-Session-Id` header, which is validated by the Processor to ensure the request is trusted and associated with the correct session.

2. **JWT Validation**
   JSON Web Tokens (JWT) are used to validate operations performed within the commercetools Merchant Center. The Processor supports JWT validation to authenticate and authorize requests for internal operations.

3. **OAuth Authentication**
   OAuth 2.0 is used for server-to-server communication to manage secure operations such as capture, cancel, and refund of payments. The OAuth credentials are validated via the `introspect_oauth_tokens` scope to ensure that the Processor has the necessary permissions for these operations.

#### Environment Setup

The integration requires setting up an appropriate environment for development and deployment. Follow these steps to configure the environment:

1. **Clone the Template Repository**
   The integration template is available at the following GitHub repository: [commercetools Connect Gift Card Integration Template](https://github.com/commercetools/connect-giftcard-integration-template).
Clone this repository to your local environment to begin customizing the integration.

2. **Customize the Template**
   Modify the cloned template to suit the specifications of the gift card provider being integrated. This may involve customizing the Processor logic to interact with the gift card provider’s API for balance checks, redemptions, cancellations, and refunds.

3. **Install and Deploy the Connector**
   Once customized, you need to install the connector in your commercetools environment using the Connector API.
   Create a deployment for the connector to enable it to run within the commercetools Connect environment. For detailed steps on installing and deploying connectors, refer to the [commercetools Connector Deployment Guide](https://docs.commercetools.com/certifications/build-and-deploy-custom-connector/overview).

### API Reference

#### Enabler

The provided JavaScript interface defines how the **Giftcard Enabler** is initialized and how it integrates with commercetools Checkout to support gift card payment functionality. Below is a breakdown of each part of the interface:

---

##### Interface: `GiftcardEnabler`

This is the main interface that initializes the gift card enabler and allows the system to create a `GiftCardBuilder`.

* `createGiftCardBuilder`
  A function that returns a `Promise` which resolves to a `GiftcardBuilder`. If the initialization fails, the promise throws an error (never).
  This method is essential for setting up the enabler, ensuring that the builder for gift cards is available and ready to create components.

---