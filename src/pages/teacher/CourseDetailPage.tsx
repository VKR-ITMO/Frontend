import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, QrCode, Settings, Pencil, Trash2, Download, ChevronDown } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Tabs from '../../components/ui/Tabs'

const courseTabs = [
  { key: 'lectures', label: 'Лекции' },
  { key: 'quizzes', label: 'Квизы' },
  { key: 'materials', label: 'Материалы' },
  { key: 'members', label: 'Состав' },
  { key: 'grades', label: 'Оценки' },
  { key: 'settings', label: 'Настройки' },
]

const lectures = [
  { id: 1, title: 'Введение в алгоритмы', date: '15', month: 'янв', time: '10:00', limit: 50, code: 'ALG101' },
  { id: 2, title: 'Введение в алгоритмы', date: '15', month: 'янв', time: '10:00', limit: 50, code: 'ALG101' },
  { id: 3, title: 'Введение в алгоритмы', date: '15', month: 'янв', time: '10:00', limit: 50, code: 'ALG101' },
]

const quizzes = [
  { id: 1, title: 'Квиз', questions: 5, points: 50 },
  { id: 2, title: 'Квиз', questions: 5, points: 50 },
  { id: 3, title: 'Квиз', questions: 5, points: 50 },
]

const materials = [
  { id: 1, title: 'Дополнительные материалы', date: '12.01.2024' },
  { id: 2, title: 'Дополнительные материалы', date: '12.01.2024' },
  { id: 3, title: 'Дополнительные материалы', date: '12.01.2024' },
]

const members = [
  { id: 1, name: 'Иванов Иван', email: 'ivanov@example.com', attendance: '95%', points: 87 },
  { id: 2, name: 'Иванов Иван', email: 'ivanov@example.com', attendance: '95%', points: 87 },
  { id: 3, name: 'Иванов Иван', email: 'ivanov@example.com', attendance: '95%', points: 87 },
]

const gradeItems = [
  { id: 1, title: 'Введение', submitted: '3 / 3 сдали', questions: 5 },
  { id: 2, title: 'Введение', submitted: '3 / 3 сдали', questions: 5 },
  { id: 3, title: 'Введение', submitted: '3 / 3 сдали', questions: 5 },
]

