import ErrorHandler from './error.handler'
import chai from 'chai'
import mocksHttp from 'node-mocks-http'

const assert = chai.assert
const expect = chai.expect

describe('./handlers/error.handler', () => {
  const error = new ErrorHandler()

  describe('responseError', () => {
    let res; let req

    beforeEach(() => {
      req = mocksHttp.createRequest()
      res = mocksHttp.createResponse({
        eventEmitter: require('events').EventEmitter
      })
    })

    it('should return message AnyMessage and status 500', (done) => {
      let err = {
        name: 'AnyError',
        message: 'AnyMessage'
      }

      res.on('end', () => {
        assert.equal(res.statusCode, 500)

        let data = res._getData()
        expect(data).to.be.an('object')
        assert.equal(data.message, 'AnyMessage')

        done()
      })

      error.response(err, req, res)
    })

    it('should return message UnauthorizedMessage and status 401', (done) => {
      let err = {
        name: 'UnauthorizedError',
        message: 'UnauthorizedMessage'
      }

      error.response(err, req, res, () => {
        assert.equal(res.statusCode, 401)

        let data = res._getData()
        expect(data).to.be.an('object')
        assert.equal(data.message, 'UnauthorizedMessage')

        done()
      })
    })
  })

  describe('custom', () => {
    it('should return CustomError', (done) => {
      let err = error.custom('NAME', 'message')
      assert.equal(err.name, 'NAME')
      assert.equal(err.message, 'message')
      done()
    })
  })
})
