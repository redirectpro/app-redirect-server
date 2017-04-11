import ErrorHandler from './error.handler'
import chai from 'chai'
import httpMocks from 'node-mocks-http'

const assert = chai.assert
const expect = chai.expect

const req = httpMocks.createRequest()
const res = httpMocks.createResponse()

describe('./handlers/error.handler', () => {
  it('should return message AnyMessage and status 500', (done) => {
    let err = {
      name: 'AnyError',
      message: 'AnyMessage'
    }

    ErrorHandler.responseError(err, req, res)

    assert.equal(res.statusCode, 500)

    let data = res._getData()
    expect(data).to.be.a('object')
    assert.equal(data.message, 'AnyMessage')

    done()
  })

  it('should return message UnauthorizedMessage and status 401', (done) => {
    let err = {
      name: 'UnauthorizedError',
      message: 'UnauthorizedMessage'
    }

    ErrorHandler.responseError(err, req, res)

    assert.equal(res.statusCode, 401)

    let data = res._getData()
    expect(data).to.be.a('object')
    assert.equal(data.message, 'UnauthorizedMessage')

    done()
  })
})
