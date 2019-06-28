import Redis from 'ioredis'
import {
  cloudwatchPutLogEvents,
  cloudwatchDescribeLogStreams,
} from './cloudwatch-logs'

export const memoizeRedis = () => {
  let memo

  return () => {
    if (memo) return memo

    memo = new Redis(process.env.REDIS_URL)

    return memo
  }
}

const getRedis = memoizeRedis()

export const tokenKey = (logGroupName, logStreamName) => (
  `${logGroupName}-${logStreamName}-next-token`
)

export const getValidSequenceToken = (logGroupName, logStreamName) => (
  getRedis().get(tokenKey(logGroupName, logStreamName))
)

export const saveValidSequenceToken = (token, logGroupName, logStreamName) => (
  getRedis().set(tokenKey(logGroupName, logStreamName), token)
)

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

  return saveValidSequenceToken(
    cloudwatchResponse.nextSequenceToken,
    logGroupName,
    logStreamName,
  ).then(() => { done(null, cloudwatchResponse) })
}

export const shouldRefetchValidToken = errorCode => (
  errorCode === 'InvalidSequenceTokenException' ||
    errorCode === 'DataAlreadyAcceptedException'
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

  return Promise.reject(error)
}

export const saveRefetchedToken = (job, done) => cloudwatchResponse => {
  const { data: { logGroupName, logStreamName } } = job
  const token = cloudwatchResponse.logStreams[0].uploadSequenceToken

  return saveValidSequenceToken(token, logGroupName, logStreamName).then(() => {
    const attemptsMessage = job.attemptsMade < 3 ?
      '\n====> The job will be retried.' :
      '\n====> The job has reached its maximum retries.'
    const errorMessage = (
      'The given sequence token is invalid.' +
      '\n==> A valid token ' + token + ' has been refetched and saved.' +
      attemptsMessage
    )

    done(new Error(errorMessage))
  })
}

export const handleCloudWatchLogsError = done => error => done(error)

export const processor = (job, done) => {
  const { data: { logGroupName, logStreamName } } = job

  return getValidSequenceToken(logGroupName, logStreamName)
    .then(putLogEvents(job))
    .then(completeJobSuccessfully(job, done))
    .catch(handleCloudWatchPutLogEventsError(job))
    .then(saveRefetchedToken(job, done))
    .catch(handleCloudWatchLogsError(done))
}

const client = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

// cf. https://github.com/OptimalBits/bull/blob/master/PATTERNS.md#reusing-redis-connections
export const getQueueCreateClient = (client, subscriber) => {
  return (type) => {
    switch (type) {
      case 'client':
        return client
      case 'subscriber':
        return subscriber
      default:
        return new Redis()
    }
  }
}

export const logEventsQueueOptions = {
  createClient: getQueueCreateClient(client, subscriber),
}
