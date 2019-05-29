import chai, { expect } from 'chai'
import AWS from 'aws-sdk-mock'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {
  tokenKey,
  getValidSequenceToken,
  saveValidSequenceToken,
} from '../lib/worker'

global.chai = chai
global.expect = expect
chai.use(sinonChai)

const redis = require('ioredis')

describe('=========== worker.js ==========', () => {
  let sandbox

  before(() => sandbox = sinon.createSandbox())
  afterEach(() => sandbox.restore())
  // beforeEach(() => {
    // AWS.mock('CloudWatchLogs', 'putLogEvents', function (params, callback){
      // callback(null, { nextSequenceToken: 'foobar' })
    // });
  // })

  // afterEach(() => {
    // AWS.restore('CloudWatchLogs')
  // })

  describe('tokenKey', () => {
    it('returns a formatted key', () => {
      expect(tokenKey('alice', 'cat')).to.eq('alice-cat-next-token')
    })
  })

  describe('getValidSequenceToken', () => {
    it('returns the token related to the logGroupName and logStreamName', () => {
      const stubbedRedisGet = sandbox.stub(redis.prototype, 'get')

      getValidSequenceToken('alice', 'cat')
      expect(stubbedRedisGet).to.have.been.calledWith('alice-cat-next-token')
    })
  })

  describe('saveValidSequenceToken', () => {
    it('save the passed token into Redis', () => {
      const stubbedRedisSet = sandbox.stub(redis.prototype, 'set')

      saveValidSequenceToken('cheshire', 'alice', 'cat')
      expect(stubbedRedisSet)
        .to.have.been.calledWith('alice-cat-next-token', 'cheshire')
    })
  })
})
