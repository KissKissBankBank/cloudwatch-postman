# CloudWatch Postman

CloudWatch Postman is a Node proxy that sends data to [AWS
CloudWatch](https://aws.amazon.com/fr/cloudwatch/).

- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [API](#api)
- [Configuration with DotEnv](#configuration-with-dotenv)
- [Resources](#resources)

## Prerequisites

- Node.js,
- AWS CloudWatch,
- An AWS account that can call CloudWatch with read and write accesses.

## Quick start

Install the dependencies:
```sh
npm install
```

Use your AWS credentials as environment variables to start the app:
```sh
AWS_ACCESS_KEY_ID=*** AWS_SECRET_ACCESS_KEY=*** AWS_REGION=*** npm start
```

## API

### GET /test

This a test endpoint. It sends a metric called `HELLO_WORLD` to a namespace
called `cloudwatch-postman`.

### POST /metrics(params = {})

As this app is a simple proxy, the params formatting is exactly the same as the
one you should send to the CloudWatch API. You can find more details on the
[CloudWatch putMetricData
documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#putMetricData-property).

## Configuration with DotEnv

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

Variable | Description | Type | Default value
--- | --- | --- | ---
AWS_ACCESS_KEY_ID | *Required* - The AWS IAM user access key id. | String | ""
AWS_SECRET_ACCESS_KEY | *Required* - The AWS IAM user secret access key. | String | ""
AWS_REGION | *Required* - The CloudWatch region | String | ""
PORT | *Optional* - The port on which the server is lauched | Integer | 8080

## Resources

- [AWS IAM user policies for CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/iam-identity-based-access-control-cwl.html)
- [AWS IAM user credentials](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html)
