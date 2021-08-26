import * as t from 'io-ts'
import * as TO from 'fp-ts/TaskOption'
import * as T from 'fp-ts/Task'
import {pipe} from 'fp-ts/lib/function'
import {TOdidAffectAnyRow, TOquery, TOreturnArrayIfValid} from './common'
import {prop} from 'fp-ts-ramda'

export const createReservation = (
  {customerEmail, restaurantTable, arrivalDateTime}: ReservationCreationProps
): T.Task<boolean> => pipe (
  `INSERT INTO
  reservations(customer, restaurantTable, arrivalDate, arrivalTime)
  VALUES($1, $2, $3, $4)
  ON CONFLICT DO NOTHING`,
  TOquery ([customerEmail, restaurantTable, arrivalDateTime, arrivalDateTime]),
  TOdidAffectAnyRow
)

export const getReservations = (
  {fromDate, toDate}: ReservationListingProps
): TO.TaskOption<Reservation[]> => pipe (
  `SELECT customer, restaurantTable, arrivalDate, arrivalTime,
  FROM reservations
  INNER JOIN customers ON customers.email = reservations.customer
  WHERE "arrivalDate" BETWEEN $1 AND $2`,
  TOquery ([fromDate, toDate]),
  TO.map (prop ('rows')),
  TOreturnArrayIfValid (Reservation),
)

///////////////////////////////////////////////////////////////////////////////

type Reservation = t.TypeOf<typeof Reservation>
const Reservation = t.type ({
  customer: t.string,
  email: t.string,
  restaurantTable: t.string,
  arrivalDate: t.string,
  arrivalTime: t.string
})

interface ReservationCreationProps {
  customerEmail: string
  restaurantTable: number
  arrivalDateTime: Date
}

interface ReservationListingProps {
  fromDate: string
  toDate: string
}
