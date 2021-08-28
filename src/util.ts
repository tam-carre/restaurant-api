import {Lazy} from "fp-ts/lib/function"

export const log = <T> (data: T): T => (console.log (data), data)

export const warn = <T> (data: T): T => (console.warn (data), data)

export const lazyThrow = (msg: string): Lazy<Error> => () => new Error (msg)
