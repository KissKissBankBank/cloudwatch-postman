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
})
