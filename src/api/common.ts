import {HttpEffect} from '@marblejs/core'
import {mergeMap} from 'rxjs/operators'
import {requestValidator$} from '@marblejs/middleware-io'
import * as Ob from 'fp-ts-rxjs/Observable'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as T from 'fp-ts/lib/Task'
import * as t from 'io-ts'
import {APIError} from '../db/common'

export const create$ = (props: CreationProps): HttpEffect => req$ => req$.pipe (
  requestValidator$ ({body: props.validator}),
  mergeMap (req => pipe (
    req.body,
    props.creator,
    TE.foldW (
      err => T.of (formatError (err)),
      () => T.of ({status: 200})
    ),
    Ob.fromTask
  ))
)

export const getData$ = (props: GetterProps): HttpEffect => req$ => req$.pipe (
  requestValidator$ ({query: props.validator}),
  mergeMap (req => pipe (
    req.query,
    props.getter,
    TE.foldW (
      err => T.of (formatError (err)),
      data => T.of ({status: 200, body: JSON.stringify (data)})
    ),
    Ob.fromTask
  ))
)

export const optional = <T extends t.Any>(
  type: T,
  name = `${type.name} | undefined`
): t.UnionType<
  [T, t.UndefinedType],
  t.TypeOf<T> | undefined,
  t.OutputOf<T> | undefined,
  t.InputOf<T> | undefined
> =>
  t.union<[T, t.UndefinedType]>([type, t.undefined], name)

///////////////////////////////////////////////////////////////////////////////

const formatError = (err: APIError): ReturnedError => ({
  status: err.status,
  body: {
    error: {
      status: err.status,
      message: err.message
    }
  }
})

// Same formatting as the marblejs validator middleware
interface ReturnedError {
  status: number
  body: {
    error: {
      status: number
      message: string
      data?: any
      context?: any
    }
  }
}

interface CreationProps {
  validator: t.TypeC<any>
  creator: (...props: any[]) => TE.TaskEither<APIError, number>
}

interface GetterProps {
  validator: t.TypeC<any>
  getter: (...props: any[]) => TE.TaskEither<APIError, unknown[]>
}
