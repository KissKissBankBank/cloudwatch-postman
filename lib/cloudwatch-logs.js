import AWS from 'aws-sdk'

const cloudwatchLogs = new AWS.CloudWatchLogs({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

export const cloudwatchPutLogEvents = (params, service = cloudwatchLogs) =>
  new Promise((resolve, reject) => {
    service.putLogEvents(params, (error, data) => {
      if (data) resolve(data)
      if (error) reject(error)
    })
  })

export const cloudwatchDescribeLogStreams = (params, service = cloudwatchLogs) =>
  new Promise(
    (resolve, reject) => {
      service.describeLogStreams(params, (error, data) => {
        if (data) resolve(data)
        if (error) reject(error)
      })
    }
  )
