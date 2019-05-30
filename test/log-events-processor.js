import chai, { expect } from 'chai'
import AWS from 'aws-sdk-mock'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import * as logEventsProcessor from '../lib/log-events-processor'
import * as CloudWatchLogs from '../lib/cloudwatch-logs'

global.chai = chai
global.expect = expect
chai.use(sinonChai)

const redis = require('ioredis')
const sinonTest = require('sinon-test')(sinon)

describe('=========== log-events-processor.js ==========', () => {
  describe('tokenKey', () => {
    it('returns a formatted key', () => {
      expect(logEventsProcessor.tokenKey('alice', 'cat'))
        .to.eq('alice-cat-next-token')
    })
  })

  describe('getValidSequenceToken', () => {
    it(
      'returns the token related to the logGroupName and logStreamName',
      sinonTest(function() {
        const stubbedRedisGet = this.stub(redis.prototype, 'get')

        logEventsProcessor.getValidSequenceToken('alice', 'cat')
        expect(stubbedRedisGet).to.have.been.calledWith('alice-cat-next-token')
      }),
    )
  })

  describe('saveValidSequenceToken', () => {
    it('save the passed token into Redis', sinonTest(function() {
      const stubbedRedisSet = this.stub(redis.prototype, 'set')

      logEventsProcessor.saveValidSequenceToken('cheshire', 'alice', 'cat')
      expect(stubbedRedisSet)
        .to.have.been.calledWith('alice-cat-next-token', 'cheshire')
    }))
  })

  describe('putLogEvents', () => {
    it('returns a promise', sinonTest(function() {
      const job = {
        data: {
          logGroupName: 'Alice',
          logStreamName: 'Wonderland',
          logEvents: [],
        }
      }
      const token = 'cheshire-cat'
      const spyPromise = this.spy(
        CloudWatchLogs,
        'cloudwatchPutLogEvents'
      )
      const expectedParams = {
        sequenceToken: 'cheshire-cat',
        logGroupName: 'Alice',
        logStreamName: 'Wonderland',
        logEvents: [],
      }

      logEventsProcessor.putLogEvents(job)(token)

      expect(spyPromise).to.have.been.calledWith(expectedParams)
    }))
  })

  describe('completeJobSuccessfully', () => {
    it('completes the job', sinonTest(function(done) {
      const cloudwatchResponse = 'Alice in Wonderland'
      const spyDone = this.spy()
      const job = {
        data: {
          logGroupName: 'Alice',
          logStreamName: 'Wonderland',
          logEvents: [],
        }
      }

      logEventsProcessor.completeJobSuccessfully(job, spyDone)(cloudwatchResponse)
        .then(() => {
          expect(spyDone).to.have.been.calledWith(null, 'Alice in Wonderland')
          done()
        })
    }))
  })

  describe('shouldRefetchValidToken', () => {
    const { shouldRefetchValidToken } = logEventsProcessor

    describe('when it matches the error code', () => {
      it('it returns true with InvalidSequenceTokenException', () => {
        expect(shouldRefetchValidToken('InvalidSequenceTokenException'))
          .to.eq(true)
      })

      it('it returns true with DataAlreadyAcceptedException', () => {
        expect(shouldRefetchValidToken('DataAlreadyAcceptedException'))
          .to.eq(true)
      })
    })

    describe('when it does not match the error code', () => {
      it('return false', () => {
        expect(shouldRefetchValidToken('alice')).to.eq(false)
      })
    })
  })

  describe('handleCloudWatchPutLogEventsError', () => {
    const { handleCloudWatchPutLogEventsError } = logEventsProcessor

    describe('when a token should be fetched again', () => {
      it('returns a Promise', sinonTest(function() {
        const spyPromise = this.spy(
          CloudWatchLogs,
          'cloudwatchDescribeLogStreams',
        )
        const job = {
          data: {
            logGroupName: 'Alice',
            logStreamName: 'Wonderland',
            logEvents: [],
          }
        }
        const error = { code: 'InvalidSequenceTokenException' }
        const expectedParams = {
          logGroupName: 'Alice',
          logStreamNamePrefix: 'Wonderland',
          limit: 1,
        }

        handleCloudWatchPutLogEventsError(job)(error)

        expect(spyPromise).to.have.been.calledWith(expectedParams)
      }))
    })

    describe('when there is an error not linked to the token', () => {
      it('returns a promise rejection', (done) => {
        const job = { data: {} }
        const error = 'alice'

        handleCloudWatchPutLogEventsError(job)(error).then(
          () => {},
          error => {
            expect(error).to.eq('alice')
            done()
          }
        )
      })
    })
  })
})
