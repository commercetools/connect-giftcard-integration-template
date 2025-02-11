# Mock values

To simulate the different use cases during communication with external giftcard service providers, we have defined following mocking values.

## Gift Card Code

`Valid-{amount}-{currency}`:
This gift card code format represents a valid gift card code covering the specified balance amount and currency. When gift card code is specified in this format when requesting to balance/redeem APIs exposed by gift card template, APIs validates the given gift card code and process balance checking or redemption with specified amount and currency. If the specific currency is different from the cart currency, it will throw with CurrencyNotMatch error.

`Valid-00{amount}-{currency}`:
Special case for a gift card that will succeed to provide amount (with two zeros as prefix) as balance (e.g.: Valid-00123-EUR will provide a balance of 123) but will fail with an Expired error during the redeem process. 

`Valid-0-{currency}`:
This gift card code fails with a zero balance error

`Expired`
It represents an expired gift card code which fails the balance checking or redemption when in used. 

`GenericError`
It represents an erroneous gift card code which will throw generic error when in used. 

`NotFound`
It represents a non-existing gift card code which fails the balance checking or redemption when in used. 

## Redemption Reference Type

`redemption-reference-valid`
It represents a mocking value of the unique identifier after dummy redemption process has been completed in gift card connector template. When the unique identifier is provided as redemption-reference-valid during redemption rollback, the rollback process will be diverted to the success scenario.

`redemption-reference-invalid`
It represents a mocking value of the unique identifier after dummy redemption process has been completed in gift card connector template. When the unique identifier is provided as redemption-reference-invalid during redemption rollback, the rollback process will be diverted to the failed scenario