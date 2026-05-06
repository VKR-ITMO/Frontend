import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, HelpCircle, Plus, Trash2, GripVertical } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'

type QuestionType = 'single' | 'multiple' | 'matching' | 'ordering' | 'file'

const questionTypeLabels: Record<QuestionType, string> = {
  single: 'Одиночный выбор',
  multiple: 'Множественный выбор',
  matching: 'Соответствие',
  ordering: 'Расстановка по порядку',
  file: 'Загрузка файла',
}

interface Question {
  id: number
  type: QuestionType
  text: string
  points: number
}

export default function QuizEditorPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<QuestionType>('single')

  const [formText, setFormText] = useState('')
  const [formPoints, setFormPoints] = useState('10')
  const [formOptions, setFormOptions] = useState(['', '', '', ''])
  const [formCorrect, setFormCorrect] = useState<number[]>([0])

  const [formLeftCol, setFormLeftCol] = useState(['', ''])
  const [formRightCol, setFormRightCol] = useState(['', ''])
  const [formOrderItems, setFormOrderItems] = useState(['', '', ''])

  const resetForm = () => {
    setFormText('')
    setFormPoints('10')
    setFormOptions(['', '', '', ''])
    setFormCorrect([0])
    setFormLeftCol(['', ''])
    setFormRightCol(['', ''])
    setFormOrderItems(['', '', ''])
  }

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), type: selectedType, text: formText, points: parseInt(formPoints) || 10 }])
    setAddOpen(false)
    resetForm()
  }

  const removeQuestion = (id: number) => setQuestions(questions.filter((q) => q.id !== id))

  const questionTypes: QuestionType[] = ['single', 'multiple', 'matching', 'ordering', 'file']

  return (
    <div className="flex flex-col gap-8 p-8 min-h-screen">
      <Link to="/teacher/courses/1" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Квиз: Введение</h1>
        <Button onClick={() => setAddOpen(true)}>+ Добавить вопрос</Button>
      </div>

      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-base font-medium text-zinc-900">Вопросов пока нет</p>
          <p className="text-sm text-zinc-400">Добавьте первый вопрос для квиза</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="border border-zinc-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <GripVertical className="w-4 h-4 text-zinc-300" />
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600">{idx + 1}</div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900">{q.text || `Вопрос ${idx + 1}`}</span>
                  <span className="text-xs text-zinc-400">{questionTypeLabels[q.type]} · {q.points} баллов</span>
                </div>
              </div>
              <button onClick={() => removeQuestion(q.id)} className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
                <Trash2 className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => { setAddOpen(false); resetForm() }} title="Добавить вопрос" width="w-[520px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-900 tracking-wide">Тип вопроса</label>
            <div className="flex flex-wrap gap-2">
              {questionTypes.map((t) => (
                <button key={t} onClick={() => setSelectedType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedType === t ? 'bg-zinc-900 text-white' : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
                  {questionTypeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          <Input label="Текст вопроса" value={formText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormText(e.target.value)} placeholder="Введите вопрос" />
          <Input label="Баллы" value={formPoints} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormPoints(e.target.value)} placeholder="10" />

          {(selectedType === 'single' || selectedType === 'multiple') && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-900 tracking-wide">Варианты ответа</label>
              {formOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type={selectedType === 'single' ? 'radio' : 'checkbox'}
                    name="correct"
                    checked={formCorrect.includes(i)}
                    onChange={() => {
                      if (selectedType === 'single') setFormCorrect([i])
                      else setFormCorrect(formCorrect.includes(i) ? formCorrect.filter((c) => c !== i) : [...formCorrect, i])
                    }}
                    className="accent-zinc-900"
                  />
                  <input className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder={`Вариант ${i + 1}`} value={opt} onChange={(e) => { const n = [...formOptions]; n[i] = e.target.value; setFormOptions(n) }} />
                  {formOptions.length > 2 && (
                    <button onClick={() => setFormOptions(formOptions.filter((_, j) => j !== i))} className="text-zinc-400 hover:text-zinc-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              ))}
              <button onClick={() => setFormOptions([...formOptions, ''])} className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 w-fit"><Plus className="w-3 h-3" /> Добавить вариант</button>
            </div>
          )}

          {selectedType === 'matching' && (
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-900">Левый столбец</label>
                {formLeftCol.map((v, i) => (
                  <input key={i} className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder={`Элемент ${i + 1}`} value={v} onChange={(e) => { const n = [...formLeftCol]; n[i] = e.target.value; setFormLeftCol(n) }} />
                ))}
                <button onClick={() => setFormLeftCol([...formLeftCol, ''])} className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 w-fit"><Plus className="w-3 h-3" /> Добавить</button>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-900">Правый столбец</label>
                {formRightCol.map((v, i) => (
                  <input key={i} className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder={`Элемент ${i + 1}`} value={v} onChange={(e) => { const n = [...formRightCol]; n[i] = e.target.value; setFormRightCol(n) }} />
                ))}
                <button onClick={() => setFormRightCol([...formRightCol, ''])} className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 w-fit"><Plus className="w-3 h-3" /> Добавить</button>
              </div>
            </div>
          )}

          {selectedType === 'ordering' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-900 tracking-wide">Элементы (в правильном порядке)</label>
              {formOrderItems.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 w-4">{i + 1}</span>
                  <input className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder={`Элемент ${i + 1}`} value={v} onChange={(e) => { const n = [...formOrderItems]; n[i] = e.target.value; setFormOrderItems(n) }} />
                </div>
              ))}
              <button onClick={() => setFormOrderItems([...formOrderItems, ''])} className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 w-fit"><Plus className="w-3 h-3" /> Добавить</button>
            </div>
          )}

          {selectedType === 'file' && (
            <div className="bg-zinc-50 rounded-lg p-6 text-center">
              <p className="text-sm text-zinc-500">Студенты загрузят файл в качестве ответа</p>
              <p className="text-xs text-zinc-400 mt-1">Допустимые форматы: PDF, DOCX, JPG, PNG</p>
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={() => { setAddOpen(false); resetForm() }}>Отмена</Button>
          <Button className="flex-1" onClick={addQuestion}>Добавить</Button>
        </div>
      </Modal>
    </div>
  )
}
