import { useState, useEffect, useRef } from 'react'
import { Upload } from 'lucide-react'
import CourseCard from '../../components/ui/CourseCard'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { coursesApi } from '../../api/courses'
import type { Course, CourseCreate } from '../../api/types'

export default function TeacherCoursesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newCourse, setNewCourse] = useState<CourseCreate>({
    name: '',
    code: '',
    description: '',
    semester: '2024-2025'
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setImagePreview(base64)
        setNewCourse({...newCourse, image_url: base64})
      }
      reader.readAsDataURL(file)
    }
  }

  const filters = ['Все', 'Активные', 'Завершенные']

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await coursesApi.getCourses()
      setCourses(data)
    } catch (err) {
      setError('Ошибка загрузки курсов')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async () => {
    try {
      await coursesApi.createCourse(newCourse)
      setCreateOpen(false)
      setNewCourse({ name: '', code: '', description: '', semester: '2024-2025' })
      setImagePreview(null)
      loadCourses()
    } catch (err) {
      console.error('Error creating course:', err)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'Все' || 
      (filter === 'Активные' && course.status === 'ACTIVE') ||
      (filter === 'Завершенные' && course.status === 'ARCHIVED')
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex flex-col gap-8 p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Мои курсы</h1>
          <p className="text-base text-zinc-500 mt-1">Управление курсами</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ Создать курс</Button>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Поиск"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border border-zinc-200 rounded-lg text-sm placeholder:text-zinc-400 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors"
        />
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-zinc-900 text-white'
                  : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50 bg-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Загрузка...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          {courses.length === 0 ? 'У вас пока нет курсов. Создайте первый!' : 'Курсы не найдены'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              title={course.name}
              description={course.description || ''}
              teacher=""
              studentCount=""
              linkTo={`/teacher/courses/${course.id}`}
              buttonLabel="Открыть"
            />
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setImagePreview(null) }} title="Создать курс">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-900 tracking-wide">Изображение курса</label>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setImagePreview(null); setNewCourse({...newCourse, image_url: undefined}) }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-zinc-400 transition-colors"
              >
                <Upload className="w-6 h-6 text-zinc-400" />
                <span className="text-sm text-zinc-500">Нажмите для загрузки</span>
              </button>
            )}
          </div>
          <Input 
            label="Название курса" 
            placeholder="Введение в программирование"
            value={newCourse.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCourse({...newCourse, name: e.target.value})}
          />
          <Input 
            label="Код курса" 
            placeholder="CS101"
            value={newCourse.code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCourse({...newCourse, code: e.target.value})}
          />
          <Input 
            label="Семестр" 
            placeholder="2024-2025"
            value={newCourse.semester}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCourse({...newCourse, semester: e.target.value})}
          />
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-900 tracking-wide">Описание</label>
            <textarea 
              className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Описание курса"
              value={newCourse.description}
              onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <Button variant="secondary" className="flex-1" onClick={() => { setCreateOpen(false); setImagePreview(null) }}>Отмена</Button>
          <Button className="flex-1" onClick={handleCreateCourse}>Создать</Button>
        </div>
      </Modal>
    </div>
  )
}
