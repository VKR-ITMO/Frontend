import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../contexts/AuthContext'

export default function TeacherEditProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const nameParts = user?.full_name?.split(' ') || ['', '']
  const [firstName, setFirstName] = useState(nameParts[0] || '')
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '')
  const [email, setEmail] = useState(user?.email || '')
  const [position, setPosition] = useState('')
  const [bio, setBio] = useState('')

  const handleSave = async () => {
    // Profile update not implemented yet - just navigate back
    navigate('/teacher/profile')
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl">
      <Link to="/teacher/profile" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Назад к профилю
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900">Редактировать профиль</h1>

      <div className="flex items-center gap-6">
        <div className="relative">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-200" />
          )}
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
          <Input 
            label="Имя" 
            value={firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
          />
          <Input 
            label="Фамилия" 
            value={lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
          />
        </div>
        <Input 
          label="Email" 
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
        <Input 
          label="Должность" 
          value={position}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPosition(e.target.value)}
        />
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-zinc-900 tracking-wide">О себе</label>
          <textarea 
            className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10" 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/teacher/profile"><Button variant="secondary">Отмена</Button></Link>
        <Button onClick={handleSave}>Сохранить</Button>
      </div>
    </div>
  )
}