export default function TeacherCourseDetailPage() {
  const [tab, setTab] = useState('lectures')
  const [filter, setFilter] = useState('Все')

  const [qrOpen, setQrOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [startOpen, setStartOpen] = useState(false)
  const [addLectureOpen, setAddLectureOpen] = useState(false)
  const [createQuizOpen, setCreateQuizOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  const filters = ['Все', 'Опубликованные', 'Отменённые']

  return (
    <div className="flex flex-col gap-8 p-8 bg-gray-50 min-h-screen">
      <Link to="/teacher/courses" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Назад к курсам
      </Link>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-500 rounded-xl p-8 flex flex-col gap-2 justify-end h-72">
        <h1 className="text-3xl font-bold text-white">Основы программирования на Python</h1>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-white" />
          <span className="text-sm text-white">Иванов Иван Иванович</span>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <Tabs tabs={courseTabs} active={tab} onChange={setTab} />

        {/* LECTURES TAB */}
        {tab === 'lectures' && (
          <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Список лекций</h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {filters.map((f) => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-zinc-900 text-white' : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>{f}</button>
                  ))}
                </div>
                <Button onClick={() => setAddLectureOpen(true)}>+ Добавить лекцию</Button>
              </div>
            </div>
            {lectures.map((lec) => (
              <div key={lec.id} className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-zinc-100 rounded flex flex-col items-center justify-center text-xs text-zinc-400">
                    <span>{lec.date}</span><span>{lec.month}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900">{lec.title}</span>
                    <div className="flex gap-4 text-xs text-zinc-400">
                      <span>{lec.time}</span><span>Лимит: {lec.limit} чел.</span>
                    </div>
                    <div className="text-xs text-zinc-400">Код доступа: <span className="font-bold text-zinc-600">{lec.code}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <button onClick={() => setQrOpen(true)} className="p-1 hover:bg-zinc-100 rounded-full transition-colors"><QrCode className="w-4 h-4 text-zinc-500" /></button>
                  <button onClick={() => setSettingsOpen(true)} className="p-1 hover:bg-zinc-100 rounded-full transition-colors"><Settings className="w-4 h-4 text-zinc-500" /></button>
                  <button onClick={() => setEditOpen(true)} className="p-1 hover:bg-zinc-100 rounded-full transition-colors"><Pencil className="w-4 h-4 text-zinc-500" /></button>
                  <button onClick={() => setDeleteOpen(true)} className="p-1 hover:bg-zinc-100 rounded-full transition-colors"><Trash2 className="w-4 h-4 text-zinc-500" /></button>
                  <Button size="sm" onClick={() => setStartOpen(true)}>Начать</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QUIZZES TAB */}
        {tab === 'quizzes' && (
          <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Список квизов</h2>
              <Button onClick={() => setCreateQuizOpen(true)}>+ Создать квиз</Button>
            </div>
            {quizzes.map((q) => (
              <div key={q.id} className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-zinc-900">{q.title}</span>
                  <div className="flex gap-4 text-xs text-zinc-400">
                    <span>{q.questions} вопросов</span><span>{q.points} баллов</span>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <Link to={`/teacher/courses/1/quiz/${q.id}`}><button className="p-1 hover:bg-zinc-100 rounded-full transition-colors"><Pencil className="w-4 h-4 text-zinc-500" /></button></Link>
                  <button className="p-1 hover:bg-zinc-100 rounded-full transition-colors"><Trash2 className="w-4 h-4 text-zinc-500" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MATERIALS TAB */}
        {tab === 'materials' && (
          <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Материалы курса</h2>
              <Button>+ Добавить материал</Button>
            </div>
            {materials.map((m) => (
              <div key={m.id} className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-zinc-900">{m.title}</span>
                  <span className="text-xs text-zinc-400">{m.date}</span>
                </div>
                <div className="flex items-center gap-5">
                  <button className="p-1 hover:bg-zinc-100 rounded-full transition-colors"><Download className="w-4 h-4 text-zinc-500" /></button>
                  <button className="p-1 hover:bg-zinc-100 rounded-full transition-colors"><Trash2 className="w-4 h-4 text-zinc-500" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MEMBERS TAB */}
        {tab === 'members' && (
          <div className="flex flex-col gap-6 p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Состав</h2>
              <Button onClick={() => setInviteOpen(true)}>Инвайт ссылка</Button>
            </div>
            {members.map((m) => (
              <div key={m.id} className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-200" />
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-zinc-900">{m.name}</span>
                      <span className="text-xs text-zinc-400">{m.email}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-zinc-400">
                      <span>Посещаемость: {m.attendance}</span><span>Баллы: {m.points}</span>
                    </div>
                  </div>
                </div>
                <button className="p-1 hover:bg-zinc-100 rounded-full transition-colors"><Trash2 className="w-4 h-4 text-zinc-500" /></button>
              </div>
            ))}
          </div>
        )}

        {/* GRADES TAB */}
        {tab === 'grades' && (
          <div className="flex flex-col gap-6 p-8">
            <h2 className="text-lg font-semibold text-gray-900">Оценки</h2>
            {gradeItems.map((g) => (
              <div key={g.id} className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-zinc-900">{g.title}</span>
                  <div className="flex gap-4 text-xs text-zinc-400">
                    <span>{g.submitted}</span><span>{g.questions} вопросов</span>
                  </div>
                </div>
                <Link to={`/teacher/courses/1/grades/${g.id}`}>
                  <Button size="sm">Открыть</Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <div className="flex flex-col gap-6 p-8">
            <h2 className="text-lg font-semibold text-gray-900">Настройки курса</h2>
            <div className="max-w-lg flex flex-col gap-4">
              <Input label="Название курса" defaultValue="Основы программирования на Python" />
              <Input label="Описание" defaultValue="Курс по основам программирования" />
              <Button>Сохранить</Button>
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="QR-код и код доступа">
        <div className="flex flex-col items-center gap-4">
          <div className="w-56 h-56 border-2 border-zinc-200 rounded-xl flex items-center justify-center bg-white p-4">
            <div className="w-full h-full bg-zinc-100 rounded flex items-center justify-center text-zinc-400 text-xs">QR Code</div>
          </div>
          <p className="text-sm text-zinc-600">Отсканируйте для быстрого входа</p>
          <div className="bg-zinc-50 rounded-lg p-4 w-full text-center">
            <p className="text-xs text-zinc-500">Код доступа</p>
            <p className="text-2xl font-bold text-zinc-900 tracking-wider">ALG101</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setQrOpen(false)}>Обновить</Button>
          <Button className="flex-1">Скачать</Button>
        </div>
      </Modal>

      {/* Edit Lecture Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Редактировать лекцию">
        <div className="flex flex-col gap-4">
          <Input label="Название" defaultValue="Лекция 1" />
          <Input label="Тема" defaultValue="Введение в алгоритмы" />
          <div className="flex gap-4">
            <Input label="Дата" defaultValue="21 февраля" />
            <Input label="Время" defaultValue="10:00" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-900 tracking-wide">Описание</label>
            <textarea className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10" defaultValue="Основные понятия и определения" />
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setEditOpen(false)}>Отмена</Button>
          <Button className="flex-1">Сохранить</Button>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Настройки лекции">
        <Input label="Максимум участников" defaultValue="50" />
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setSettingsOpen(false)}>Отмена</Button>
          <Button className="flex-1">Сохранить</Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Удалить лекцию?">
        <p className="text-sm text-zinc-600">Вы уверены, что хотите удалить лекцию</p>
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteOpen(false)}>Отмена</Button>
          <Button variant="danger" className="flex-1">Удалить</Button>
        </div>
      </Modal>

      {/* Start Lecture Modal */}
      <Modal open={startOpen} onClose={() => setStartOpen(false)} title="Начать лекцию?">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 bg-zinc-100 rounded flex flex-col items-center justify-center text-xs text-zinc-400">
              <span>15</span><span>янв</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900">Введение в алгоритмы</span>
              <div className="flex gap-4 text-xs text-zinc-400"><span>10:00</span><span>Лимит: 50 чел.</span></div>
            </div>
          </div>
          <div className="text-center text-xs">
            <p className="text-zinc-400">Код доступа:</p>
            <p className="font-bold text-zinc-600">ALG101</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setStartOpen(false)}>Отмена</Button>
          <Button className="flex-1">Начать</Button>
        </div>
      </Modal>

      {/* Add Lecture Modal */}
      <Modal open={addLectureOpen} onClose={() => setAddLectureOpen(false)} title="Создать лекцию">
        <div className="flex flex-col gap-4">
          <Input label="Название" placeholder="Лекция 1" />
          <Input label="Тема" placeholder="Введение в алгоритмы" />
          <div className="flex gap-4">
            <Input label="Дата" placeholder="21 февраля" />
            <Input label="Время" placeholder="10:00" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-900 tracking-wide">Описание</label>
            <textarea className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="Основные понятия и определения" />
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setAddLectureOpen(false)}>Отмена</Button>
          <Button className="flex-1">Сохранить</Button>
        </div>
      </Modal>

      {/* Create Quiz Modal */}
      <Modal open={createQuizOpen} onClose={() => setCreateQuizOpen(false)} title="Создать квиз">
        <Input label="Название квиза" placeholder="Введение" />
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setCreateQuizOpen(false)}>Отмена</Button>
          <Button className="flex-1">Создать</Button>
        </div>
      </Modal>

      {/* Invite Link Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Пригласить на курс">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-900 tracking-wide">Ссылка для приглашения</label>
            <div className="flex gap-2">
              <input className="flex-1 border border-zinc-200 rounded-lg px-4 py-3 text-sm bg-zinc-50 focus:outline-none" readOnly defaultValue="https://lecturehub.app/invite/abc123" />
              <Button>Копировать</Button>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => setInviteOpen(false)}>Закрыть</Button>
        </div>
      </Modal>
    </div>
  )
}
