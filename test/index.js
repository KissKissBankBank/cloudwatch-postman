import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import server from './../lib/index'

global.chai = chai
global.expect = expect
chai.use(chaiHttp)

describe('GET /test', () => {
  it('returns a response', (done) => {
    chai.request(server)
      .get('/test')
      .end((err, res) => {
        expect(res.status).to.eq(200)
        expect(JSON.parse(res.body)).to.be.an('object')
        expect(JSON.parse(res.body)).to.have.key('ResponseMetadata')
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
        expect(res.body).to.be.an('object')
        expect(res.body).to.have.key('ResponseMetadata')
        done()
      })
  })
})
