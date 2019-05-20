# CloudWatch Postman

CloudWatch Postman is a Node proxy that sends data to [Amazon
CloudWatch](https://aws.amazon.com/cloudwatch/).

![Postman on a bicycle](https://user-images.githubusercontent.com/548778/57973195-5be7e680-79a5-11e9-9422-a8e59faa8384.gif)

- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [How to request the API](#how-to-request-the-api)
  - [Create your application token](#create-your-application-token)
- [API](#api)
- [Configuration with Dotenv](#configuration-with-dotenv)
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

Choose an `APP_SECRET_KEY` and an `ACCESS_TOKEN_SECRET_KEY`. These secret values
will be used to generate tokens to access the API.

Use these secrets and your AWS credentials as environment variables to start
the app:

```sh
APP_SECRET_KEY=*** ACCESS_TOKEN_SECRET_KEY=*** AWS_ACCESS_KEY_ID=*** AWS_SECRET_ACCESS_KEY=*** AWS_REGION=*** npm start
```

Test the API on [http://localhost:8080/test](http://localhost:8080/test).

## How to request the API

### Using an access token

Access token allows a little more secure endpoint for the developers. Every
endpoint, except the `POST /token` one, needs an `accessToken` to be requested.

You can fetch an `accessToken` on the `POST /token` endpoint with your
[application token](#create-your-application-token).

### Create your application token

This section explains how to generate an application token to request an access
token for the API.

You will needs these values:
- the current timestamp,
- a random salt value,
- your `APP_SECRET_KEY`,

Concatenate these 3 values and hash them with a `sha256` algorithm. Here is an
example in JavaScript:
```js
import crypto from 'crypto'

const data = `${timestamp}${salt}${appSecretKey}`
const hash = crypto.createHash('sha256').update(data)
```

Then, generate your token:
- concatenate the date, the salt value and the hash with a `::` delimiter,
- encode this string in `base64`.

Here is an example in JavaScript:
```js
Buffer.from([timestamp, salt, hash].join('::')).toString('base64')
```

## API

### GET /test

This a test endpoint. It sends a metric called `HELLO_WORLD` to a namespace
called `cloudwatch-postman`.

Example of query:
```sh
GET /test?appToken=YOUR_GENERATED_APP_TOKEN
```

### POST /token

WIP

### POST /metrics

As this app is a simple proxy, the params formatting is exactly the same as the
one you should send to the CloudWatch API. You can find more details on the
[CloudWatch putMetricData
documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#putMetricData-property).

Example JSON body:

```json
{
  "accessToken": "YOUR_ACCESS_TOKEN",
  "params": {
    "MetricData": [
      {
        "MetricName": "HELLO_WORLD",
        "Value": 100
      }
    ],
    "Namespace": "cloudwatch-postman"
  }
}
```

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
```

### Variables

The following variables can be setup in the `.env` file:

Variable | Requirement | Description | Default value
--- | --- | ---  | ---
`AWS_ACCESS_KEY_ID` | *Required* | The AWS IAM user access key id. |
`AWS_SECRET_ACCESS_KEY` | *Required* | The AWS IAM user secret access key. |
`AWS_REGION` | *Required* | The CloudWatch region |
`APP_SECRET_KEY` | *Required* | Your app secret key. You will share it on your consumer app to generate your application token. |
`ACCESS_TOKEN_SECRET_KEY` | *Required* | Your access token secret key. It is used to generate all the access tokens. |
`PORT` | *Optional* | The port on which the server is lauched | `8080`

## Resources

- [AWS IAM user policies for CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-identity-based-access-control-cwl.html)
- [AWS IAM user credentials](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html)
- [Amazon CloudWatch API for putMetricData](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#putMetricData-property)
