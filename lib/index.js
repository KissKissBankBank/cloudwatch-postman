import restify from 'restify'
import AWS from 'aws-sdk'
import request from 'request'
import { config } from './config'
import {
  isAppTokenValid,
  isAccessTokenValid,
  createAccessToken,
  createTestAppToken,
} from './token'

const server = restify.createServer()
const globalThrottleOptions = {
  burst: 3,  // Max 3 concurrent requests
  rate: 1,  // 1 request / second
  ip: true,   // throttle per IP
}

server.use(restify.plugins.bodyParser())
server.use(restify.plugins.queryParser());
server.use(restify.plugins.throttle(globalThrottleOptions))
const port = process.env.PORT || 8080

const headers = {
  'Content-Type': 'application/json',
}

const invalidAppTokenErrorBody = JSON.stringify({
  error: {
    code: 101,
    message: 'Required parameter "appToken" is invalid.',
  },
})

const noAppTokenErrorBody = JSON.stringify({
  error: {
    code: 100,
    message: 'Required parameter is missing: "appToken".',
  },
})

const testEndpointRateLimit = restify.plugins.throttle({
  burst: 1,
  rate: 0.015, // 1 request / minute
  ip: true,
})

server.get(
  '/test',
  testEndpointRateLimit,
  (req, res, next) => {
    const accessToken = createAccessToken()
    const getRandomInt = max => Math.floor(Math.random() * Math.floor(max))
    const params = {
      accessToken,
      params: {
        MetricData: [
        {
            MetricName: 'HELLO_WORLD',
            Value: getRandomInt(100),
          }
        ],
        Namespace: 'cloudwatch-postman',
      }
    }

    request.post({
      url: `http://localhost:${port}/metric`,
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }, (error, response, body) => {
      if (error) console.log('>> Error:', error)
      if (response) console.log('>> Status code:', response.statusCode)

      res.send(200, JSON.parse(body), headers)
    })

    return next()
  }
)

server.post('/token', (req, res, next) => {
  if (!req.body || !req.body.appToken) {
    res.send(403, noAppTokenErrorBody, headers)
    return next()
  }

  const appToken = req.body.appToken

  if (!isAppTokenValid(appToken)) {
    res.send(401, invalidAppTokenErrorBody, headers)
    return next()
  }

  const response = JSON.stringify({
    accessToken: createAccessToken(),
  })

  res.send(201, response, headers)
  return next()
})

server.post('/metric', (req, res, next) => {
  const { body: { accessToken, params } } = req

  if (!accessToken) {
    const errorBody = JSON.stringify({
      error: {
        code: 110,
        message: 'Required parameter is missing: "accessToken".',
      }
    })

    res.send(403, errorBody, headers)
    return next()
  }

  if (!isAccessTokenValid(accessToken)) {
    const errorBody = JSON.stringify({
      error: {
        code: 111,
        message: 'Required parameter "accessToken" is invalid.',
      }
    })

    res.send(401, errorBody, headers)
    return next()
  }

  const cloudwatch = new AWS.CloudWatch({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  })

  cloudwatch.putMetricData(req.body.params, (err, data) => {
    if (err) return console.log(err, err.stack)

    res.send(201, data, headers)
  })

  return next()
})

server.listen(port, () => {
  console.log('%s listening at %s', server.name, server.url)
})

export default server
