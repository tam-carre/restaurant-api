import * as t from 'io-ts'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import {TEgetFirstRow, TEreturnObjectIfValid, TEquery, TEdidAffectAnyRow} from './common'
import {pipe} from 'fp-ts/lib/function'

export const createCustomer = (
  {name, email}: CustomerCreationProps
): T.Task<boolean> => pipe (
  'INSERT INTO customers(name, email) VALUES($1, $2) ON CONFLICT DO NOTHING',
  TEquery ([name, email]),
  TEdidAffectAnyRow
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

export type CustomerCreationProps = Customer

export interface CustomerGetterProps {
  email: string
}
