import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import RoleToggle from '../../components/ui/RoleToggle'
import { useAuth } from '../../contexts/AuthContext'

export default function RegisterPage() {
  const [role, setRole] = useState('Студент')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const fullName = `${firstName} ${lastName}`.trim()
    const apiRole = role === 'Студент' ? 'STUDENT' : 'TEACHER'

    try {
      const success = await register(email, password, fullName, apiRole)
      if (success) {
        const redirectPath = apiRole === 'STUDENT' ? '/student' : '/teacher'
        navigate(redirectPath)
      } else {
        setError('Ошибка регистрации. Возможно, email уже занят.')
      }
    } catch {
      setError('Ошибка при регистрации. Попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }

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

      <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <Input 
            label="Имя" 
            placeholder="Иван" 
            value={firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
          />
          <Input 
            label="Фамилия" 
            placeholder="Петров" 
            value={lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
          />
        </div>
        <Input 
          label="Почта" 
          type="email" 
          placeholder="name@example.com" 
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
        <Input 
          label="Пароль" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button fullWidth disabled={isLoading}>
          {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 text-sm">
        <p className="text-zinc-400">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-zinc-900 font-medium hover:underline">
            Войти
          </Link>
        </p>
        <Link to="/join" className="text-zinc-400 hover:text-zinc-600 transition-colors">
          Войти как гость
        </Link>
      </div>
    </div>
  )
}
