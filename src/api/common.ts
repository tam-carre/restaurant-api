import {HttpEffect} from '@marblejs/core'
import {mergeMap} from 'rxjs/operators'
import {requestValidator$} from '@marblejs/middleware-io'
import * as Ob from 'fp-ts-rxjs/Observable'
import {pipe} from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as T from 'fp-ts/lib/Task'
import * as t from 'io-ts'

export const create$ = (props: CreationProps): HttpEffect => req$ => req$.pipe (
  requestValidator$ ({body: props.validator}),
  mergeMap (req => pipe (
    req.body,
    props.creator,
    TE.fold (
      err => T.of ({status: 400, body: err.message}),
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
    TE.fold (
      err => T.of ({status: 400, body: err.message}),
      data => T.of ({status: 200, body: JSON.stringify (data)})
    ),
    Ob.fromTask
  ))
)

///////////////////////////////////////////////////////////////////////////////

interface CreationProps {
  validator: t.TypeC<any>
  creator: (...props: any[]) => TE.TaskEither<Error, number>
}

interface GetterProps {
  validator: t.TypeC<any>
  getter: (...props: any[]) => TE.TaskEither<Error, unknown[]>
}
