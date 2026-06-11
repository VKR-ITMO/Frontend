import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Eye, Check, X, FileText } from 'lucide-react'
import { quizzesApi, type SessionQuizWithStats, type StudentSubmission, type ActiveQuizQuestion } from '../../api/quizzes'
import Modal from '../../components/ui/Modal'

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)
}

function formatLaunchDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function GradesDetailPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>()
  const [sessionQuizzes, setSessionQuizzes] = useState<SessionQuizWithStats[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([])
  const [questions, setQuestions] = useState<ActiveQuizQuestion[]>([])
  const [loadingLaunches, setLoadingLaunches] = useState(true)
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [detailStudent, setDetailStudent] = useState<StudentSubmission | null>(null)

  useEffect(() => {
    if (!quizId) return
    setLoadingLaunches(true)
    quizzesApi.getQuizSessionQuizzes(quizId)
      .then(data => {
        setSessionQuizzes(data)
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch(console.error)
      .finally(() => setLoadingLaunches(false))
  }, [quizId])

  useEffect(() => {
    if (!selectedId) return
    setLoadingSubmissions(true)
    quizzesApi.getSubmissionsDetails(selectedId)
      .then(data => {
        setSubmissions(data.submissions)
        setQuestions(data.questions)
      })
      .catch(() => { setSubmissions([]); setQuestions([]) })
      .finally(() => setLoadingSubmissions(false))
  }, [selectedId])

  const maxScore = useMemo(() => questions.reduce((s, q) => s + q.points, 0), [questions])

  const sorted = useMemo(() =>
    [...submissions].sort((a, b) => b.score - a.score),
    [submissions]
  )

  const avgScore = submissions.length > 0
    ? submissions.reduce((s, sub) => s + sub.score, 0) / submissions.length
    : 0
  const avgPct = maxScore > 0 ? Math.round((avgScore / maxScore) * 100) : 0


  const currentSQ = sessionQuizzes.find(sq => sq.id === selectedId)

  return (
    <div className="flex flex-col gap-6 p-8 bg-zinc-50 min-h-screen">
      <Link
        to={courseId ? `/teacher/courses/${courseId}` : '/teacher/courses'}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Назад к курсу
      </Link>

      {loadingLaunches ? (
        <div className="text-center py-20 text-zinc-400">Загрузка...</div>
      ) : sessionQuizzes.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">Квиз ещё не запускался в сессиях</div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
              {currentSQ?.title || 'Результаты квиза'}
            </h1>
            <p className="text-sm text-zinc-400">Детальные результаты по запускам квиза</p>
          </div>

          {/* Session selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Запуск квиза</label>
            <div className="relative w-fit">
              <select
                value={selectedId || ''}
                onChange={e => setSelectedId(e.target.value)}
                className="appearance-none bg-white border border-zinc-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
              >
                {sessionQuizzes.map(sq => (
                  <option key={sq.id} value={sq.id}>
                    {formatLaunchDate(sq.launched_at)} · {sq.total_submissions} сдали
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Stats */}
          {!loadingSubmissions && submissions.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-zinc-200 rounded-xl px-5 py-4">
                <p className="text-xs text-zinc-400 mb-1">Сдали</p>
                <p className="text-2xl font-semibold text-zinc-900">{submissions.length}</p>
                <p className="text-xs text-zinc-400 mt-0.5">студентов</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl px-5 py-4">
                <p className="text-xs text-zinc-400 mb-1">Средний балл</p>
                <p className="text-2xl font-semibold text-zinc-900">{avgScore.toFixed(1)}</p>
                <p className="text-xs text-zinc-400 mt-0.5">из {maxScore} возможных</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl px-5 py-4">
                <p className="text-xs text-zinc-400 mb-1">Средний процент</p>
                <p className="text-2xl font-semibold text-zinc-900">{avgPct}%</p>
                <div className="mt-1.5 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${avgPct}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            {loadingSubmissions ? (
              <div className="py-12 text-center text-zinc-400">Загрузка результатов...</div>
            ) : submissions.length === 0 ? (
              <div className="py-12 text-center text-zinc-400">Пока нет результатов</div>
            ) : (
              <>
                <div className="grid grid-cols-[2rem_1fr_11rem_9rem_7rem] gap-4 px-6 py-3 border-b border-zinc-100 text-xs font-medium text-zinc-400 uppercase tracking-wider items-center">
                  <span>#</span>
                  <span>Студент</span>
                  <span className="text-right">Баллы</span>
                  <span className="text-right">Процент</span>
                  <span></span>
                </div>
                {sorted.map((s, i) => {
                  const pct = maxScore > 0 ? Math.round((s.score / maxScore) * 100) : 0
                  return (
                    <div
                      key={s.id}
                      className="grid grid-cols-[2rem_1fr_11rem_9rem_7rem] gap-4 px-6 py-4 border-b border-zinc-50 last:border-b-0 items-center hover:bg-zinc-50 transition-colors"
                    >
                      <span className="text-xs font-semibold text-zinc-400">{i + 1}</span>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">
                          {getInitials(s.student_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">{s.student_name}</p>
                          <p className="text-xs text-zinc-400 truncate">{s.student_email}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-zinc-900 text-right">
                        {s.score} <span className="text-zinc-400 font-normal">/ {maxScore} б.</span>
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-medium text-zinc-700">{pct}%</span>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-zinc-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setDetailStudent(s)}
                          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ответы
                        </button>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </>
      )}

      {/* Student answers modal */}
      <Modal
        open={!!detailStudent}
        onClose={() => setDetailStudent(null)}
        title={detailStudent ? `${detailStudent.student_name}` : ''}
        width="w-[640px]"
      >
        {detailStudent && (
          <StudentAnswersView
            submission={detailStudent}
            maxScore={maxScore}
          />
        )}
      </Modal>
    </div>
  )
}

function StudentAnswersView({ submission, maxScore }: { submission: StudentSubmission; maxScore: number }) {
  const pct = maxScore > 0 ? Math.round((submission.score / maxScore) * 100) : 0

  return (
    <div className="flex flex-col gap-5">
      {/* Score summary */}
      <div className="flex items-center gap-6 bg-zinc-50 rounded-xl px-4 py-3">
        <div className="flex flex-col flex-1">
          <span className="text-xs text-zinc-400">Итоговый балл</span>
          <span className="text-xl font-semibold text-zinc-900">{submission.score} / {maxScore} б.</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-zinc-400">Процент</span>
          <span className="text-xl font-semibold text-zinc-900">{pct}%</span>
        </div>
      </div>

      {/* Per-question answers */}
      <div className="flex flex-col gap-3">
        {submission.answers.map((a, idx) => (
          <AnswerRow key={a.question_id} answer={a} index={idx + 1} />
        ))}
      </div>
    </div>
  )
}

function AnswerRow({ answer, index }: { answer: import('../../api/quizzes').SubmissionAnswerView; index: number }) {
  const isCorrect = answer.is_correct
  const typeLabels: Record<string, string> = {
    SINGLE: 'Один ответ', MULTIPLE: 'Несколько ответов', BOOLEAN: 'Верно/Неверно',
    TEXT: 'Текст', FILE: 'Файл', ORDERING: 'Упорядочивание', MATCHING: 'Соответствие',
  }

  return (
    <div className={`border rounded-xl px-4 py-3.5 flex flex-col gap-2 ${
      isCorrect === true ? 'border-emerald-200 bg-emerald-50/40' :
      isCorrect === false ? 'border-red-200 bg-red-50/30' :
      'border-zinc-200 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-xs font-semibold text-zinc-400 mt-0.5 shrink-0">В{index}.</span>
          <p className="text-sm font-medium text-zinc-900">{answer.question_text}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-zinc-400 bg-zinc-100 rounded px-1.5 py-0.5">{typeLabels[answer.type] ?? answer.type}</span>
          {isCorrect === true && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
          {isCorrect === false && <X className="w-4 h-4 text-red-500 shrink-0" />}
        </div>
      </div>

      {/* Answer content */}
      {answer.type === 'FILE' ? (
        answer.file_url ? (
          <a
            href={answer.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <FileText className="w-4 h-4" />
            {answer.file_name || 'Файл'}
          </a>
        ) : (
          <span className="text-sm text-zinc-400 italic">Файл не загружен</span>
        )
      ) : answer.type === 'MATCHING' ? (
        <MatchingAnswerView pairs={answer.pairs} correctPairs={answer.correct_pairs} />
      ) : answer.type === 'ORDERING' ? (
        <OrderingAnswerView answers={answer.answer_texts} correct={answer.correct_order} />
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-zinc-400 shrink-0">Ответ:</span>
            <span className="text-sm text-zinc-800">
              {answer.answer_texts.length > 0 ? answer.answer_texts.join(', ') : <span className="italic text-zinc-400">Нет ответа</span>}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function MatchingAnswerView({ pairs, correctPairs }: { pairs?: Record<string, string>; correctPairs?: Record<string, string> }) {
  if (!pairs || Object.keys(pairs).length === 0) {
    return <span className="text-sm text-zinc-400 italic">Нет ответа</span>
  }
  return (
    <div className="flex flex-col gap-1">
      {Object.entries(pairs).map(([left, right]) => {
        const correct = correctPairs?.[left]
        const ok = correct === right
        return (
          <div key={left} className="flex items-center gap-2 text-sm">
            <span className="text-zinc-700 font-medium">{left}</span>
            <span className="text-zinc-400">→</span>
            <span className={ok ? 'text-emerald-700' : 'text-red-600'}>{right}</span>
            {correct && !ok && <span className="text-zinc-400 text-xs">(верно: {correct})</span>}
          </div>
        )
      })}
    </div>
  )
}

function OrderingAnswerView({ answers, correct }: { answers: string[]; correct?: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      {answers.map((item, i) => {
        const ok = !correct || correct[i] === item
        return (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-xs font-semibold text-zinc-400 w-4">{i + 1}.</span>
            <span className={ok ? 'text-zinc-800' : 'text-red-600'}>{item}</span>
            {!ok && correct?.[i] && <span className="text-zinc-400 text-xs">(верно: {correct[i]})</span>}
          </div>
        )
      })}
    </div>
  )
}
