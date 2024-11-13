# Voucherify Integration (Enabler)
This module provides an application based on [commercetools Connect](https://docs.commercetools.com/connect), which acts as a wrapper implementation to serve frontend components required to process gift cards.

The `enabler` allows the Checkout product to manage when and how to load the `enabler` as a connector UI, based on business configuration. In cases where the connector is used directly without the Checkout product, the connector UI can be loaded directly on the frontend.


## Getting Started
Please run following npm commands under `enabler` folder for development work in local environment.

#### Install dependencies
```
$ npm install
```
#### Build the application in local environment. NodeJS source codes are then generated under dist folder
```
$ npm run build
```
#### Build development site in local environment. The location of the site is http://127.0.0.1:3000/
```
$ npm run dev
```