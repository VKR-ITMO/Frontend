import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { GraduationCap, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { sessionsApi } from '../../api/sessions'

export default function JoinSessionPage() {
  const [searchParams] = useSearchParams()
  const [accessCode, setAccessCode] = useState(searchParams.get('code') || '')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setAccessCode(code.toUpperCase())
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim()) {
      setError('Введите код доступа')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const session = await sessionsApi.joinSession(accessCode.trim().toUpperCase())
      navigate(`/session/${session.id}/live`, { state: { session } })
    } catch {
      setError('Неверный код доступа или сессия не активна')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 relative">
      <Link 
        to="/student" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Назад</span>
      </Link>
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-zinc-900 rounded-lg w-10 h-10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Присоединиться к лекции</h1>
            <p className="text-sm text-zinc-400 mt-1">Введите код доступа, который дал преподаватель</p>
          </div>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <Input
            label="Код доступа"
            type="text"
            placeholder="ABC123"
            value={accessCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccessCode(e.target.value.toUpperCase())}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button fullWidth disabled={isLoading}>
            {isLoading ? 'Подключение...' : 'Присоединиться'}
          </Button>
        </form>

        <p className="text-xs text-zinc-400 text-center">
          Код доступа можно получить у преподавателя или отсканировать QR-код на экране
        </p>
      </div>
    </div>
  )
}
