import restify from 'restify'
import CloudWatch from 'aws-sdk/clients/cloudwatch'
import request from 'request'
import { config } from './config.js'

const server = restify.createServer()
server.use(restify.plugins.bodyParser())
const port = process.env.PORT || 8080
const cloudwatch = new CloudWatch({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

server.get('/test', (req, res, next) => {
  const params = {
    MetricData: [
      {
        MetricName: 'HELLO_WORLD',
        Value: 100,
      }
    ],
    Namespace: 'cloudwatch-postman',
  }

  request.post({
    url: `http://localhost:${port}/metric`,
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
  }, (error, response, body) => {
    console.log('error:', error)
    console.log('statusCode:', response && response.statusCode)
    res.send(body)
  })

  next()
})

server.post('/metric', (req, res, next) => {
  cloudwatch.putMetricData(req.body, (err, data) => {
    if (err) {
      return console.log(err, err.stack)
    }

    res.send(data)
  })

  next()
})

server.listen(port, () => {
  console.log('%s listening at %s', server.name, server.url)
})
