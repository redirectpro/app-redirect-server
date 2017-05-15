import LoggerHandler from '../handlers/logger.handler'
const logger = new LoggerHandler()

class CustomError extends Error {
  constructor (name, message) {
    super(message)
    this.name = name
  }
}

// error handler
export default class ErrorHandler {

  static responseError (err, req, res, next) {
    let status = err.statusCode || 500

    if (err.name === 'UnauthorizedError') {
      status = 401
    }

    const body = {
      message: err.message
    }

    res.status(status).send(body)

    logger.warn('ErrorHandler', body)

    if (next) next()
  }

  static makeSureErrorIsNull (err, content) {
    if (!err && typeof (content) === 'string' && content === 'NotFound') {
      err = {
        name: 'UserNotFound',
        message: 'User not found.'
      }
    }

    return err
  }

  static typeError (name, message) {
    return new CustomError(name, message)
  }
}
