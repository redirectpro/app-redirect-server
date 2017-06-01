import conn from '../connections'
import config from '../config'
import ErrorHandler from '../handlers/error.handler'

const errorHandler = new ErrorHandler()

exports.all = (req, res) => {
  const hostname = req.hostname.split(':')[0]
  const originalUrl = req.originalUrl
  let targetHost
  let getParams

  getParams = {
    TableName: `${config.dynamodbPrefix}redirect_hostsource`,
    Key: {
      hostsource: hostname
    }
  }

  // Needed super refactore to avoid regular access to s3. Must store in redis
  // to facility to flush cache.
  conn.dyndb.get(getParams).promise().then((data) => {
    if (!data.Item) throw errorHandler.custom('HostNotFound', 'Host Not Found.')

    getParams = {
      TableName: `${config.dynamodbPrefix}redirect`,
      Key: {
        applicationId: data.Item.applicationId,
        id: data.Item.redirectId
      }
    }

    return conn.dyndb.get(getParams).promise()
  }).then((data) => {
    if (!data.Item) {
      throw errorHandler.custom('RedirectNotFound', 'Redirect Not Found.')
    }

    targetHost = `${data.Item.targetProtocol}://${data.Item.targetHost}`

    /* Get FromTo when setted */
    if (data.Item.objectKey) {
      const s3Params = { Bucket: config.awsS3Bucket, Key: data.Item.objectKey }
      return conn.s3.getObject(s3Params).promise()

    /* Redirect to main domain when FromTo does not exist */
    } else {
      return { Body: '[]' }
    }
  }).then((data) => {
    const targetUrl = getTargetUrl(originalUrl, JSON.parse(data.Body.toString()))
    return res.redirect(301, `${targetHost}${targetUrl}`)
  }).catch((err) => {
    if (err.name === 'HostNotFound' || err.name === 'RedirectNotFound') {
      return res.status(404).send(err.message)
    } else {
      return res.status(500).send(err.message)
    }
  })
}

function getTargetUrl (url, body) {
  body.push({ 'from': '^/([^?]+)\\??(.*)?$', to: '/$1?$2' })
  let targetUrl = ''
  body.forEach((e) => {
    if (!targetUrl) {
      if (e.from[0] !== '^') e.from = `^${e.from}`
      if (e.from.substr(-1) !== '$') e.from = `${e.from}$`
      const re = new RegExp(e.from)
      if (url.match(re)) {
        targetUrl = url.replace(re, e.to)
      }
    }
  })
  body = undefined
  if (targetUrl.substr(-1) === '?') targetUrl = targetUrl.slice(0, -1)
  return targetUrl
}
