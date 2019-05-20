# CloudWatch Postman - API documentation

### GET /test

This a test endpoint. It sends a metric called `HELLO_WORLD` to a namespace
called `cloudwatch-postman`.

Example of a curl query:
```sh
curl -XGET -I 'http://localhost:8080/test?appToken=YOUR_GENERATED_APP_TOKEN'

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
  "accessToken": "YOUR_UNIQUE_ACCESS_TOKEN"
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
