import {r, combineRoutes} from '@marblejs/core'
import {mapTo, mergeMap} from 'rxjs/operators'
import { requestValidator$ } from '@marblejs/middleware-io'
import { Customer, createCustomer } from '../db/customers'
import * as Ob from 'fp-ts-rxjs/Observable'
import {flow} from 'fp-ts/lib/function'
import * as T from 'fp-ts/lib/Task'
import {prop} from 'fp-ts-ramda'

const createCustomer$ = r.pipe (
  r.matchPath ('/user/create'),
  r.matchType ('POST'),
  r.useEffect (req$ => req$.pipe (
    requestValidator$ ({ body: Customer }),
    mergeMap (flow (
      prop ('body'),
      createCustomer,
      T.map (success => success
        ? { body: 'Successfully created customer.' }
        : { status: 400, body: 'A customer with this email address exists.' }
      ),
      Ob.fromTask
    )),
  ))
)

export const home$ = r.pipe (
  r.matchPath ('/'),
  r.matchType ('GET'),
  r.useEffect (req$ => req$.pipe (
     mapTo ({body: 'Hello, world!!'})
  ))
)

export const api$ = combineRoutes ('/', [
  home$,
  createCustomer$,
])
