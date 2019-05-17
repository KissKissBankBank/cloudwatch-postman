import restify from 'restify'
import CloudWatch from 'aws-sdk/clients/cloudwatch'
import request from 'request'
import { config } from './config.js'

const server = restify.createServer()
server.use(restify.plugins.bodyParser())
const cloudwatch = new CloudWatch({
  region: config.cloudwatch.region,
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
    url: `http://localhost:${config.port}/metric`,
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

server.listen(config.port, () => {
  console.log('%s listening at %s', server.name, server.url)
})
