import express from 'express'
import http from 'http'
import config from './config'
import routes from './routes'
import ErrorHandler from './handlers/error.handler'

class App {

  constructor () {
    this.app = express()
  }

  prepar () {
    // api routers
    this.app.use(routes())

    // Formata error genericos
    this.app.use(ErrorHandler.responseError)
  }

  startListen () {
    this.app.server = http.createServer(this.app)
    this.app.server.listen(config.port)
    console.log(`Started on port ${this.app.server.address().port}`)
  }

  stopListen () {
    this.app.server.close()
  }

  initialize () {
    this.prepar()
    this.startListen()
  }

  returnApp () {
    return this.app
  }
}

if (!module.parent) {
  const app = new App()
  app.initialize()
}

export default App
