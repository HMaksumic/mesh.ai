import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement>

const base =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-300'

export default function Input({ className, ...props }: Props) {
  return <input className={`${base} ${className ?? ''}`} {...props} />
}
