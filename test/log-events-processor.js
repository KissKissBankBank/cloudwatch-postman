import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {
  tokenKey,
  getValidSequenceToken,
  saveValidSequenceToken,
  putLogEvents,
  completeJobSuccessfully,
  shouldRefetchValidToken,
  handleCloudWatchPutLogEventsError,
  saveRefetchedToken,
  handleCloudWatchLogsError,
  processor,
} from '../lib/log-events-processor'
import * as CloudWatchLogs from '../lib/cloudwatch-logs'

global.chai = chai
global.expect = expect
chai.use(sinonChai)

const redis = require('ioredis')
const sinonTest = require('sinon-test')(sinon)

describe('=========== log-events-processor.js ==========', () => {
  describe('tokenKey', () => {
    it('returns a formatted key', () => {
      expect(tokenKey('alice', 'cat')).to.eq('alice-cat-next-token')
    })
  })

  describe('getValidSequenceToken', () => {
    it(
      'returns the token related to the logGroupName and logStreamName',
      sinonTest(function() {
        const stubbedRedisGet = this.stub(redis.prototype, 'get')

        getValidSequenceToken('alice', 'cat')
        expect(stubbedRedisGet).to.have.been.calledWith('alice-cat-next-token')
      }),
    )
  })

  describe('saveValidSequenceToken', () => {
    it('saves the passed token into Redis', sinonTest(function() {
      const stubbedRedisSet = this.stub(redis.prototype, 'set')

      saveValidSequenceToken('cheshire', 'alice', 'cat')
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
      const stubbedPromise = this.stub(
        CloudWatchLogs,
        'cloudwatchPutLogEvents'
      )
      const expectedParams = {
        sequenceToken: 'cheshire-cat',
        logGroupName: 'Alice',
        logStreamName: 'Wonderland',
        logEvents: [],
      }

      putLogEvents(job)(token)

      expect(stubbedPromise).to.have.been.calledWith(expectedParams)
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

      completeJobSuccessfully(job, spyDone)(cloudwatchResponse)
        .then(() => {
          expect(spyDone).to.have.been.calledWith(null, 'Alice in Wonderland')
          done()
        })
    }))
  })

  describe('shouldRefetchValidToken', () => {
    describe('when it matches the error code', () => {
      it('returns true with InvalidSequenceTokenException', () => {
        expect(shouldRefetchValidToken('InvalidSequenceTokenException'))
          .to.eq(true)
      })

      it('returns true with DataAlreadyAcceptedException', () => {
        expect(shouldRefetchValidToken('DataAlreadyAcceptedException'))
          .to.eq(true)
      })
    })

    describe('when it does not match the error code', () => {
      it('returns false', () => {
        expect(shouldRefetchValidToken('alice')).to.eq(false)
      })
    })
  })

  describe('handleCloudWatchPutLogEventsError', () => {
    describe('when a token should be fetched again', () => {
      it('returns a Promise', sinonTest(function() {
        const stubbedPromise = this.stub(
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

        expect(stubbedPromise).to.have.been.calledWith(expectedParams)
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

  describe('saveRefetchedToken', () => {
    it('returns a Promise', sinonTest(function(done) {
      const spyDone = this.spy()
      const job = {
        data: {
          logGroupName: 'Alice',
          logStreamName: 'Wonderland',
          logEvents: [],
        }
      }
      const cloudwatchResponse = {
        logStreams: [
          { uploadSequenceToken: 'alice' },
        ],
      }

      saveRefetchedToken(job, spyDone)(cloudwatchResponse)
        .then(() => {
          expect(spyDone).to.have.been.called
          done()
        })
    }))
  })

  describe('handleCloudWatchLogsError', () => {
    it('completes the job with an error', sinonTest(function() {
      const spyDone = this.spy()
      const error = 'alice'

      handleCloudWatchLogsError(spyDone)(error)

      expect(spyDone).to.have.been.calledWith('alice')
    }))
  })

  describe('processor', () => {
    describe('when putLogEvents is successful', () => {
      it(
        'completes the job with CloudWatch Logs response',
        sinonTest(function(done) {
          const stubbedPromise = this
            .stub(CloudWatchLogs, 'cloudwatchPutLogEvents')
            .resolves({
              nextSequenceToken: 'madhatter'
            })
          const spyDone = this.spy()
          const job = {
            data: {
              logGroupName: 'Alice',
              logStreamName: 'Wonderland',
              logEvents: [],
            }
          }

          processor(job, spyDone).then(() => {
            expect(spyDone).to.have.been.calledWith(null, {
              nextSequenceToken: 'madhatter'
            })
            done()
          })
        })
      )
    })

    describe('when putLogEvents fails', () => {
      describe('when a valid token can be fetched again', () => {
        describe('when describeLogStreams is successful', () => {
          it(
            'saves the token and completes the job with a specific error',
            sinonTest(function(done) {
              const stubbedPutLogEvents = this
                .stub(CloudWatchLogs, 'cloudwatchPutLogEvents')
                .rejects({ code: 'InvalidSequenceTokenException' })
              const stubbedDescribeLogStreams = this
                .stub(CloudWatchLogs, 'cloudwatchDescribeLogStreams')
                .resolves({
                  logStreams: [
                    { uploadSequenceToken: 'madhatter' },
                  ],
                })
              const spyDone = this.spy()
              const job = {
                data: {
                  logGroupName: 'Alice',
                  logStreamName: 'Wonderland',
                  logEvents: [],
                },
                attempts: 0,
              }

              processor(job, spyDone).then(a => {
                const message = (
                  'The given sequence token is invalid.' +
                  '\n==> A valid token madhatter has been refetched and saved.' +
                  '\n====> The job has reached its maximum retries.'
                )
                expect(spyDone.args[0][0].message).to.eql(message)
                done()
              })
            })
          )
        })

        describe('when describeLogStreams fails', () => {
          it(
            'completes the job with CloudWatch Logs describeLogStreams error',
            sinonTest(function(done) {
              const stubbedPutLogEvents = this
                .stub(CloudWatchLogs, 'cloudwatchPutLogEvents')
                .rejects({ code: 'InvalidSequenceTokenException' })
              const stubbedDescribeLogStreams = this
                .stub(CloudWatchLogs, 'cloudwatchDescribeLogStreams')
                .rejects('Tweedledee')
              const spyDone = this.spy()
              const job = {
                data: {
                  logGroupName: 'Alice',
                  logStreamName: 'Wonderland',
                  logEvents: [],
                }
              }

              processor(job, spyDone).then(a => {
                expect(spyDone.args[0][0].name).to.eq('Tweedledee')
                done()
              })
            })
          )
        })
      })

      describe('when these is another failing reason', () => {
        it('completes the job with CloudWatch Logs error', sinonTest(function(done) {
          const stubbedPromise = this
            .stub(CloudWatchLogs, 'cloudwatchPutLogEvents')
            .rejects('teatime')
          const spyDone = this.spy()
          const job = {
            data: {
              logGroupName: 'Alice',
              logStreamName: 'Wonderland',
              logEvents: [],
            }
          }

          processor(job, spyDone).then(a => {
            expect(spyDone.args[0][0].name).to.eq('teatime')
            done()
          })
        }))
      })
    })
  })
})
