import Router from 'express'
import indexCallback from './index.callback'

export default () => {
  let router = Router()

  router.all('/*', indexCallback.all)

  return router
}
