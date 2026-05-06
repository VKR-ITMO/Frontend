import { Link } from 'react-router-dom'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function StudentEditProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b border-zinc-200 px-8 py-4">
        <Link to="/student/profile" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base font-medium">Назад в профиль</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-[448px] flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-[186px] h-[186px] rounded-full bg-zinc-200 flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-zinc-400" />
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <Button variant="outline" fullWidth>Выбрать файл</Button>
              <span className="text-xs text-zinc-400">Максимум 2MB</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Input label="Имя" placeholder="text" />
            <Input label="Фамилия" placeholder="text" />
            <Input label="Группа" placeholder="text" />
            <Input label="Почта" type="email" placeholder="text" />
          </div>

          <div className="flex gap-8">
            <Link to="/student/profile" className="flex-1">
              <Button variant="outline" fullWidth>Отмена</Button>
            </Link>
            <Button fullWidth className="flex-1">Сохранить</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
