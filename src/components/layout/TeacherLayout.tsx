import { Outlet } from 'react-router-dom'
import Sidebar, { teacherNavItems } from './Sidebar'

export default function TeacherLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={teacherNavItems}
        userName="Иван Петров"
        userRole="Преподаватель"
      />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
