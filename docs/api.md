# CloudWatch Postman - API documentation

### GET /test

This a test endpoint. It sends a metric called `HELLO_WORLD` to a namespace
called `cloudwatch-postman`.

Example of a curl query:
```sh
curl -XGET -I 'http://localhost:8080/test'

# =>
#  HTTP/1.1 200 OK
#  Date: Mon, 20 May 2019 14:50:23 GMT
#  Server: restify
#  Content-Type: application/json
#  Content-Length: 73
```

### POST /token

This endpoint enables you to exchange your application token for a unique access
token.

Example of a curl query:
```sh
curl -XPOST -H "Content-type: application/json" -d '{"appToken": "YOUR_GENERATED_APP_TOKEN"}' 'http://localhost:8080/token'

# =>
#  "{\"accessToken\":\"YOUR_UNIQUE_ACCESS_TOKEN\"}"%
```

### POST /metrics

As this app is a simple proxy, the params formatting is exactly the same as the
one you should send to the CloudWatch API. You can find more details on the
[CloudWatch putMetricData
documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#putMetricData-property).

Example of a curl query:
```sh
curl -XPOST -H "Content-type: application/json" -d '{
  "accessToken": "YOUR_UNIQUE_ACCESS_TOKEN",
  "params": {
    "MetricData": [
      {
        "MetricName": "HELLO_WORLD",
        "Value": 100
      }
    ],
    "Namespace": "cloudwatch-postman"
  }
}' 'http://localhost:8080/metric'

# =>
#  {"ResponseMetadata":{"RequestId":"d2d4ad73-7b0f-11e9-9e4e-0b02b7f4bf5c"}}
```

### POST /logEvents

This endpoint does a little more than a simple proxy and enqueues a batch of
logs to send to CloudWatch Logs.

As [CloudWatch Logs
API](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html)
needs a `sequenceToken` for each call, this endpoint enables you to delegate the
implementation of the sequential requesting by using a background worker. You
can just send the data you want to CloudWatch Logs and CloudWatch Postman will
enqueue this request for you in a background job.

Example of a curl query:
```sh
curl -XPOST -H "Content-type: application/json" -d '{
"accessToken": "YOUR_UNIQUE_ACCESS_TOKEN",
"logGroupName": "HELLO_WORLD",
"logStreamName": "cloudwatch-postman-test",
"logEvents": [{"message": "[cloudwatch-postman] This is a test.", "timestamp": 1559157389833}]
}' 'http://localhost:8080/logEvents'

# =>
#  {
#    message: 'New log events are queued to be sent to CloudWatch Logs.',
#    jobsParameters: {
#      logGroupName: 'HELLO_WORLD',
#      logStreamName: 'cloudwatch-postman-test',
#      logEvents: [
#        {
#          message: '[cloudwatch-postman] This is a test.',
#          timestamp: 1559157389833
#        }
#      ],
#    }
#  }
```
