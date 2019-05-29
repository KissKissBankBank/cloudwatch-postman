import Queue from 'bull'
import Redis from 'ioredis'
import AWS from 'aws-sdk'

const cloudwatchLogs = new AWS.CloudWatchLogs({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})
const logEventsQueue = new Queue('logEvents')
const redis = new Redis()

export const tokenKey = (logGroupName, logStreamName) => (
  `${logGroupName}-${logStreamName}-next-token`
)

export const getValidSequenceToken = (logGroupName, logStreamName) => (
  redis.get(tokenKey(logGroupName, logStreamName))
)

export const saveValidSequenceToken = (token, logGroupName, logStreamName) => {
  redis.set(tokenKey(logGroupName, logStreamName), token)
}

export const putLogEvents = params => new Promise((resolve, reject) => {
  cloudwatchLogs.putLogEvents(params, (error, data) => {
    if (data) resolve(data)
    if (error) reject(error)
  })
})

logEventsQueue.process((job, done) => {
  const { data: { logGroupName, logStreamName, logEvents } } = job

  getValidSequenceToken(logGroupName, logStreamName)
    .then(token => {
      const params = {
        sequenceToken: token,
        logGroupName,
        logStreamName,
        logEvents,
      }

      return putLogEvents(params)
    })
    .then(
      data => {
        saveValidSequenceToken(
          data.nextSequenceToken,
          logGroupName,
          logStreamName,
        )
        done(null, data)
      },
      error => {
        if (
          error.code === 'InvalidSequenceTokenException' ||
          error.code === 'DataAlreadyAcceptedException'
        ) {
          cloudwatchLogs.describeLogStreams({
            logGroupName,
            logStreamNamePrefix: logStreamName,
            limit: 1,
          }, (err, data) => {
            const token = data.logStreams[0].uploadSequenceToken

            saveValidSequenceToken(token, logGroupName, logStreamName)
          })
        }

        console.log(error.stack)
        done(error)
      }
    )
})

logEventsQueue.on('completed', (job, result) => {
  console.log('\n[cloudwatch-postman-worker] POST /putLogEvents to CloudWatch Logs completed. Response:', result)
})

logEventsQueue.on('active', (job, jobPromise) => {
  console.log('\n[cloudwatch-postman-worker] A new job has started:')
  console.log(`ID: ${job.id}`)
  console.log('Data:', job.data)
})

console.log('\n[cloudwatch-postman-worker] logEventsQueue process is started!')
