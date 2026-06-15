import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

const features = [
  { title: 'Реакции в реальном времени', description: 'Студенты отправляют мгновенную обратную связь — преподаватель видит настроение аудитории прямо во время лекции.' },
  { title: 'Квизы на лету', description: 'Создавайте вопросы за секунды прямо во время лекции. Результаты появляются мгновенно на экране.' },
  { title: 'Аналитика и рейтинги', description: 'Детальная статистика по каждому студенту, курсу и лекции. Экспорт данных в один клик.' },
  { title: 'Безопасный вход через ИСУ', description: 'Интеграция с институтской системой управления. Никаких лишних паролей.' },
  { title: 'Геймификация', description: 'Очки, достижения и лидерборды превращают обучение в увлекательный процесс.' },
  { title: 'Вход по QR-коду', description: 'Студенты присоединяются к лекции за 3 секунды — просто сканируют QR или вводят код.' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] gap-8 px-4 sm:px-6 py-12 sm:py-0">
        <div className="flex flex-col items-center gap-4 sm:gap-6 text-center max-w-[825px]">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight">
            <span className="text-zinc-900">Лекции, которые</span>
            <br />
            <span className="text-zinc-400">действительно работают</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 max-w-[690px]">
            Платформа для интерактивных лекций с реакциями, квизами и аналитикой. Студенты вовлечены — преподаватель в курсе.
          </p>
        </div>
        <Link to="/join">
          <Button size="lg">Присоединиться как гость</Button>
        </Link>
      </section>

      <section className="flex flex-col items-center gap-7 py-12 sm:py-24 px-4 sm:px-6 md:px-36 bg-white">
        <div className="flex flex-col items-center text-center max-w-[545px]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight">
            Всё что нужно для живой лекции
          </h2>
          <p className="text-base sm:text-lg text-zinc-500 mt-2">
            Никаких лишних инструментов. Только то, что работает.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border border-zinc-100 rounded-2xl overflow-hidden w-full max-w-[1064px]">
          {features.map((f, idx) => (
            <div key={idx} className="flex flex-col gap-2 px-6 sm:px-8 py-8 sm:py-14 border border-zinc-100">
              <h3 className="text-base font-semibold text-zinc-900">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-zinc-50 px-4 sm:px-6 md:px-36 py-6 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <span className="text-sm font-medium text-zinc-900">LectureHub</span>
        <span className="text-xs text-zinc-400">© 2025 LectureHub. Все права защищены.</span>
        <div className="flex gap-5 text-xs text-zinc-400">
          <Link to="/login" className="hover:text-zinc-600 transition-colors">Войти</Link>
          <Link to="/register" className="hover:text-zinc-600 transition-colors">Регистрация</Link>
          <Link to="/join" className="hover:text-zinc-600 transition-colors">Присоединиться</Link>
        </div>
      </footer>
    </div>
  )
}
