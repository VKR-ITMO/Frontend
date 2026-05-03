import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Button from '../../components/ui/Button'

const courses = [
  {
    id: 1,
    title: 'Алгоритмы и структуры данных',
    code: 'CS101',
    lectureCount: 2,
    studentCount: 45,
    lectures: [
      { id: 1, title: 'Введение в алгоритмы', number: 'Лекция 1', date: '15 янв.', time: '10:00' },
      { id: 2, title: 'Введение в алгоритмы', number: 'Лекция 1', date: '17 янв.', time: '10:00' },
    ],
  },
  {
    id: 2,
    title: 'Алгоритмы и структуры данных',
    code: 'CS101',
    lectureCount: 2,
    studentCount: 45,
    lectures: [
      { id: 3, title: 'Сортировки', number: 'Лекция 2', date: '20 янв.', time: '10:00' },
    ],
  },
]

export default function LiveSessionPage() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-10 w-full max-w-3xl px-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Нет активной сессии</h1>
          <p className="text-sm text-zinc-500">Выберите лекцию из одного из ваших курсов, чтобы начать прямой эфир со студентами</p>
        </div>

        {/* Create new lecture */}
        <div className="bg-white border border-zinc-100 rounded-xl p-4 flex items-center justify-between w-full">
          <span className="text-sm font-semibold text-zinc-900">Создать лекцию</span>
          <Button size="sm">Начать</Button>
        </div>

        <div className="h-px bg-zinc-100 w-full" />

        {/* Course list */}
        <div className="flex flex-col gap-7 w-full">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border border-zinc-100 rounded-xl p-4 flex flex-col gap-4">
              <button onClick={() => setExpanded(expanded === course.id ? null : course.id)} className="flex items-center justify-between w-full text-left">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-zinc-900">{course.title}</span>
                  <div className="flex gap-6 text-xs text-zinc-400">
                    <span>{course.code}</span>
                    <span>{course.lectureCount} лекций</span>
                    <span>{course.studentCount} студентов</span>
                  </div>
                </div>
                {expanded === course.id ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>

              {expanded === course.id && (
                <>
                  <div className="h-px bg-zinc-100" />
                  <div className="flex flex-col gap-4">
                    {course.lectures.map((lec) => (
                      <div key={lec.id} className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-zinc-900 truncate">{lec.title}</span>
                          <div className="flex gap-4 text-xs text-zinc-400">
                            <span>{lec.number}</span>
                            <span>{lec.date}</span>
                            <span>{lec.time}</span>
                          </div>
                        </div>
                        <Button size="sm">Начать</Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
