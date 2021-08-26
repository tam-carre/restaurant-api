import {Pool, QueryResult} from 'pg'
import * as T from 'fp-ts/Task'
import * as TO from 'fp-ts/TaskOption'
import * as t from 'io-ts'
import * as A from 'fp-ts/Array'
import {flow} from 'fp-ts/lib/function'
import {prop} from 'fp-ts-ramda'
import {gt} from 'ramda'
import {isRight} from 'fp-ts/lib/Either'

export const TOquery = (values: any[]) => (query: string) =>
  TO.tryCatch (() => pool.query (query, A.map (String) (values)))

export const TOdidAffectAnyRow: (
  q: TO.TaskOption<QueryResult<any>>
) => T.Task<boolean> = flow (
  TO.map (flow (prop ('rowCount'), gt (0))),
  TO.getOrElse (() => T.of <boolean> (false))
)

export const TOgetFirstRow: (
  qr: TO.TaskOption<QueryResult<any>>
) => TO.TaskOption<unknown> =
  TO.chain (flow (prop ('rows'), A.head, TO.fromOption))

export const TOreturnIfValid = <T extends t.Props> (
  codec: t.TypeC<T>): (data: TO.TaskOption<any>
) => TO.TaskOption<t.TypeOf<t.TypeC<T>>> => flow (
  TO.bindTo ('data'),
  TO.bind ('isValid', flow (prop ('data'), codec.decode, isRight, TO.of)),
  TO.map (({data, isValid}) => isValid ? data : null)
)

export const TOreturnArrayIfValid = <T extends t.Props> (
  codec: t.TypeC<T>): (data: TO.TaskOption<any[]>
) => TO.TaskOption<t.TypeOf<t.TypeC<T>>[]> => flow (
  TO.bindTo ('dataArray'),
  TO.bind ('isValid', flow (
    prop ('dataArray'),
    A.every (flow (codec.decode, isRight)),
    TO.of)
  ),
  TO.chain (({dataArray, isValid}) => isValid ? TO.some (dataArray) : TO.none)
)

export interface PaginatedQuery {
  offset: number
  limit: number
}

///////////////////////////////////////////////////////////////////////////////

const pool = new Pool()
