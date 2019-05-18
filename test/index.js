import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import server from './../lib/index'
import AWS from 'aws-sdk-mock'

global.chai = chai
global.expect = expect
chai.use(chaiHttp)

beforeEach(() => {
  AWS.mock('CloudWatch', 'putMetricData', function (params, callback){
    callback(null, 'ok');
  });
})

afterEach(() => {
  AWS.restore('CloudWatch')
})

describe('GET /test', () => {
  it('returns a response', (done) => {
    chai.request(server)
      .get('/test')
      .end((err, res) => {
        expect(res.status).to.eq(200)
        expect(JSON.parse(res.body)).to.eq('ok')
        done()
      })
  })
})

describe('POST /metric', () => {
  it('returns a response', (done) => {
    const params = {
      MetricData: [
        {
          MetricName: 'HELLO_WORLD',
          Value: 100,
        }
      ],
      Namespace: 'cloudwatch-postman',
    }

    chai.request(server)
      .post('/metric')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(params))
      .end((err, res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.eq('ok')
        done()
      })
  })
})
