import {r, combineRoutes} from '@marblejs/core'
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

export const api$ = combineRoutes ('/', [
  createCustomer$,
  createReservation$,
  getReservations$
])
