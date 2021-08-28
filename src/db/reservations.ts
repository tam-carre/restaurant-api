import * as t from 'io-ts'
import * as td from 'io-ts-types'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {TEquery, TEreturnArrayIfValid} from './common'
import {prop} from 'fp-ts-ramda'
import {getTime} from '../util'
const {abs} = Math

// In a complete system, this would not be hardcoded
const TABLES = [1, 2, 3, 4, 5]
const OPENING = getTime ('19:00:00')
const CLOSING = getTime ('24:00:00')

export const createReservation = (
  {customer, restaurantTable, arrivalDate, arrivalTime}: Reservation
): TE.TaskEither<Error, number> => pipe (
  TE.of (`INSERT INTO
  reservations(customer, "restaurantTable", "arrivalDate", "arrivalTime")
  VALUES($1, $2, $3, $4)
  ON CONFLICT DO NOTHING`),
  TE.chain (query => pipe (
    isTableFree ({restaurantTable, arrivalDate, arrivalTime}),
    TE.chain (isFree =>
        !isFree
      ? TEerr ('This table is not free at this time.')

      : TABLES.every (table => table !== restaurantTable)
      ? TEerr (`Table ${restaurantTable} does not exist.`)

      : (getTime (arrivalTime) < OPENING) || (getTime (arrivalTime) > CLOSING)
      ? TEerr ("The restaurant is closed at this time.")

      : TEquery ([customer, restaurantTable, arrivalDate, arrivalTime]) (query)
    )
  )),
  TE.map (prop ('rowCount')),
  TE.mapLeft (err => err.message.includes ('reservations_customer_fkey')
    ? new Error ('No customer with this email address was found.')
    : err
  )
)

export const getReservations = (
  {fromDate, toDate}: ReservationListing
): TE.TaskEither<Error, Reservation[]> => pipe (
  `SELECT customer, "restaurantTable", "arrivalDate", "arrivalTime",
  FROM reservations
  INNER JOIN customers ON customers.email = reservations.customer
  WHERE "arrivalDate" BETWEEN $1 AND $2`,
  TEquery ([fromDate, toDate]),
  TE.map (prop ('rows')),
  TEreturnArrayIfValid (Reservation),
)

export type Reservation = t.TypeOf<typeof Reservation>
export const Reservation = t.type ({
  customer: t.string,
  restaurantTable: t.number,
  arrivalDate: t.union ([td.date, t.string]),
  arrivalTime: t.string
})

///////////////////////////////////////////////////////////////////////////////

const HOUR = 1000*60*60 - 1000

const TEerr = (message: string) => TE.left (new Error (message))

const isTableFree = (
  {restaurantTable, arrivalDate, arrivalTime}: Omit<Reservation, 'customer'>
): TE.TaskEither<Error, boolean> => pipe (
  `SELECT customer, "restaurantTable", "arrivalDate", "arrivalTime"
  FROM reservations
  WHERE "arrivalDate" = $1 AND "restaurantTable" = $2`,
  TEquery ([arrivalDate, restaurantTable]),
  TE.map (prop ('rows')),
  TEreturnArrayIfValid (Reservation),
  TE.map (reservations => reservations.every (
    res => abs (getTime (res.arrivalTime) - getTime (arrivalTime)) > HOUR
  ))
)

export type ReservationListing = t.TypeOf<typeof ReservationListing>
export const ReservationListing = t.type ({
  fromDate: t.string,
  toDate: t.string
})
