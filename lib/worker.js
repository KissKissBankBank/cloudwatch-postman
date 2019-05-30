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

export const cloudwatchPutLogEvents = params => new Promise((resolve, reject) => {
  cloudwatchLogs.putLogEvents(params, (error, data) => {
    if (data) resolve(data)
    if (error) reject(error)
  })
})

export const putLogEvents = job => token => {
  const { data: { logGroupName, logStreamName, logEvents } } = job

  const params = {
    sequenceToken: token,
    logGroupName,
    logStreamName,
    logEvents,
  }

  return cloudwatchPutLogEvents(params)
}

export const completeJobSuccessfully = (job, done) => cloudwatchResponse => {
  const { data: { logGroupName, logStreamName } } = job

  saveValidSequenceToken(
    cloudwatchResponse.nextSequenceToken,
    logGroupName,
    logStreamName,
  )

  done(null, cloudwatchResponse)
}

export const shouldRefetchValidToken = errorCode => (
  errorCode === 'InvalidSequenceTokenException' ||
  errorCode === 'DataAlreadyAcceptedException'
)

export const cloudwatchDescribeLogStreams = (params) => new Promise(
  (resolve, reject) => {
    cloudwatchLogs.describeLogStreams(params, (error, data) => {
      if (data) resolve(data)
      if (error) reject(error)
    })
  }
)

export const handleCloudWatchPutLogEventsError = job => error => {
  const { data: { logGroupName, logStreamName } } = job

  if (shouldRefetchValidToken(error.code)) {
    const params = {
      logGroupName,
      logStreamNamePrefix: logStreamName,
      limit: 1,
    }

    return cloudwatchDescribeLogStreams(params)
  }

  return Promise.reject(new Error(error.stack))
}

const saveRefetchedToken = (job, done) => cloudwatchResponse => {
  const { data: { logGroupName, logStreamName } } = job
  const token = cloudwatchResponse.logStreams[0].uploadSequenceToken

  saveValidSequenceToken(token, logGroupName, logStreamName)

  const attemptsMessage = job.attemptsMade < 3 ?
    '\n====> The job will be retried.' :
    '\n====> The job has reached its maximum retries.'
  const errorMessage = (
    'The given sequence token is invalid.' +
    '\n==> A valid token ' + token + ' has been refetched and saved.' +
    attemptsMessage
  )

  done(new Error(errorMessage))
}

const handleCloudWatchLogsError = done => error => done(error)

logEventsQueue.process((job, done) => {
  const { data: { logGroupName, logStreamName, logEvents } } = job

  getValidSequenceToken(logGroupName, logStreamName)
    .then(putLogEvents(job))
    .then(completeJobSuccessfully(job, done))
    .catch(handleCloudWatchPutLogEventsError(job))
    .then(saveRefetchedToken(job, done))
    .catch(handleCloudWatchLogsError(done))
})

logEventsQueue.on('completed', (job, result) => {
  console.log(
    '\n[cloudwatch-postman-worker] ' +
    'POST /putLogEvents to CloudWatch Logs completed. Response:',
    result,
  )
})

logEventsQueue.on('failed', (job, error) => {
  console.log(
    '\n[cloudwatch-postman-worker] ' +
    'POST /putLogEvents to CloudWatch Logs failed.',
    `\n${error}`,
  )
})

logEventsQueue.on('active', (job, jobPromise) => {
  console.log('\n[cloudwatch-postman-worker] A new job has started:')
  console.log(`ID: ${job.id}`)
  console.log('Data:', job.data)
})

console.log('\n[cloudwatch-postman-worker] logEventsQueue process is started!')
