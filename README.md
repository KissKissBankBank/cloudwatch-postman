# CloudWatch Postman [![Codeship Status for KissKissBankBank/cloudwatch-postman](https://app.codeship.com/projects/095c5ef0-5d45-0137-3423-3220a1e64d22/status?branch=master)](https://app.codeship.com/projects/343038)

CloudWatch Postman is a Node proxy that sends data to [Amazon
CloudWatch](https://aws.amazon.com/cloudwatch/). It enables you to serve an API
with endpoints that add or update your metrics on CloudWatch with your AWS
credentials.

- For the moment, configuration of this API is set with environment variables.
- Its first purpose is to serve some endpoints so an cliend-side application can
  call it to send data to CloudWatch.

![Postman on a bicycle](https://user-images.githubusercontent.com/548778/57973195-5be7e680-79a5-11e9-9422-a8e59faa8384.gif)

- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [How to request the API](#how-to-request-the-api)
  - [What is a unique access token?](#what-is-a-unique-access-token)
  - [When is a unique access token used?](#when-is-a-unique-access-token-used)
  - [How to get a unique access token?](#how-to-get-a-unisque-access-token)
  - [How to generate your client token](#how-to-generate-your-client-token)
- [API](#api)
- [Configuration with Dotenv](#configuration-with-dotenv)
- [Contributing](#contributing)
- [Resources](#resources)

## Prerequisites

- Node.js,
- Amazon CloudWatch,
- an AWS account that can call CloudWatch with read and write access.

## Quick start

Install the dependencies:

```sh
npm install
```

Choose an `CLIENT_SECRET_KEY` and an `ACCESS_TOKEN_SECRET_KEY`. These secret values
will be used by CloudWatch Postman to generate tokens to access the API.

Use these secrets and your AWS credentials as environment variables to start
the app:

```sh
CLIENT_SECRET_KEY=*** ACCESS_TOKEN_SECRET_KEY=*** AWS_ACCESS_KEY_ID=*** AWS_SECRET_ACCESS_KEY=*** AWS_REGION=*** npm start
```

Test the API on [http://localhost:8080/test](http://localhost:8080/test).

## How to request the API

You can request the API using a unique access token.

### What is a unique access token?

As CloudWatch Postman is firstly meant to be called by a client-side
application, unique access tokens can secure a little bit more the API endpoints.
You need to exchange your [client token](#how-to-generate-your-client-token) to
obtain a unique access token. This latter have a default expiration of one
hour.

### When is a unique access token used?

Every endpoint, except the `POST /token` one, needs an `accessToken` to be
requested. We advise you to fetch it on your client-side application as soon as
possible if you know that you will need to query the API.

### How to get a unique access token?

You can fetch an `accessToken` on the `POST /token` endpoint with your
[client token](#how-to-generate-your-client-token).

### How to generate your client token

This section explains how to generate an client token to request an access
token for the API.

You will needs these values:
- the current timestamp,
- a random salt value,
- your `CLIENT_SECRET_KEY`,

Concatenate these 3 values and hash them with a `sha256` algorithm digested in
`base64`. Here is an
example in JavaScript:
```js
import crypto from 'crypto'

const data = `${timestamp}${salt}${appSecretKey}`
const hash = crypto.createHash('sha256').update(data).digest('base64')
```

Then, generate your token:
- concatenate the date, the salt value and the hash with a `::` delimiter,
- encode this string in `base64`.

Here is an example in JavaScript:
```js
Buffer.from([timestamp, salt, hash].join('::')).toString('base64')
```

## API

You can check the existing endpoints of this API in [the
documentation](https://github.com/KissKissBankBank/cloudwatch-postman/tree/master/docs/api.md).


## Configuration with Dotenv

You can set some variables with a `.env` file and start the app with:

```sh
npm run serve
```

### Example

```sh
# .env
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
AWS_REGION=***
CLIENT_SECRET_KEY=***
ACCESS_TOKEN_SECRET_KEY=***
```

### Variables

The following variables can be setup in the `.env` file:

Variable | Requirement | Description | Default value
--- | --- | ---  | ---
`AWS_ACCESS_KEY_ID` | *Required* | The AWS IAM user access key id. |
`AWS_SECRET_ACCESS_KEY` | *Required* | The AWS IAM user secret access key. |
`AWS_REGION` | *Required* | The CloudWatch region |
`CLIENT_SECRET_KEY` | *Required* | Your client secret key. You will share it on your consumer app to generate your client token. |
`ACCESS_TOKEN_SECRET_KEY` | *Required* | Your access token secret key. It is used to generate all the access tokens. |
`PORT` | *Optional* | The port on which the server is lauched | `8080`

## Contributing

Please refer to the [contributing
documentation](https://github.com/KissKissBankBank/cloudwatch-postman/tree/master/docs/contributing.md).

## Resources

- [AWS IAM user policies for CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-identity-based-access-control-cwl.html)
- [AWS IAM user credentials](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html)
- [Amazon CloudWatch API for putMetricData](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#putMetricData-property)
