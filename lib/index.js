import restify from 'restify'
import AWS from 'aws-sdk'
import request from 'request'
import {
  isClientTokenValid,
  isAccessTokenValid,
  createAccessToken,
} from './token'
import corsMiddleware from 'restify-cors-middleware'
import Queue from 'bull'

const isProduction = process.env.NODE_ENV === 'production'
const server = restify.createServer()
const globalThrottleOptions = {
  burst: 3,  // Max 3 concurrent requests
  rate: 1,  // 1 request / second
  ip: true,   // throttle per IP
}

const allowedOrigins = process.env.CORS_ALLOWED_ORIGIN || '*'

const cors = corsMiddleware({
  origins: allowedOrigins.split(','),
})

server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.bodyParser())
server.use(restify.plugins.queryParser());
if (isProduction) {
  server.use(restify.plugins.throttle(globalThrottleOptions))
}
const port = process.env.PORT || 8080

const invalidClientTokenErrorBody = {
  error: {
    code: 101,
    message: 'Required parameter "clientToken" is invalid.',
  },
}

const noClientTokenErrorBody = {
  error: {
    code: 100,
    message: 'Required parameter is missing: "clientToken".',
  },
}

const testEndpointRateLimit = restify.plugins.throttle({
  burst: 1,
  rate: 0.015, //  1 request / minute
  ip: true,
})

const testResponse = (req, res, next) => {
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
    res.json(200, JSON.parse(body))
  })

  return next()
}

if (isProduction) {
  server.get('/test', testEndpointRateLimit, testResponse)
} else {
  server.get('/test', testResponse)
}

server.post('/token', (req, res, next) => {
  if (!req.body || !req.body.clientToken) {
    res.json(403, noClientTokenErrorBody)
    return next()
  }

  const clientToken = req.body.clientToken

  if (!isClientTokenValid(clientToken)) {
    res.json(401, invalidClientTokenErrorBody)
    return next()
  }

  res.json(201, {
    accessToken: createAccessToken(),
  })
  return next()
})

server.post('/metric', (req, res, next) => {
  const { body: { accessToken } } = req

  if (!accessToken) {
    res.json(403, {
      error: {
        code: 110,
        message: 'Required parameter is missing: "accessToken".',
      }
    })
    return next()
  }

  if (!isAccessTokenValid(accessToken)) {
    res.json(401, {
      error: {
        code: 111,
        message: 'Required parameter "accessToken" is invalid.',
      }
    })
    return next()
  }

  const cloudwatch = new AWS.CloudWatch({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  })

  cloudwatch.putMetricData(req.body.params, (err, data) => {
    if (err) return console.log(err, err.stack)

    res.json(201, data)
  })

  return next()
})

server.post('/logEvents', (req, res, next) => {
  const { body: { accessToken, logGroupName, logStreamName, logEvents } } = req

  if (!accessToken) {
    res.json(403, {
      error: {
        code: 110,
        message: 'Required parameter is missing: "accessToken".',
      }
    })
    return next()
  }

  if (!isAccessTokenValid(accessToken)) {
    res.json(401, {
      error: {
        code: 111,
        message: 'Required parameter "accessToken" is invalid.',
      }
    })
    return next()
  }

  const logEventsQueue = new Queue('logEvents')
  const params = {
    logGroupName,
    logStreamName,
    logEvents,
  }

  logEventsQueue.add(params)

  const response = {
    message: 'New log events are queued to be sent to Cloudwatch Logs.',
    jobParameters: params,
  }

  res.json(201, response)

  return next()
})

server.listen(port, () => {
  console.log('%s listening at %s', server.name, server.url)
})

export default server
