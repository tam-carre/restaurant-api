import {Lazy} from 'fp-ts/lib/function'

export const log = <T> (data: T): T => (console.log (data), data)

export const warn = <T> (data: T): T => (console.warn (data), data)

export const lazyThrow = (msg: string): Lazy<Error> => () => new Error (msg)

export const getTime = (hhmmss: string): number =>
  new Date (`1970-01-01 ${hhmmss}`).getTime ()
