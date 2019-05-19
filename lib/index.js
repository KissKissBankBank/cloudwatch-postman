import restify from 'restify'
import AWS from 'aws-sdk'
import request from 'request'
import { config } from './config'
import {
  isTokenValid,
  createAccessToken,
  createTestAppToken,
} from './token'

const server = restify.createServer()
server.use(restify.plugins.bodyParser())
server.use(restify.plugins.queryParser());
const port = process.env.PORT || 8080

server.post('/token', (req, res, next) => {
  const appToken = req.body.appToken

  if (isTokenValid(appToken)) {
    const response = {
      accessToken: createAccessToken(),
    }

    res.send(201, { response })
  } else {
    res.send(403, { error: 'Your application token is invalid!' })
  }

  next()
})

server.get('/test', (req, res, next) => {
  const appToken = req.query.appToken

  if (isTokenValid(appToken)) {
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
      },
    }, (error, response, body) => {
      console.log('error:', error)
      console.log('statuscode:', response && response.statusCode)
      res.send(body)
    })
  } else {
    res.send(403, { error: 'Your application token is invalid!' })
  }

  next()
})

server.post('/metric', (req, res, next) => {
  const { body: { accessToken, params } } = req
  const cloudwatch = new AWS.CloudWatch({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  })

  if (isTokenValid(accessToken)) {
    cloudwatch.putMetricData(req.body.params, (err, data) => {
      if (err) {
        return console.log(err, err.stack)
      }

      res.send(data)
    })
  } else {
    res.send(
      403,
      {
        error: 'Your access token is invalid! Please generated a new one with your application token.',
      }
    )
  }

  next()
})

server.listen(port, () => {
  console.log('%s listening at %s', server.name, server.url)
})

export default server
