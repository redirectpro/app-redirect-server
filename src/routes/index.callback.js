import conn from '../connections'
import config from '../config'
import ErrorHandler from '../handlers/error.handler'

const errorHandler = new ErrorHandler()

exports.all = (req, res) => {
  const host = req.hostname.split(':')[0]
  const path = req.originalUrl.split('?')[0]
  let finalTargetHost
  let params = ''

  if (req.originalUrl.split('?')[1]) {
    params = '?' + req.originalUrl.split('?')[1]
  }

  let getParams

  getParams = {
    TableName: `${config.dynamodbPrefix}redirect_hostsource`,
    Key: {
      hostsource: host
    }
  }

  // Needed super refactore to avoid regular access to s3. Must store in redis
  // to facility to flush cache.
  conn.dyndb.get(getParams).promise().then((data) => {
    if (!data.Item) throw errorHandler.custom('NotFound', 'Not Found.')

    getParams = {
      TableName: `${config.dynamodbPrefix}redirect`,
      Key: {
        applicationId: data.Item.applicationId,
        id: data.Item.redirectId
      }
    }

    return conn.dyndb.get(getParams).promise()
  }).then((data) => {
    if (!data.Item || !data.Item.objectKey) {
      throw errorHandler.custom('NotFound', 'Not Found.')
    }

    const targetProtocol = data.Item.targetProtocol
    const targetHost = data.Item.targetHost
    finalTargetHost = `${targetProtocol}://${targetHost}`

    const s3Params = { Bucket: config.awsS3Bucket, Key: data.Item.objectKey }

    return conn.s3.getObject(s3Params).promise()
  }).then((data) => {
    const body = JSON.parse(data.Body.toString())
    const match = body.find((e) => e.from === path)
    if (match) {
      return res.redirect(match.statusCode || 301, finalTargetHost + '' + match.to + params)
    } else {
      return res.status(200).send('URL does not match.')
    }
  }).catch((err) => {
    if (err.name === 'NotFound') {
      return res.status(404).send(err.message)
    } else {
      return res.status(500).send(err.message)
    }
  })
}
