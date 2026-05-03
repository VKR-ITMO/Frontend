import { Routes, Route } from 'react-router-dom'

import GuestLayout from './components/layout/GuestLayout'
import AuthLayout from './components/layout/AuthLayout'
import StudentLayout from './components/layout/StudentLayout'
import TeacherLayout from './components/layout/TeacherLayout'

import HomePage from './pages/guest/HomePage'
import LoginPage from './pages/guest/LoginPage'
import RegisterPage from './pages/guest/RegisterPage'
import ForgotPasswordPage from './pages/guest/ForgotPasswordPage'

import StudentDashboardPage from './pages/student/DashboardPage'
import StudentCoursesPage from './pages/student/CoursesPage'
import StudentCourseDetailPage from './pages/student/CourseDetailPage'
import StudentProfilePage from './pages/student/ProfilePage'
import StudentEditProfilePage from './pages/student/EditProfilePage'
import LectureWaitingPage from './pages/student/LectureWaitingPage'
import LectureLivePage from './pages/student/LectureLivePage'
import LectureResultsPage from './pages/student/LectureResultsPage'

import TeacherDashboardPage from './pages/teacher/DashboardPage'
import TeacherCoursesPage from './pages/teacher/CoursesPage'
import TeacherCourseDetailPage from './pages/teacher/CourseDetailPage'
import QuizEditorPage from './pages/teacher/QuizEditorPage'
import GradesDetailPage from './pages/teacher/GradesDetailPage'
import TeacherProfilePage from './pages/teacher/ProfilePage'
import TeacherEditProfilePage from './pages/teacher/EditProfilePage'
import LiveSessionPage from './pages/teacher/LiveSessionPage'
import ActiveSessionPage from './pages/teacher/ActiveSessionPage'

export default function App() {
  return (
    <Routes>
      {/* Guest Pages */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Student Pages */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentDashboardPage />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route path="courses/:courseId" element={<StudentCourseDetailPage />} />
        <Route path="courses/:courseId/lecture/waiting" element={<LectureWaitingPage />} />
        <Route path="courses/:courseId/lecture/live" element={<LectureLivePage />} />
        <Route path="courses/:courseId/lecture/results" element={<LectureResultsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="profile/edit" element={<StudentEditProfilePage />} />
      </Route>

      {/* Teacher Pages */}
      <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<TeacherDashboardPage />} />
        <Route path="courses" element={<TeacherCoursesPage />} />
        <Route path="courses/:courseId" element={<TeacherCourseDetailPage />} />
        <Route path="courses/:courseId/quiz/:quizId" element={<QuizEditorPage />} />
        <Route path="courses/:courseId/grades/:quizId" element={<GradesDetailPage />} />
        <Route path="profile" element={<TeacherProfilePage />} />
        <Route path="profile/edit" element={<TeacherEditProfilePage />} />
        <Route path="live" element={<LiveSessionPage />} />
        <Route path="live/active" element={<ActiveSessionPage />} />
      </Route>
    </Routes>
  )
}
