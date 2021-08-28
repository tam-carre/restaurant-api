import {Pool} from 'pg'
import * as TE from 'fp-ts/TaskEither'
import * as t from 'io-ts'
import * as A from 'fp-ts/Array'
import {flow, pipe} from 'fp-ts/lib/function'
import {isRight, toError} from 'fp-ts/lib/Either'

export const TEquery = (values: any[]) => (query: string) =>
  TE.tryCatch (
    () => pool.query (query, A.map (String) (values)),
    toError
  )

export const TEerrorIfNoAffectedRows = (
  message?: string) => (rowCount: TE.TaskEither<Error, number>
): TE.TaskEither<Error, number> => pipe (
  rowCount,
  TE.chain (count => count === 0
    ? TE.left (new Error (message ?? 'An unknown error occurred.'))
    : rowCount
  )
)

export const TEreturnArrayIfValid =
  <T extends t.Props> (codec: t.TypeC<T>) => <TEArrayValidator<T>>
    TEreturnIfValid (A.every (flow (codec.decode, isRight)))

///////////////////////////////////////////////////////////////////////////////

const pool = new Pool ()

type Validated <T extends t.Props> = t.TypeOf<t.TypeC<T>>

type TEArrayValidator <T extends t.Props> =
  (data: TE.TaskEither<Error, any[]>) => TE.TaskEither<Error, Validated<T>[]>

const TEreturnIfValid = <T extends t.Props> (
  predicate: (data: any) => boolean
): TEArrayValidator<T> =>
  TE.chain (data => pipe (
    data,
    predicate,
    isValid => isValid
      ? TE.right (data)
      : TE.left (new Error ('Unexpected query result shape.')))
  )
