import restify from 'restify'
import CloudWatch from 'aws-sdk/clients/cloudwatch'

const server = restify.createServer()
const cloudwatch = new CloudWatch({
  region: 'eu-west-1',
})

server.get('/rum/create-entry', (req, res, next) => {
  const params = {
    MetricData: [
      {
        MetricName: 'HELLO_WORLD',
        Value: 100,
      }
    ],
    Namespace: 'KissKissBankBank/RUM',
  }

  cloudwatch.putMetricData(params, (err, data) => {
    if (err) {
      return console.log(err, err.stack)
    }

    console.log(data)
  })

  res.send('ok')
  next()
})

server.listen(8080, () => {
  console.log('%s listening at %s', server.name, server.url)
})
