import Queue from 'bull'
import { processor } from './log-events-processor'

const logEventsQueue = new Queue('logEvents', process.env.REDIS_URL)

logEventsQueue.process(processor)

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
