import Promise from 'es6-promise'
import chai from 'chai'
import mocksHttp from 'node-mocks-http'
import chaiJsonSchema from 'chai-json-schema'
import sinon from 'sinon'
import conn from '../connections'
import indexCallback from './index.callback'

const expect = chai.expect

chai.use(chaiJsonSchema)

describe('./routes/index.callback', () => {
  let res

  beforeEach(() => {
    res = mocksHttp.createResponse({
      eventEmitter: require('events').EventEmitter
    })
  })

  describe('all', () => {
    let stubConnS3GetObject

    before(() => {
      stubConnS3GetObject = sinon.stub(conn.s3, 'getObject')
      stubConnS3GetObject.callsFake(() => {
        return {
          promise: () => {
            return Promise.resolve({
              Body: new Buffer(JSON.stringify([
                { from: '/a', to: '/b' },
                { from: '/home', to: '/' }
              ]))
            })
          }
        }
      })
    })

    after(() => {
      conn.s3.getObject.restore()
    })

    it('success', (done) => {
      const req = mocksHttp.createRequest({
        host: 'cnn.com',
        originalUrl: '/a?myParam=value'
      })

      sinon.stub(conn.dyndb, 'scan').callsFake((params, cb) => {
        cb(null, {
          Count: 1,
          Items: [
            {
              objectKey: 'a/b/c/file.json',
              targetHost: 'www.cnn.com',
              targetProtocol: 'https'
            }
          ]
        })
      })

      res.on('end', () => {
        try {
          const data = res._getRedirectUrl()
          expect(res.statusCode).to.be.equal(301)
          expect(data).to.be.equal('https://www.cnn.com/b?myParam=value')
          conn.dyndb.scan.restore()
          done()
        } catch (err) {
          done(err)
        }
      })

      indexCallback.all(req, res)
    })

    it('should return not matched', (done) => {
      const req = mocksHttp.createRequest({
        host: 'cnn.com',
        originalUrl: '/y'
      })

      sinon.stub(conn.dyndb, 'scan').callsFake((params, cb) => {
        cb(null, {
          Count: 1,
          Items: [
            {
              objectKey: 'a/b/c/file.json',
              targetHost: 'www.cnn.com',
              targetProtocol: 'https'
            }
          ]
        })
      })

      res.on('end', () => {
        try {
          const data = res._getData()
          expect(res.statusCode).to.be.equal(200)
          expect(data).to.be.equal('URL does not match.')
          conn.dyndb.scan.restore()
          done()
        } catch (err) {
          done(err)
        }
      })

      indexCallback.all(req, res)
    })

    it('should return not found', (done) => {
      const req = mocksHttp.createRequest({
        host: 'cnn.com',
        originalUrl: '/y'
      })

      sinon.stub(conn.dyndb, 'scan').callsFake((params, cb) => {
        cb(null, {
          Count: 0,
          Items: []
        })
      })

      res.on('end', () => {
        try {
          const data = res._getData()
          expect(res.statusCode).to.be.equal(404)
          expect(data).to.be.equal('Not found.')
          conn.dyndb.scan.restore()
          done()
        } catch (err) {
          done(err)
        }
      })

      indexCallback.all(req, res)
    })

    it('should return generic error', (done) => {
      const req = mocksHttp.createRequest({
        host: 'cnn.com',
        originalUrl: '/y'
      })

      sinon.stub(conn.dyndb, 'scan').callsFake((params, cb) => {
        cb(null, {
          Count: 1,
          Items: [
            {
              objectKey: 'a/b/c/file.json',
              targetHost: 'www.cnn.com',
              targetProtocol: 'https'
            }
          ]
        })
      })

      stubConnS3GetObject.callsFake(() => {
        return {
          promise: () => {
            return Promise.reject({
              name: 'NAME',
              message: 'message'
            })
          }
        }
      })

      res.on('end', () => {
        try {
          const data = res._getData()
          expect(res.statusCode).to.be.equal(500)
          expect(data).to.be.equal('message')
          conn.dyndb.scan.restore()
          done()
        } catch (err) {
          done(err)
        }
      })

      indexCallback.all(req, res)
    })
  })
})