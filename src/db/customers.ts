import * as t from 'io-ts'
import * as TE from 'fp-ts/TaskEither'
import {TEgetFirstRow, TEreturnObjectIfValid, TEquery, TEerrorIfNoAffectedRows} from './common'
import {pipe} from 'fp-ts/lib/function'
import {prop} from 'fp-ts-ramda'

export const createCustomer = (
  {name, email}: Customer
): TE.TaskEither<Error, number> => pipe (
  'INSERT INTO customers(name, email) VALUES($1, $2) ON CONFLICT DO NOTHING',
  TEquery ([name, email]),
  TE.map (prop ('rowCount')),
  TEerrorIfNoAffectedRows ('Another customer has this email address.'),
)

export const getCustomer = (
  {email}: CustomerGetterProps
): TE.TaskEither<Error, Customer> => pipe (
  'SELECT email, name FROM customers WHERE "email"=$1',
  TEquery ([email]),
  TEgetFirstRow,
  TEreturnObjectIfValid (Customer)
)

export type Customer = t.TypeOf<typeof Customer>
export const Customer = t.type ({
  email: t.string,
  name: t.string
})

export interface CustomerGetterProps {
  email: string
}
