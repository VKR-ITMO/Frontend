import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import RoleToggle from '../../components/ui/RoleToggle'

export default function RegisterPage() {
  const [role, setRole] = useState('Студент')

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-zinc-900 rounded-lg w-7 h-7 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Создать аккаунт</h1>
          <p className="text-sm text-zinc-400 mt-1">Заполните данные для регистрации</p>
        </div>
      </div>

      <RoleToggle roles={['Студент', 'Преподаватель']} activeRole={role} onChange={setRole} />

      <form className="flex flex-col gap-4 w-full">
        <div className="flex gap-4">
          <Input label="Имя" placeholder="Иван" />
          <Input label="Фамилия" placeholder="Петров" />
        </div>
        {role === 'Студент' && <Input label="Группа" placeholder="P3255" />}
        <Input label="Почта" type="email" placeholder="name@example.com" />
        <Input label="Пароль" type="password" placeholder="••••••••" />
        <Button fullWidth>Создать аккаунт</Button>
      </form>

      <p className="text-sm text-zinc-400">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-zinc-900 font-medium hover:underline">
          Войти
        </Link>
      </p>
    </div>
  )
}
