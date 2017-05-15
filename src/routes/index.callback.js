import conn from '../connections'
import config from '../config'

exports.all = (req, res) => {
  const host = req.get('host').split(':')[0]
  const path = req.originalUrl.split('?')[0]
  let params = ''

  if (req.originalUrl.split('?')[1]) {
    params = '?' + req.originalUrl.split('?')[1]
  }

  const scanParams = {
    TableName: `${config.dynamodbPrefix}redirect`,
    FilterExpression: 'contains(#field,:value)',
    ExpressionAttributeNames: {
      '#field': 'hostSources'
    },
    ExpressionAttributeValues: {
      ':value': host
    },
    Limit: 1
  }
  // res.status(200).send('ok');
  // Needed super refactore to avoid regular access to s3. Must store in redis
  // to facility to flush cache.
  conn.dyndb.scan(scanParams, (err, data) => {
    if (err || data.Count === 0 || !data.Items[0].objectKey) return res.status(200).send('not found')
    let hostTarget = data.Items[0].hostTarget

    if (!/^http[s]?:/.hostTarget) {
      hostTarget = 'http://' + hostTarget
    }

    const s3Params = { Bucket: config.awsS3Bucket, Key: data.Items[0].objectKey }

    conn.s3.getObject(s3Params).promise().then((data) => {
      const body = JSON.parse(data.Body.toString())
      const match = body.find((e) => e.from === path)

      if (match) {
        return res.redirect(match.statusCode || 301, hostTarget + '/' + match.to + params)
      } else {
        return res.status(200).send('not matched')
      }
    }).catch((err) => {
      return res.status(200).send(err.message)
    })
  })
}
