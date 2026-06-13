export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string | null
  role: UserRole
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface AuthMeResponse {
  username: string
  id: string
}

export interface StudentStats {
  total_courses: number
  total_lectures_attended: number
  total_quizzes_taken: number
  average_quiz_score: number
  total_achievements: number
}

export interface Achievement {
  id: string
  type: string
  title: string
  description: string
  earned_at: string
}

export type CourseStatus = 'ACTIVE' | 'ARCHIVED'

export interface Course {
  id: string
  teacher_id: string
  name: string
  code: string
  description?: string | null
  semester: string
  image_url?: string | null
  status: CourseStatus
  created_at: string
}

export interface CourseWithStats extends Course {
  total_students: number
  total_lectures: number
}

export interface CourseCreate {
  name: string
  code: string
  description?: string
  semester: string
  image_url?: string
}

export interface CourseUpdate {
  name?: string
  code?: string
  description?: string
  semester?: string
  image_url?: string
  status?: CourseStatus
}

export type LectureStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED'

export interface Lecture {
  id: string
  name: string
  topic: string
  description?: string | null
  scheduled_at?: string | null
  max_participants?: number | null
  enabled_reactions?: string[] | null
  course_id?: string | null
  teacher_id: string
  status: LectureStatus
  access_code?: string | null
  is_free_session: boolean
}

export interface LectureCreate {
  name: string
  topic: string
  description?: string
  scheduled_at?: string
  max_participants?: number
  enabled_reactions?: string[]
}

export interface LectureUpdate {
  name?: string
  topic?: string
  description?: string
  scheduled_at?: string
  status?: LectureStatus
  max_participants?: number
  enabled_reactions?: string[]
}

export interface LecturePublishResponse {
  access_code: string
  qr_code_url: string
}

export interface Session {
  id: string
  lecture_id: string
  teacher_id: string
  access_code: string
  started_at: string
  ended_at?: string | null
  total_participants: number
  total_reactions: number
  total_quizzes: number
}

export interface SessionWithLecture extends Session {
  lecture: Lecture
}

export interface GuestJoinResponse {
  access_token: string
  token_type: string
  student_id: string
  student_name: string
  session: SessionWithLecture
}

export interface SessionParticipant {
  id: string
  session_id: string
  student_id: string
  student_name: string
  student_email: string
  joined_at: string
  left_at?: string | null
  total_score?: number
}

export interface CompletedSession {
  id: string
  lecture_id: string
  started_at: string
  ended_at: string
  total_participants: number
  total_reactions: number
  total_quizzes: number
  duration_seconds: number
}

export interface SessionStart {
  lecture_id: string
}

export interface SessionJoin {
  access_code: string
}

export type ReactionType = 'THUMBS_UP' | 'HEART' | 'CLAP' | 'THINKING' | 'CONFUSED' | 'FIRE'

export interface Reaction {
  id: string
  session_id: string
  student_id: string
  type: ReactionType
  created_at: string
}

export interface ReactionStats {
  THUMBS_UP: number
  HEART: number
  CLAP: number
  THINKING: number
  CONFUSED: number
  FIRE: number
  total: number
}

export interface Quiz {
  id: string
  title: string
  description?: string | null
  course_id?: string | null
  created_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_answer: number
  order: number
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[]
}

export interface SessionQuiz {
  id: string
  session_id: string
  quiz_id: string
  launched_at: string
  started_at: string
  ended_at?: string | null
  time_limit?: number
}

export interface QuizSubmission {
  id: string
  session_quiz_id: string
  student_id: string
  answers: { questionId: string; answerId: number }[]
  score: number
  submitted_at: string
}

export interface QuizResult {
  student_id: string
  student_name: string
  score: number
  correct: number
  total: number
}

export interface LeaderboardEntry {
  student_id: string
  student_name: string
  score: number
  submitted_at: string
}

export type AnnouncementType = 'INFO' | 'WARNING' | 'SUCCESS'

export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  course_id?: string | null
  created_at: string
}

export interface AnnouncementCreate {
  title: string
  content: string
  type: AnnouncementType
  course_id?: string
}

export interface ScheduleItem {
  id: string
  type: 'lecture' | 'quiz'
  title: string
  course_name: string
  scheduled_at: string
}

export interface TeacherAnalytics {
  sessions: number
  students: number
  avgScore: number
  reactionSummary: ReactionStats
}

export interface CourseAnalytics {
  course_id: string
  total_lectures: number
  total_students: number
  average_attendance: number
  average_quiz_score: number
}

export interface SessionAnalytics {
  session_id: string
  duration_seconds: number
  participants: number
  reactions: ReactionStats
  quiz_stats: {
    total: number
    average_score: number
  }
}

export interface StudentAnalytics {
  total_lectures_attended: number
  total_quizzes_taken: number
  average_score: number
  courses_progress: {
    course_id: string
    course_name: string
    progress: number
  }[]
}
