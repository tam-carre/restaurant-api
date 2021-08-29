import * as t from 'io-ts'
import * as TE from 'fp-ts/TaskEither'
import {TEquery, TEerrorIfNoAffectedRows, APIError} from './common'
import {pipe} from 'fp-ts/lib/function'

export const createCustomer = (
  {name, email}: Customer
): TE.TaskEither<APIError, number> => pipe (
  'INSERT INTO customers(name, email) VALUES($1, $2) ON CONFLICT DO NOTHING',
  TEquery ([name, email]),
  TE.map (result => result.rowCount),
  TEerrorIfNoAffectedRows (409, 'Another customer has this email address.'),
)

export type Customer = t.TypeOf<typeof Customer>
export const Customer = t.type ({
  email: t.string,
  name: t.string
})

export interface CustomerGetterProps {
  email: string
}
