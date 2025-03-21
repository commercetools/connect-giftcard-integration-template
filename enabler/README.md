# Giftcard Integration Enabler
This module provides an application based on [commercetools Connect](https://docs.commercetools.com/connect), which acts a wrapper implementation to cover frontend components provided by giftcard service providers

Giftcard Service Providers provide libraries that can be used on client side to load on browser or other user agent which securely load DOM elements for giftcard validation and redemption. Now, with the usage of `enabler`, it allows the control to checkout product on when and how to load the `enabler` as connector UI based on business configuration. In cases connector is used directly and not through Checkout product, this connector UI can be loaded directly on frontend than the libraries provided by giftcard service providers. 

## Getting Started
Please run following npm commands under `enabler` folder for development work in local environment.

#### Install dependencies
```
$ npm install
```
#### Build the application in local environment. NodeJS source codes are then generated under public folder
```
$ npm run build
```
#### Build development site in local environment. The location of the site is http://127.0.0.1:3000/
```
$ npm run dev
```