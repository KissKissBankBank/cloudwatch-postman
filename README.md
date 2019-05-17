# CloudWatch Postman

CloudWatch Postman is a Node proxy that sends data to [AWS
CloudWatch](https://aws.amazon.com/fr/cloudwatch/).

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

### PUT /metrics(params = {})

As this app is a simple proxy, the params formatting is exactly the same as the
one you should send to the CloudWatch API. You can find more details on the
[CloudWatch putMetricData
documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#putMetricData-property).
