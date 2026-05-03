import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export default function GuestHeader() {
  return (
    <header className="flex items-center justify-between px-20 py-5 border-b border-zinc-100">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="bg-zinc-900 rounded-lg w-7 h-7 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm text-zinc-900 tracking-tight">LectureHub</span>
      </Link>
      <nav className="flex items-center gap-6">
        <Link to="/login" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          Войти
        </Link>
        <Link
          to="/register"
          className="bg-zinc-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          Регистрация
        </Link>
      </nav>
    </header>
  )
}
