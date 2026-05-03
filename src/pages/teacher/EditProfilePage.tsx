import { Link } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function TeacherEditProfilePage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl">
      <Link to="/teacher/profile" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Назад к профилю
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900">Редактировать профиль</h1>

      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-zinc-200" />
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900">Фото профиля</p>
          <p className="text-xs text-zinc-400">JPG, PNG. Максимум 5 МБ</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Input label="Имя" defaultValue="Иван" />
          <Input label="Фамилия" defaultValue="Петров" />
        </div>
        <Input label="Email" defaultValue="petrov@university.ru" />
        <Input label="Должность" defaultValue="Доцент кафедры информатики" />
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-900 tracking-wide">О себе</label>
          <textarea className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10" defaultValue="Кандидат технических наук, доцент кафедры информатики." />
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/teacher/profile"><Button variant="secondary">Отмена</Button></Link>
        <Button>Сохранить</Button>
      </div>
    </div>
  )
}
