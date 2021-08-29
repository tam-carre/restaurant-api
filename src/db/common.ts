import {Pool, QueryResult} from 'pg'
import * as TE from 'fp-ts/TaskEither'
import * as t from 'io-ts'
import * as A from 'fp-ts/Array'
import {flow, pipe} from 'fp-ts/lib/function'
import {isRight} from 'fp-ts/lib/Either'

export const TEquery = (values: any[]) => (query: string): TE.TaskEither<APIError, QueryResult<any>> =>
  TE.tryCatch (
    () => pool.query (query, A.map (String) (values)),
    err => APIError (400, `SQL query failed: ${err}`)
  )

export const TEerrorIfNoAffectedRows = (
  code?: number, message?: string) => (rowCount: TE.TaskEither<APIError, number>
): TE.TaskEither<APIError, number> => pipe (
  rowCount,
  TE.chain (count => count === 0
    ? TE.left (APIError (code ?? 400, message ?? 'An unknown error occurred.'))
    : rowCount
  )
)

export const TEreturnArrayIfValid =
  <T extends t.Props> (codec: t.TypeC<T>) => <TEArrayValidator<T>>
    TEreturnIfValid (A.every (flow (codec.decode, isRight)))

export type APIError = Error & { status: number }
export const APIError = (status: number, message: string): APIError => ({
  name: 'Error',
  status,
  message
})

///////////////////////////////////////////////////////////////////////////////

const pool = new Pool ()

type Validated <T extends t.Props> = t.TypeOf<t.TypeC<T>>

type TEArrayValidator <T extends t.Props> =
  (data: TE.TaskEither<APIError, any[]>) =>
    TE.TaskEither<APIError, Validated<T>[]>

const TEreturnIfValid = <T extends t.Props> (
  predicate: (data: any) => boolean
): TEArrayValidator<T> =>
  TE.chain (data => pipe (
    data,
    predicate,
    isValid => isValid
      ? TE.right (data)
      : TE.left (APIError (400, 'Unexpected query result shape.')))
  )
