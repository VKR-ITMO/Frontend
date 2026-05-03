import { Outlet } from 'react-router-dom'
import Sidebar, { studentNavItems } from './Sidebar'

export default function StudentLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={studentNavItems}
        userName="Иван Петров"
        userRole="Студент"
      />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
