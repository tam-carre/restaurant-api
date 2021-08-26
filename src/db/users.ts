import * as t from 'io-ts'
import * as T from 'fp-ts/Task'
import * as TO from 'fp-ts/TaskOption'
import {TOdidAffectAnyRow, TOgetFirstRow, TOquery, TOreturnIfValid} from './common'
import {pipe} from 'fp-ts/lib/function'

export const createCustomer = (
  {name, email}: CustomerCreationProps
): T.Task<boolean> => pipe (
  'INSERT INTO customers(name, email) VALUES($1, $2) ON CONFLICT DO NOTHING',
  TOquery ([name, email]),
  TOdidAffectAnyRow
)

export const getCustomer = (
  {email}: CustomerGetterProps
): TO.TaskOption<Customer> => pipe (
  'SELECT email, name FROM customers WHERE "email"=$1',
  TOquery ([email]),
  TOgetFirstRow,
  TOreturnIfValid (Customer)
)

///////////////////////////////////////////////////////////////////////////////

type Customer = t.TypeOf<typeof Customer>
const Customer = t.type ({
  email: t.string,
  name: t.string
})

type CustomerCreationProps = Customer

interface CustomerGetterProps {
  email: string
}
