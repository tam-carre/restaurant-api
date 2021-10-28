import {r, combineRoutes} from '@marblejs/core'
import {mapTo} from 'rxjs/operators'
import {Customer, createCustomer} from '../db/customers'
import {createReservation, getReservations, Reservation, ReservationListing} from '../db/reservations'
import {create$, getData$} from './common'
import fs from 'fs'

const createCustomer$ = r.pipe (
  r.matchPath ('/customers'),
  r.matchType ('POST'),
  r.useEffect (create$ ({
    validator: Customer,
    creator: createCustomer,
  }))
)

const createReservation$ = r.pipe (
  r.matchPath ('/reservations'),
  r.matchType ('POST'),
  r.useEffect (create$ ({
    validator: Reservation,
    creator: createReservation
  }))
)

const getReservations$ = r.pipe (
  r.matchPath ('/reservations'),
  r.matchType ('GET'),
  r.useEffect (getData$ ({
    validator: ReservationListing,
    getter: getReservations
  }))
)

const getDocs$ = r.pipe (
  r.matchPath ('/'),
  r.matchType ('GET'),
  r.useEffect (req$ => req$.pipe (
    mapTo ({
      headers: { "Content-Type": "text/html" },
      body: fs.readFileSync ('./docs/index.html')
    })
  ))
)

export const api$ = combineRoutes ('/', [
  createCustomer$,
  createReservation$,
  getReservations$,
  getDocs$,
])
