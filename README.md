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
