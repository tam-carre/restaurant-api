import {createServer} from '@marblejs/core'
import {listener} from './http.listener'

createServer ({
  port: 3000,
  hostname: '0.0.0.0',
  listener
}).then (server => server ())
