import {r, combineRoutes} from '@marblejs/core'
import {mapTo} from 'rxjs/operators'
import {Customer, createCustomer} from '../db/customers'
import {createReservation, getReservations, Reservation, ReservationListing} from '../db/reservations'
import {create$, getData$} from './common'

const createCustomer$ = r.pipe (
  r.matchPath ('/customers/create'),
  r.matchType ('POST'),
  r.useEffect (create$ ({
    validator: Customer,
    creator: createCustomer,
  }))
)

const createReservation$ = r.pipe (
  r.matchPath ('/reservations/create'),
  r.matchType ('POST'),
  r.useEffect (create$ ({
    validator: Reservation,
    creator: createReservation
  }))
)

const getReservations$ = r.pipe (
  r.matchPath ('/reservations/list'),
  r.matchType ('POST'),
  r.useEffect (getData$ ({
    validator: ReservationListing,
    getter: getReservations
  }))
)

const home$ = r.pipe (
  r.matchPath ('/'),
  r.matchType ('GET'),
  r.useEffect (req$ => req$.pipe (
     mapTo ({body: 'Hello, world!!'})
  ))
)

export const api$ = combineRoutes ('/', [
  home$,
  createCustomer$,
  createReservation$,
  getReservations$
])
