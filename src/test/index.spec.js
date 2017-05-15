import App from '../index'

describe('./index', () => {
  const app = new App()

  it('start server', (done) => {
    app.initialize()
    done()
  })

  it('stop server', (done) => {
    app.stopListen()
    done()
  })
})
