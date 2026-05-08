import { Outlet } from 'react-router-dom'
import Sidebar, { teacherNavItems } from './Sidebar'
import { useAuth } from '../../contexts/AuthContext'

export default function TeacherLayout() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={teacherNavItems}
        userName={user?.full_name || 'Преподаватель'}
        userRole="Преподаватель"
        userAvatar={user?.avatar_url || undefined}
      />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
