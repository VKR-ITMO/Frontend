import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, GraduationCap } from 'lucide-react'
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
    <div className="flex flex-col min-h-screen">
      <div className="border-b border-zinc-200 px-8 py-4">
        <Link to="/teacher/profile" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base font-medium">Назад в профиль</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-[448px] flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-[186px] h-[186px] rounded-full object-cover" />
            ) : (
              <div className="w-[186px] h-[186px] rounded-full bg-zinc-200 flex items-center justify-center">
                <GraduationCap className="w-16 h-16 text-zinc-400" />
              </div>
            )}
            <div className="flex flex-col items-center gap-2 w-full">
              <Button variant="outline" fullWidth>Выбрать файл</Button>
              <span className="text-xs text-zinc-400">Максимум 2MB</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
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
            <Input 
              label="Должность" 
              value={position}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPosition(e.target.value)}
            />
            <Input 
              label="Почта" 
              type="email" 
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-900 tracking-wide">О себе</label>
              <textarea 
                className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-8">
            <Link to="/teacher/profile" className="flex-1">
              <Button variant="outline" fullWidth>Отмена</Button>
            </Link>
            <Button fullWidth className="flex-1" onClick={handleSave}>Сохранить</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
