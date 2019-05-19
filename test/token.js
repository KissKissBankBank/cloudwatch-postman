import chai, { expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import AWS from 'aws-sdk-mock'
import {
  generateSalt,
  generateHash,
  generateToken,
  isTokenExpired,
  isAppTokenValid,
  isAccessTokenValid,
  createAccessToken,
} from '../lib/token'
import { createTestAppToken } from './index'

global.chai = chai
global.expect = expect
chai.use(sinonChai)

const crypto = require('crypto')
describe('========== token.js ==========', () => {
  let sandbox

  before(() => sandbox = sinon.createSandbox())
  afterEach(() => sandbox.restore())

  describe('generateSalt', () => {
    it('returns a string', () => {
      const toStringSpy = sandbox.spy()
      const stubbedRandomBytes = sandbox
        .stub(crypto, 'randomBytes')
        .returns({ toString: toStringSpy })

      generateSalt(10)
      expect(stubbedRandomBytes).to.have.been.calledWith(10)
      expect(toStringSpy).to.have.been.calledWith('hex')
    })
  })

  describe('generateHash', () => {
    it('returns a string', () => {
      const updateSpy = sandbox.spy()
      const stubbedCreateHash = sandbox
        .stub(crypto, 'createHash')
        .returns({ update: updateSpy })

      generateHash('Alice in Wonderland')
      expect(stubbedCreateHash).to.have.been.calledWith('sha256')
      expect(updateSpy).to.have.been.calledWith('Alice in Wonderland')
    })
  })

  describe('generateToken', () => {
    it('returns a string', () => {
      const toStringSpy = sandbox.spy()
      const stubbedFrom = sandbox
        .stub(Buffer, 'from')
        .returns({ toString: toStringSpy })

      generateToken(['alice', 'in', 'wonderland'], '-')
      expect(stubbedFrom).to.have.been.calledWith('alice-in-wonderland')
      expect(toStringSpy).to.have.been.calledWith('base64')
    })
  })

  describe('isTokenExpired', () => {
    describe('without expiration parameter', () => {
      describe('when token is expired', () => {
        it('returns true', () => {
          const today = new Date()
          const expiredTokenDate = new Date()
          expiredTokenDate.setDate(today.getDate() - 2)
          const expiredTokenTime = expiredTokenDate.getTime()

          expect(isTokenExpired(expiredTokenTime)).to.eq(true)
        })
      })

      describe('when token is valid', () => {
        it('returns true', () => {
          const validTokenDate = new Date()
          const validTokenTime = validTokenDate.getTime()

          expect(isTokenExpired(validTokenTime)).to.eq(false)
        })
      })
    })

    describe('with expiration parameter', () => {
      describe('when token is expired', () => {
        it('returns true', () => {
          const today = new Date()
          const expiredTokenDate = new Date()
          expiredTokenDate.setHours(today.getHours() - 2)
          const expiredTokenTime = expiredTokenDate.getTime()

          expect(isTokenExpired(expiredTokenTime, { hour: 1 })).to.eq(true)
        })
      })

      describe('when token is valid', () => {
        it('returns true', () => {
          const validTokenDate = new Date()
          const validTokenTime = validTokenDate.getTime()

          expect(isTokenExpired(validTokenTime, { hour: 1 })).to.eq(false)
        })
      })
    })
  })

  describe('isAccessTokenValid', () => {
    describe('when access token is expired', () => {
      it('returns false', () => {
        const createTestAccessToken = () => {
          const today = new Date()
          const expiredTokenDate = new Date()
          expiredTokenDate.setDate(today.getDate() - 2)
          const expiredTokenTime = expiredTokenDate.getTime()
          const salt = generateSalt(12)
          const secret = process.env.ACCESS_TOKEN_SECRET_KEY
          const delimiter = '::'
          const hash = generateHash(`${expiredTokenTime}${salt}${secret}`)

          return generateToken([expiredTokenTime, salt, secret], delimiter)
        }
        const token = createTestAccessToken()

        expect(isAccessTokenValid(token)).to.eq(false)
      })
    })

    describe('when access token is valid', () => {
      describe('with a correct secret', () => {
        it('returns true', () => {
          const token = createAccessToken()

          expect(isAccessTokenValid(token)).to.eq(true)
        })
      })

      describe('with a wrong secret', () => {
        it('returns false', () => {
          const createTestAccessToken = () => {
            const today = new Date()
            const tokenTime = today.getTime()
            const salt = generateSalt(12)
            const secret = 'wrong-secret'
            const delimiter = '::'
            const hash = generateHash(`${tokenTime}${salt}${secret}`)

            return generateToken([tokenTime, salt, secret], delimiter)
          }
          const token = createTestAccessToken()

          expect(isAccessTokenValid(token)).to.eq(false)
        })
      })

      describe('with tampered data', () => {
        it('returns false', () => {
          const token = 'alice-in-wonderland'

          expect(isAccessTokenValid(token)).to.eq(false)
        })

      })
    })
  })

  describe('isAppTokenValid', () => {
    describe('when access token is expired', () => {
      it('returns false', () => {
        const createExpiredAppAccessToken = () => {
          const today = new Date()
          const expiredTokenDate = new Date()
          expiredTokenDate.setDate(today.getDate() - 2)
          const expiredTokenTime = expiredTokenDate.getTime()
          const salt = generateSalt(8)
          const secret = process.env.APP_SECRET_KEY
          const delimiter = '::'
          const hash = generateHash(`${expiredTokenTime}${salt}${secret}`)

          return generateToken([expiredTokenTime, salt, secret], delimiter)
        }
        const token = createExpiredAppAccessToken()

        expect(isAppTokenValid(token)).to.eq(false)
      })
    })

    describe('when access token is valid', () => {
      describe('with a correct secret', () => {
        it('returns true', () => {
          const token = createTestAppToken()

          expect(isAppTokenValid(token)).to.eq(true)
        })
      })

      describe('with a wrong secret', () => {
        it('returns false', () => {
        const createWrongAppAccessToken = () => {
          const today = new Date()
          const tokenTime = today.getTime()
          const salt = generateSalt(8)
          const secret = 'wrong-secret'
          const delimiter = '::'
          const hash = generateHash(`${tokenTime}${salt}${secret}`)

          return generateToken([tokenTime, salt, secret], delimiter)
        }
        const token = createWrongAppAccessToken()

          expect(isAppTokenValid(token)).to.eq(false)
        })
      })

      describe('with tampered data', () => {
        it('returns false', () => {
          const token = 'alice-in-wonderland'

          expect(isAppTokenValid(token)).to.eq(false)
        })
      })
    })
  })

  describe('createAccessToken', () => {

  })
})
