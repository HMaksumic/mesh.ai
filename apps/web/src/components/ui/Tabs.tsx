import type { HTMLAttributes, ButtonHTMLAttributes } from 'react'

type TabsProps = HTMLAttributes<HTMLDivElement>

export function Tabs({ className, ...props }: TabsProps) {
  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto border-b border-neutral-200 bg-white px-4 py-2 ${className ?? ''}`}
      {...props}
    />
  )
}

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function TabButton({ active, className, ...props }: TabButtonProps) {
  const base =
    'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200'
  const state = active
    ? 'border-neutral-300 bg-neutral-50 text-neutral-900'
    : 'border-neutral-200 bg-white text-neutral-500 hover:text-neutral-700'
  return <button className={`${base} ${state} ${className ?? ''}`} {...props} />
}
