import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-zinc-500 tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm
          placeholder:text-zinc-400 text-zinc-900
          focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400
          transition-colors
          ${className}
        `}
        {...props}
      />
    </div>
  )
}
