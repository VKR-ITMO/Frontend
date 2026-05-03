import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import FeatureCard from '../../components/ui/FeatureCard'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-24 px-4">
        <h1 className="text-5xl font-bold text-zinc-900 tracking-tight leading-tight max-w-3xl">
          Современная платформа<br />для управления лекциями
        </h1>
        <p className="text-lg text-zinc-500 max-w-xl">
          Отмечайтесь на лекциях, отслеживайте свой прогресс и получайте доступ к материалам курсов в одном месте
        </p>
        <div className="flex gap-4 mt-4">
          <Link to="/register">
            <Button size="lg">Начать обучение</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">Войти в аккаунт</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-3">
        <FeatureCard
          title="Управление посещениями"
          description="Преподаватели могут запускать сессии посещения, а студенты — отмечаться через QR-код. Все данные сохраняются автоматически"
        />
        <FeatureCard
          title="Материалы курсов"
          description="Загружайте и организуйте лекции, презентации и дополнительные ресурсы для каждого курса"
        />
        <FeatureCard
          title="Аналитика и прогресс"
          description="Отслеживайте посещаемость, прогресс студентов и другие важные метрики в удобной форме"
        />
      </section>
    </div>
  )
}
