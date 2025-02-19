import { FC, ReactNode } from 'react'

export type WithChildren<T> = T & { children?: ReactNode }

export type FCC<T = {}> = FC<WithChildren<T>>
