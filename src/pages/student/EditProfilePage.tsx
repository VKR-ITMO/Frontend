import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, GraduationCap, Upload } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/client'
import type { User } from '../../api/types'

export default function StudentEditProfilePage() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const nameParts = user?.full_name?.split(' ') || ['', '']
  const [firstName, setFirstName] = useState(nameParts[0] || '')
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '')
  const [group, setGroup] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null)
  const [loading, setLoading] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой (максимум 5MB)')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file || !user) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (error) {
      console.error('Avatar upload failed:', error)
      alert('Не удалось загрузить аватар')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      // Upload avatar if changed
      if (fileInputRef.current?.files?.[0]) {
        await handleAvatarUpload()
      }

      // Update user info
      if (user) {
        await api.patch(`/users/${user.id}`, {
          full_name: `${firstName} ${lastName}`.trim(),
        })
        
        // Refresh user data
        const updatedUser = await api.get<User>(`/users/${user.id}`)
        setUser(updatedUser)
      }
      
      navigate('/student/profile')
    } catch (error) {
      console.error('Profile update failed:', error)
      alert('Не удалось сохранить профиль')
    } finally {
      setLoading(false)
    }
  }

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
            {avatarPreview ? (
              <div className="relative">
                <img src={avatarPreview} alt={user?.full_name || 'Avatar'} className="w-[186px] h-[186px] rounded-full object-cover" />
                <button
                  onClick={() => { setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="absolute top-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-zinc-100"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="w-[186px] h-[186px] rounded-full bg-zinc-200 flex items-center justify-center">
                <GraduationCap className="w-16 h-16 text-zinc-400" />
              </div>
            )}
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />
            <div className="flex flex-col items-center gap-2 w-full">
              <Button variant="outline" fullWidth onClick={() => fileInputRef.current?.click()}>
                {avatarPreview ? 'Изменить фото' : 'Выбрать файл'}
              </Button>
              <span className="text-xs text-zinc-400">Максимум 5MB</span>
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
              label="Группа" 
              value={group}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroup(e.target.value)}
            />
            <Input 
              label="Почта" 
              type="email" 
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-8">
            <Link to="/student/profile" className="flex-1">
              <Button variant="outline" fullWidth>Отмена</Button>
            </Link>
            <Button fullWidth className="flex-1" onClick={handleSave}>Сохранить</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
