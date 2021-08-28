import {Pool, QueryResult} from 'pg'
import * as TE from 'fp-ts/TaskEither'
import * as t from 'io-ts'
import * as A from 'fp-ts/Array'
import {flow, pipe} from 'fp-ts/lib/function'
import {prop} from 'fp-ts-ramda'
import {isRight, toError} from 'fp-ts/lib/Either'
import {lazyThrow} from '../util'

export const TEquery = (values: any[]) => (query: string) =>
  TE.tryCatch (
    () => pool.query (query, A.map (String) (values)),
    toError
  )

export const TEgetFirstRow:
  (q: TE.TaskEither<Error, QueryResult<any>>) => TE.TaskEither<Error, unknown> =
    TE.chain (flow (
      prop ('rows'),
      A.head,
      TE.fromOption (lazyThrow ('No row returned.'))
    ))

export const TEerrorIfNoAffectedRows = (
  message?: string) => (rowCount: TE.TaskEither<Error, number>
): TE.TaskEither<Error, number> => pipe (
  rowCount,
  TE.chain (count => count === 0
    ? TE.left (new Error (message ?? 'An unknown error occurred.'))
    : rowCount
  )
)

export const TEreturnObjectIfValid =
  <T extends t.Props> (codec: t.TypeC<T>) => <TEValidator<T>>
    TEreturnIfValid (flow (codec.decode, isRight))

export const TEreturnArrayIfValid =
  <T extends t.Props> (codec: t.TypeC<T>) => <TEArrayValidator<T>>
    TEreturnIfValid (A.every (flow (codec.decode, isRight)))

export interface PaginatedQuery {
  offset: number
  limit: number
}

///////////////////////////////////////////////////////////////////////////////

const pool = new Pool ()

type Validated <T extends t.Props> = t.TypeOf<t.TypeC<T>>

type TEValidator <T extends t.Props> =
  (data: TE.TaskEither<Error, any>) => TE.TaskEither<Error, Validated<T>>

type TEArrayValidator <T extends t.Props> =
  (data: TE.TaskEither<Error, any[]>) => TE.TaskEither<Error, Validated<T>[]>

const TEreturnIfValid = <T extends t.Props> (
  predicate: (data: any) => boolean
): TEValidator<T> | TEArrayValidator<T> =>
  TE.chain (data => pipe (
    data,
    predicate,
    isValid => isValid
      ? TE.right (data)
      : TE.left (new Error ('Unexpected query result shape.')))
  )
