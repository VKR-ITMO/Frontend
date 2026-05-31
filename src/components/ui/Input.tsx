import { InputHTMLAttributes, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className = '', id, type, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-zinc-500 tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          className={`
            w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm
            placeholder:text-zinc-400 text-zinc-900
            focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400
            transition-colors
            ${isPassword ? 'pr-11' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}
