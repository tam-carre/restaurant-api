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
  requestValidator$ ({body: props.validator}),
  mergeMap (req => pipe (
    req.body,
    props.getter,
    TE.foldW (
      err => T.of (formatError (err)),
      data => T.of ({status: 200, body: JSON.stringify (data)})
    ),
    Ob.fromTask
  ))
)

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
