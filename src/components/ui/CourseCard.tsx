import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from './Button'

interface CourseCardProps {
  title: string
  description: string
  teacher: string
  teacherAvatar?: string
  nextLecture?: string
  studentCount?: string
  linkTo: string
  buttonLabel?: string
  imageUrl?: string
}

export default function CourseCard({
  title,
  description,
  teacher,
  teacherAvatar,
  nextLecture,
  studentCount,
  linkTo,
  buttonLabel = 'Открыть курс',
  imageUrl,
}: CourseCardProps) {
  return (
    <div className="border border-black/10 rounded-2xl overflow-hidden flex flex-col">
      {imageUrl ? (
        <div className="h-52 bg-zinc-100">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-52 bg-zinc-200 flex items-center justify-center">
          <GraduationCap className="w-16 h-16 text-zinc-400" />
        </div>
      )}
      <div className="bg-white p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-xl text-zinc-900">{title}</h3>
            <p className="text-sm text-zinc-600">{description}</p>
            {studentCount && (
              <p className="text-sm text-zinc-600">{studentCount}</p>
            )}
          </div>
          {teacher && (
            <div className="flex items-center gap-2">
              {teacherAvatar ? (
                <img src={teacherAvatar} alt={teacher} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-300" />
              )}
              <span className="text-sm font-medium text-zinc-900 truncate">{teacher}</span>
            </div>
          )}
          {nextLecture && (
            <div className="bg-zinc-50 rounded-full px-4 py-2.5">
              <span className="text-xs text-zinc-700">{nextLecture}</span>
            </div>
          )}
        </div>
        <Link to={linkTo}>
          <Button fullWidth>{buttonLabel}</Button>
        </Link>
      </div>
    </div>
  )
}
