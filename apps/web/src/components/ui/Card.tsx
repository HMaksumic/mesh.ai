import type { HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement>

const base = 'rounded-xl border border-neutral-200 bg-white shadow-sm'

export default function Card({ className, ...props }: Props) {
  return <div className={`${base} ${className ?? ''}`} {...props} />
}
