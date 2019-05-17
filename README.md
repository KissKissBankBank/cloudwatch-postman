# CloudWatch Postman

CloudWatch Postman is a Node proxy that sends data to [AWS
CloudWatch](https://aws.amazon.com/fr/cloudwatch/).

- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [API](#api)
- [Configuration](#configuration)

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
AWS_ACCESS_KEY_ID=*** AWS_SECRET_ACCESS_KEY=*** npm start
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

## Configuration

The `config.js` file enables you to configure the following variables:

Variable | Description | Type | Default
--- | --- | --- | ---
port | The port where the API is served. | String | "8080"
cloudwatch.region | The CloudWatch region used to setup your calls to AWS CloudWatch API | String | "eu-west-1"
