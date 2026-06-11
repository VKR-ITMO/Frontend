import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle, Plus, Trash2, Save, Pencil, ChevronUp, ChevronDown } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { quizzesApi } from '../../api/quizzes'
import type { Quiz, QuizWithQuestions } from '../../api/types'

type QuestionType = 'single' | 'multiple' | 'boolean' | 'matching' | 'ordering' | 'file'

const questionTypeLabels: Record<QuestionType, string> = {
  single: 'Одиночный выбор',
  multiple: 'Множественный выбор',
  boolean: 'Верно/Неверно',
  matching: 'Соответствие',
  ordering: 'Расстановка по порядку',
  file: 'Загрузка файла',
}

interface Question {
  id: string
  type: QuestionType
  text: string
  points: number
  timer: number
  options?: string[]
  correctAnswers?: number[]
  // ORDERING: the ordered list of item texts (correct order)
  orderingItems?: string[]
  // MATCHING: parallel lists; matchingLeft[i] ↔ matchingRight[i] is the correct pair
  matchingLeft?: string[]
  matchingRight?: string[]
}

export default function QuizEditorPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<QuestionType>('single')
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')

  useEffect(() => {
    if (quizId) loadQuiz()
  }, [quizId])

  const loadQuiz = async () => {
    if (!quizId) return
    try {
      setLoading(true)
      const data = await quizzesApi.getQuiz(quizId)
      setQuiz(data)
      setQuizTitle(data.title)
      setQuizDescription(data.description || '')

      // Map existing backend questions into local Question shape
      // Backend question fields: id, text, type (UPPERCASE enum), points, timer, answers[], extra_data
      const backendQuestions = (data as unknown as {
        questions: Array<{
          id: string
          text: string
          type: string
          points: number
          timer?: number
          extra_data?: Record<string, unknown> | null
          answers: Array<{ id: string; text: string; is_correct: boolean }>
        }>
      }).questions || []

      const mapped: Question[] = backendQuestions.map((bq) => {
        const localType = bq.type.toLowerCase() as QuestionType
        const extra = (bq.extra_data || {}) as {
          correct_order?: string[]
          left_column?: string[]
          right_column?: string[]
        }
        const q: Question = {
          id: bq.id,
          type: localType,
          text: bq.text,
          points: bq.points,
          timer: bq.timer ?? 30,
        }
        if (localType === 'single' || localType === 'multiple' || localType === 'boolean') {
          q.options = bq.answers.map((a) => a.text)
          q.correctAnswers = bq.answers
            .map((a, i) => (a.is_correct ? i : -1))
            .filter((i) => i >= 0)
        } else if (localType === 'ordering') {
          q.orderingItems = extra.correct_order && extra.correct_order.length > 0
            ? extra.correct_order
            : bq.answers.map((a) => a.text)
        } else if (localType === 'matching') {
          q.matchingLeft = extra.left_column || []
          q.matchingRight = extra.right_column || []
        }
        return q
      })
      setQuestions(mapped)
    } catch (error) {
      console.error('Failed to load quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuiz = async () => {
    if (!quizId) return
    try {
      const questionsPayload = questions.map((q, idx) => {
        const base = {
          text: q.text || `Вопрос ${idx + 1}`,
          type: q.type.toUpperCase(),
          points: q.points || 10,
          timer: q.timer || 30,
          order_index: idx,
        }

        if (q.type === 'single' || q.type === 'multiple' || q.type === 'boolean') {
          return {
            ...base,
            answers: (q.options || []).map((opt, i) => ({
              text: opt,
              is_correct: (q.correctAnswers || []).includes(i),
            })),
          }
        }

        if (q.type === 'ordering') {
          const items = q.orderingItems || []
          return {
            ...base,
            answers: items.map((item, i) => ({ text: item, is_correct: i === 0 })),
            extra_data: { correct_order: items },
          }
        }

        if (q.type === 'matching') {
          const left = q.matchingLeft || []
          const right = q.matchingRight || []
          const correct_pairs: Record<string, string> = {}
          for (let i = 0; i < left.length && i < right.length; i++) {
            correct_pairs[left[i]] = right[i]
          }
          return {
            ...base,
            answers: [],
            extra_data: {
              left_column: left,
              right_column: right,
              correct_pairs,
            },
          }
        }

        // text / file
        return { ...base, answers: [] }
      })
      await quizzesApi.updateQuiz(quizId, {
        title: quizTitle,
        questions: questionsPayload,
      })
      navigate(`/teacher/courses/${courseId}`)
    } catch (error) {
      console.error('Failed to save quiz:', error)
    }
  }

  const [formText, setFormText] = useState('')
  const [formPoints, setFormPoints] = useState('10')
  const [formTimer, setFormTimer] = useState('30')
  const [formOptions, setFormOptions] = useState(['', '', '', ''])
  const [formCorrect, setFormCorrect] = useState<number[]>([0])
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formLeftCol, setFormLeftCol] = useState(['', ''])
  const [formRightCol, setFormRightCol] = useState(['', ''])
  const [formOrderItems, setFormOrderItems] = useState(['', '', ''])

  const resetForm = () => {
    setFormText('')
    setFormPoints('10')
    setFormTimer('30')
    setFormOptions(['', '', '', ''])
    setFormCorrect([0])
    setFormLeftCol(['', ''])
    setFormRightCol(['', ''])
    setFormOrderItems(['', '', ''])
    setEditingId(null)
  }

  const openAddModal = () => {
    resetForm()
    setSelectedType('single')
    setAddOpen(true)
  }

  const openEditModal = (q: Question) => {
    setEditingId(q.id)
    setSelectedType(q.type)
    setFormText(q.text)
    setFormPoints(String(q.points))
    setFormTimer(String(q.timer))
    setFormOptions(q.options && q.options.length > 0 ? q.options : ['', '', '', ''])
    setFormCorrect(q.correctAnswers && q.correctAnswers.length > 0 ? q.correctAnswers : [0])
    setFormLeftCol(q.matchingLeft && q.matchingLeft.length > 0 ? q.matchingLeft : ['', ''])
    setFormRightCol(q.matchingRight && q.matchingRight.length > 0 ? q.matchingRight : ['', ''])
    setFormOrderItems(q.orderingItems && q.orderingItems.length > 0 ? q.orderingItems : ['', '', ''])
    setAddOpen(true)
  }

  const submitQuestion = () => {
    const built: Question = {
      id: editingId || Date.now().toString(),
      type: selectedType,
      text: formText,
      points: parseInt(formPoints) || 10,
      timer: parseInt(formTimer) || 30,
      options: (selectedType === 'single' || selectedType === 'multiple')
        ? formOptions.filter(o => o.trim())
        : selectedType === 'boolean'
          ? ['Верно', 'Неверно']
          : undefined,
      correctAnswers: (selectedType === 'single' || selectedType === 'multiple')
        ? formCorrect
        : selectedType === 'boolean'
          ? formCorrect
          : undefined,
      orderingItems: selectedType === 'ordering' ? formOrderItems.filter(o => o.trim()) : undefined,
      matchingLeft: selectedType === 'matching' ? formLeftCol.filter(o => o.trim()) : undefined,
      matchingRight: selectedType === 'matching' ? formRightCol.filter(o => o.trim()) : undefined,
    }
    if (editingId) {
      setQuestions(questions.map((q) => (q.id === editingId ? built : q)))
    } else {
      setQuestions([...questions, built])
    }
    setAddOpen(false)
    resetForm()
  }

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= questions.length) return
    const updated = [...questions]
    ;[updated[idx], updated[target]] = [updated[target], updated[idx]]
    setQuestions(updated)
  }

  const removeQuestion = (id: string) => setQuestions(questions.filter((q) => q.id !== id))

  const questionTypes: QuestionType[] = ['single', 'multiple', 'boolean', 'matching', 'ordering', 'file']

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-zinc-500">Загрузка...</p></div>
  }

  return (
    <div className="flex flex-col gap-8 p-8 min-h-screen">
      <Link to={`/teacher/courses/${courseId}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Назад к курсу
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Input 
            value={quizTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuizTitle(e.target.value)}
            className="text-2xl font-semibold"
            placeholder="Название квиза"
          />
        </div>
        <div className="flex gap-3">
          <Button onClick={openAddModal}>+ Добавить вопрос</Button>
          <Button variant="secondary" onClick={handleSaveQuiz}><Save className="w-4 h-4 mr-2" /> Сохранить</Button>
        </div>
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
                <div className="flex flex-col">
                  <button
                    onClick={() => moveQuestion(idx, -1)}
                    disabled={idx === 0}
                    className="p-0.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-30 disabled:hover:text-zinc-300 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveQuestion(idx, 1)}
                    disabled={idx === questions.length - 1}
                    className="p-0.5 text-zinc-300 hover:text-zinc-600 disabled:opacity-30 disabled:hover:text-zinc-300 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600">{idx + 1}</div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900">{q.text || `Вопрос ${idx + 1}`}</span>
                  <span className="text-xs text-zinc-400">{questionTypeLabels[q.type]} · {q.points} баллов · {q.timer}с</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEditModal(q)} className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors">
                  <Pencil className="w-4 h-4 text-zinc-500" />
                </button>
                <button onClick={() => removeQuestion(q.id)} className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors">
                  <Trash2 className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => { setAddOpen(false); resetForm() }} title={editingId ? 'Редактировать вопрос' : 'Добавить вопрос'} width="w-[520px]">
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
          <div className="flex gap-3">
            <Input label="Баллы" type="number" value={formPoints} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormPoints(e.target.value)} placeholder="10" />
            <Input label="Таймер (сек)" type="number" value={formTimer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormTimer(e.target.value)} placeholder="30" />
          </div>

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

          {selectedType === 'boolean' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-900 tracking-wide">Правильный ответ</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="boolean_correct"
                    checked={formCorrect[0] === 0}
                    onChange={() => setFormCorrect([0])}
                    className="accent-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">Верно</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="boolean_correct"
                    checked={formCorrect[0] === 1}
                    onChange={() => setFormCorrect([1])}
                    className="accent-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">Неверно</span>
                </label>
              </div>
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
          <Button className="flex-1" onClick={submitQuestion}>{editingId ? 'Сохранить' : 'Добавить'}</Button>
        </div>
      </Modal>
    </div>
  )
}
