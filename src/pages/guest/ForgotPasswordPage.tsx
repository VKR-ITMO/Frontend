import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-zinc-900 rounded-lg w-7 h-7 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Восстановление пароля</h1>
          <p className="text-sm text-zinc-400 mt-1">Введите email для получения ссылки</p>
        </div>
      </div>

      <form className="flex flex-col gap-4 w-full">
        <Input label="Почта" type="email" placeholder="name@example.com" />
        <Button fullWidth>Отправить ссылку</Button>
      </form>

      <Link to="/login" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
        Вернуться к входу
      </Link>
    </div>
  )
}
