import * as t from 'io-ts'
import * as td from 'io-ts-types'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import {APIError, TEquery, TEreturnArrayIfValid} from './common'
const {abs} = Math
const getTime = (hhmmss: string) => new Date (`1970-01-01 ${hhmmss}`).getTime ()

// In a complete system, this would not be hardcoded
const TABLES = [1, 2, 3, 4, 5]
const OPENING = getTime ('19:00:00')
const CLOSING = getTime ('24:00:00')

export const createReservation = (
  {customer, restaurantTable, arrivalDate, arrivalTime}: Reservation
): TE.TaskEither<APIError, number> => pipe (
  TE.of (`
    INSERT INTO
    reservations(customer, "restaurantTable", "arrivalDate", "arrivalTime")
    VALUES($1, $2, $3, $4)
    ON CONFLICT DO NOTHING
  `),
  TE.chain (query => pipe (
    isTableFree ({restaurantTable, arrivalDate, arrivalTime}),
    TE.chain (isFree =>
        !isFree
      ? TEerr (409, 'This table is not free at this time.')

      : TABLES.every (table => table !== restaurantTable)
      ? TEerr (422, `Table ${restaurantTable} does not exist.`)

      : (getTime (arrivalTime) < OPENING) || (getTime (arrivalTime) > CLOSING)
      ? TEerr (422, 'The restaurant is closed at this time.')

      : TEquery ([customer, restaurantTable, arrivalDate, arrivalTime]) (query)
    )
  )),
  TE.map (result => result.rowCount),
  TE.mapLeft (err => err.message.includes ('reservations_customer_fkey')
    ? APIError (422, 'No customer with this email address was found.')
    : err
  )
)

export const getReservations = (
  {fromDate, toDate, offset = 0, limit = 50}: ReservationListing
): TE.TaskEither<APIError, FullReservation[]> => pipe (
  `SELECT id, customer, name, "restaurantTable", "arrivalDate", "arrivalTime"
  FROM reservations
  INNER JOIN customers c ON c.email = reservations.customer
  WHERE "arrivalDate" BETWEEN $1 AND $2
  ORDER BY id ASC
  OFFSET $3 LIMIT $4`,
  TEquery ([fromDate, toDate, offset, limit]),
  TE.map (result => result.rows),
  TEreturnArrayIfValid (FullReservation),
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

const TEerr = (code: number, msg: string) => TE.left (APIError (code, msg))

const isTableFree = (
  {restaurantTable, arrivalDate, arrivalTime}: Omit<Reservation, 'customer'>
): TE.TaskEither<Error, boolean> => pipe (
  `SELECT customer, "restaurantTable", "arrivalDate", "arrivalTime"
  FROM reservations
  WHERE "arrivalDate" = $1 AND "restaurantTable" = $2`,
  TEquery ([arrivalDate, restaurantTable]),
  TE.map (result => result.rows),
  TEreturnArrayIfValid (Reservation),
  TE.map (reservations => reservations.every (
    res => abs (getTime (res.arrivalTime) - getTime (arrivalTime)) > HOUR
  ))
)

export type ReservationListing = t.TypeOf<typeof ReservationListing>
export const ReservationListing = t.type ({
  offset: t.union ([t.number, t.undefined]),
  limit: t.union ([t.number, t.undefined]),
  fromDate: t.string,
  toDate: t.string,
})

// couldn't make t.intersection type infer properly so this code isn't DRY
type FullReservation = t.TypeOf<typeof FullReservation>
const FullReservation = t.type ({
  id: t.number,
  name: t.string,
  customer: t.string,
  restaurantTable: t.number,
  arrivalDate: t.union ([td.date, t.string]),
  arrivalTime: t.string
})

