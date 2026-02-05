import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800',
  secondary: 'border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50',
  ghost: 'text-neutral-600 hover:bg-neutral-100'
}

export default function Button({ variant = 'primary', className, ...props }: Props) {
  return <button className={`${base} ${variants[variant]} ${className ?? ''}`} {...props} />
}
