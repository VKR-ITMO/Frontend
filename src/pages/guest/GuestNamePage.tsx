import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { GraduationCap, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { sessionsApi } from '../../api/sessions'
import { api } from '../../api/client'

export default function GuestNamePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const accessCode: string = location.state?.accessCode || ''

  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Без кода доступа ввод имени бессмыслен — возвращаем на шаг ввода кода
    if (!accessCode) {
      navigate('/join', { replace: true })
    }
  }, [accessCode, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = fullName.trim()
    if (!name) {
      setError('Введите имя и фамилию')
      return
    }
    if (name.split(/\s+/).length < 2) {
      setError('Введите имя и фамилию полностью')
      return
    }

    setError('')
    setIsLoading(true)
    try {
      // Очищаем возможный устаревший токен, чтобы войти как новый гость
      api.setToken(null)

      const result = await sessionsApi.joinSessionAsGuest(accessCode, name)

      // Сохраняем гостевой токен, чтобы реакции и квизы работали
      api.setToken(result.access_token)
      localStorage.setItem('is_guest', 'true')

      navigate(`/session/${result.session.id}/live`, {
        state: { session: result.session },
      })
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.includes('404')) {
        setError('Сессия не найдена. Проверьте код доступа.')
      } else if (msg.includes('ended') || msg.includes('400')) {
        setError('Сессия уже завершена.')
      } else {
        setError('Не удалось присоединиться к сессии.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white px-4">
      <div className="pt-6 pb-2">
        <Link
          to="/join"
          state={{ code: accessCode }}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center py-8">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-zinc-900 rounded-lg w-10 h-10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Как вас представить?</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Введите имя и фамилию — их увидит преподаватель и другие участники
            </p>
          </div>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <Input
            label="Имя и фамилия"
            type="text"
            placeholder="Иван Иванов"
            value={fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button fullWidth disabled={isLoading}>
            {isLoading ? 'Подключение...' : 'Войти в сессию'}
          </Button>
        </form>

        <p className="text-xs text-zinc-400 text-center">
          Код сессии: <span className="font-semibold text-zinc-600">{accessCode}</span>
        </p>
      </div>
      </div>
    </div>
  )
}
