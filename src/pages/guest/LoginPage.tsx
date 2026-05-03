import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import RoleToggle from '../../components/ui/RoleToggle'

export default function LoginPage() {
  const [role, setRole] = useState('Студент')

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-zinc-900 rounded-lg w-7 h-7 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Войти в аккаунт</h1>
          <p className="text-sm text-zinc-400 mt-1">Введите свои данные для входа</p>
        </div>
      </div>

      <RoleToggle roles={['Студент', 'Преподаватель']} activeRole={role} onChange={setRole} />

      <form className="flex flex-col gap-4 w-full">
        <Input label="Почта" type="email" placeholder="name@example.com" />
        <Input label="Пароль" type="password" placeholder="••••••••" />
        <Button fullWidth>Войти</Button>
      </form>

      <div className="flex flex-col items-center gap-2 text-sm">
        <Link to="/forgot-password" className="text-zinc-400 hover:text-zinc-600 transition-colors">
          Забыли пароль?
        </Link>
        <p className="text-zinc-400">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-zinc-900 font-medium hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
