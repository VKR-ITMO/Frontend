import { Outlet } from 'react-router-dom'
import Sidebar, { studentNavItems } from './Sidebar'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentLayout() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={studentNavItems}
        userName={user?.full_name || 'Студент'}
        userRole="Студент"
        userAvatar={user?.avatar_url || undefined}
      />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
