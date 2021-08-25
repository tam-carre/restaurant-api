import { httpListener } from '@marblejs/core'
import { logger$ } from '@marblejs/middleware-logger'
import { bodyParser$ } from '@marblejs/middleware-body'
import { api$ } from './api.effects'

export const listener = httpListener ({
  middlewares: [
    logger$ (),
    bodyParser$ ()
  ],
  effects: [
    api$
  ]
})
