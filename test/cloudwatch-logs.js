import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {
  cloudwatchPutLogEvents,
  cloudwatchDescribeLogStreams,
} from '../lib/cloudwatch-logs'

global.chai = chai
global.expect = expect
chai.use(sinonChai)
const sinonTest = require('sinon-test')(sinon)

describe('=========== cloudwatch-logs.js ==========', () => {
  describe('cloudwatchPutLogEvents', () => {
    describe('on success', () => {
      it('resolves the promise', sinonTest(function(done) {
        const stubbedPutLogEvents = this.stub().callsArgWith(
          1,
          null,
          { nextSequenceToken: 'alice' },
        )
        const cloudwatchLogs = {
          putLogEvents: stubbedPutLogEvents,
        }

        const params = {
          logGroupName: 'Alice',
          logStreamName: 'Wonderland',
          logEvents: [
            {
              message: 'This is a test.',
              timestamp: Date.now(),
            }
          ],
        }

        cloudwatchPutLogEvents(params, cloudwatchLogs).then(data => {
          expect(stubbedPutLogEvents).to.have.been.calledWith(params)
          expect(data.nextSequenceToken).to.eq('alice')
          done()
        })
      }))
    })

    describe('on error', () => {
      it('rejects the promise', sinonTest(function(done) {
        const stubbedPutLogEvents = this.stub().callsArgWith(1, 'cheshire')
        const cloudwatchLogs = {
          putLogEvents: stubbedPutLogEvents,
        }

        const params = {
          logGroupName: 'Alice',
          logStreamName: 'Wonderland',
          logEvents: [
            {
              message: 'This is a test.',
              timestamp: Date.now(),
            }
          ],
        }

        cloudwatchPutLogEvents(params, cloudwatchLogs).catch(error => {
          expect(stubbedPutLogEvents).to.have.been.calledWith(params)
          expect(error).to.eq('cheshire')
          done()
        })
      }))
    })
  })

  describe('describeLogStreams', () => {
    describe('on success', () => {
      it('resolves the promise', sinonTest(function(done) {
        const stubbedDescribeLogStreams = this.stub().callsArgWith(
          1,
          null,
          { logStreams: [ { uploadSequenceToken: 'Tweedledum' } ] },
        )
        const cloudwatchLogs = {
          describeLogStreams: stubbedDescribeLogStreams,
        }

        const params = {
          logGroupName: 'Alice',
          logStreamNamePrefix: 'Wonderland',
          limit: 1,
        }

        cloudwatchDescribeLogStreams(params, cloudwatchLogs).then(data => {
          expect(stubbedDescribeLogStreams).to.have.been.calledWith(params)
          expect(data.logStreams[0].uploadSequenceToken).to.eq('Tweedledum')
          done()
        })
      }))
    })

    describe('on error', () => {
      it('rejects the promise', sinonTest(function(done) {
        const stubbedDescribeLogStreams = this.stub().callsArgWith(
          1,
          'Tweedledee',
        )
        const cloudwatchLogs = {
          describeLogStreams: stubbedDescribeLogStreams,
        }

        const params = {
          logGroupName: 'Alice',
          logStreamNamePrefix: 'Wonderland',
          limit: 1,
        }

        cloudwatchDescribeLogStreams(params, cloudwatchLogs).catch(error => {
          expect(stubbedDescribeLogStreams).to.have.been.calledWith(params)
          expect(error).to.eq('Tweedledee')
          done()
        })
      }))
    })
  })
})
