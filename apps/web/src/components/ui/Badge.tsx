import type { HTMLAttributes } from 'react'

type Tone = 'neutral' | 'success' | 'warning' | 'error'

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone
}

const base =
  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium'

const tones: Record<Tone, string> = {
  neutral: 'border-neutral-200 bg-neutral-50 text-neutral-600',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700'
}

export default function Badge({ tone = 'neutral', className, ...props }: Props) {
  return <span className={`${base} ${tones[tone]} ${className ?? ''}`} {...props} />
}
