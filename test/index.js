import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import server from './../lib/index'
import AWS from 'aws-sdk-mock'
import {
  generateSalt,
  generateHash,
  generateToken,
  createAccessToken,
} from '../lib/token'

global.chai = chai
global.expect = expect
chai.use(chaiHttp)

export const createTestAppToken = () => {
  const date = new Date().getTime()
  const salt = generateSalt(8)
  const secret = process.env.APP_SECRET_KEY
  const delimiter = '::'
  const hash = generateHash(`${date}${salt}${secret}`)

  return generateToken([date, salt, hash], delimiter)
}

describe('=========== index.js ==========', () => {
  beforeEach(() => {
    AWS.mock('CloudWatch', 'putMetricData', function (params, callback){
      callback(null, { ResponseMetadata: { RequestId: 'foobar' }})
    });
  })

  afterEach(() => {
    AWS.restore('CloudWatch')
  })

  describe('GET /test', () => {
    it('returns a 200 with a data object', (done) => {
      const appToken = createTestAppToken()

      chai.request(server)
        .get(`/test?appToken=${appToken}`)
        .end((err, res) => {
          const { status, body } = res

          expect(status).to.eq(200)
          expect(body.ResponseMetadata.RequestId).to.eq('foobar')

          done()
        })
    })
  })

  describe('POST /token', () => {
    describe('with a valid app token', () => {
      it('returns a 201 with the newly created access token', (done) => {
        const appToken = createTestAppToken()

        chai.request(server)
          .post('/token')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify({ appToken }))
          .end((err, res) => {
            const { status, body } = res

            expect(status).to.eq(201)
            expect(body).to.have.key('accessToken')

            done()
          })
      })
    })

    describe('with an invalid app token', () => {
      it('returns a 401 with an error object', (done) => {
        const appToken = 'aliceInWonderland'

        chai.request(server)
          .post('/token')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify({ appToken }))
          .end((err, res) => {
            const { status, body } = res

            expect(status).to.eq(401)
            expect(body.error.code).to.eq(101)
            expect(body.error.message)
              .to.eq('Required parameter "appToken" is invalid.')

            done()
          })
      })
    })

    describe('without an app token', () => {
      it('returns a 403 with an error object', (done) => {
        chai.request(server)
          .post('/token')
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            const { status, body } = res

            expect(status).to.eq(403)
            expect(body.error.code).to.eq(100)
            expect(body.error.message)
              .to.eq('Required parameter is missing: "appToken".')

            done()
          })
      })
    })
  })

  describe('POST /metric', () => {
    describe('with a valid access token', () => {
      it('returns a response', (done) => {
        const accessToken = createAccessToken()
        const params = {
          accessToken,
          params: {
            MetricData: [
              {
                MetricName: 'HELLO_WORLD',
                Value: 100,
              }
            ],
            Namespace: 'cloudwatch-postman',
          }
        }

        chai.request(server)
          .post('/metric')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(params))
          .end((err, res) => {
            const { status, body } = res

            expect(status).to.eq(201)
            expect(body.ResponseMetadata.RequestId).to.eq('foobar')

            done()
          })
      })
    })

    describe('with an invalid access token', () => {
      it('returns a 401 with an error object', (done) => {
        const accessToken = 'aliceInWonderland'

        const params = {
          accessToken,
          params: {
            MetricData: [
              {
                MetricName: 'HELLO_WORLD',
                Value: 100,
              }
            ],
            Namespace: 'cloudwatch-postman',
          }
        }

        chai.request(server)
          .post('/metric')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(params))
          .end((err, res) => {
            const { status, body } = res

            expect(status).to.eq(401)
            expect(body.error.code).to.eq(111)
            expect(body.error.message)
              .to.eq('Required parameter "accessToken" is invalid.')

            done()
          })
      })
    })

    describe('without an access token', () => {
      it('returns a 403 with an error object', (done) => {
        const params = {
          params: {
            MetricData: [
              {
                MetricName: 'HELLO_WORLD',
                Value: 100,
              }
            ],
            Namespace: 'cloudwatch-postman',
          }
        }

        chai.request(server)
          .post('/metric')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(params))
          .end((err, res) => {
            const { status, body } = res

            expect(status).to.eq(403)
            expect(body.error.code).to.eq(110)
            expect(body.error.message)
              .to.eq('Required parameter is missing: "accessToken".')

            done()
          })
      })
    })
  })

  describe('POST /logEvents', () => {
    beforeEach(() => {
      AWS.mock('CloudWatchLogs', 'putLogEvents', function (params, callback){
        callback(null, { nextSequenceToken: 'foobar' })
      });
    })

    afterEach(() => {
      AWS.restore('CloudWatchLogs')
    })

    describe('with a valid access token', () => {
      it('returns a response', (done) => {
        const accessToken = createAccessToken()
        const params = {
          accessToken,
          params: {
            logGroupName: 'RUM',
            logStreamName: 'cloudwatch-postman-test',
            logEvents: [
              {
                message: 'This is a test.',
                timestamp: '1558602946107',
              },
            ],
            sequenceToken: 'the-cheshire-cat',
          },
        }

        chai.request(server)
          .post('/logEvents')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(params))
          .end((err, res) => {
            const { status, body } = res

            expect(status).to.eq(201)
            expect(body.nextSequenceToken).to.eq('foobar')

            done()
          })
      })
    })

  })
})
