import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, Home, BookOpen, User, KeyRound, LayoutDashboard, Radio, ChevronLeft } from 'lucide-react'
import { useState } from 'react'

export interface SidebarItem {
  label: string
  icon: React.ReactNode
  path: string
  exact?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  userName: string
  userRole: string
  userAvatar?: string
}

export default function Sidebar({ items, userName, userRole, userAvatar }: SidebarProps) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const isItemActive = (item: SidebarItem) => {
    if (item.exact) {
      return location.pathname === item.path
    }
    return location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path + '/'))
  }

  return (
    <aside
      className={`
        bg-white border-r border-zinc-100 flex flex-col justify-between h-screen sticky top-0
        transition-all duration-200
        ${collapsed ? 'w-[76px]' : 'w-[226px]'}
      `}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2.5 px-6 py-5 relative">
          <div className="bg-zinc-900 rounded-lg w-7 h-7 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm text-zinc-900 tracking-tight">LectureHub</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-14 bg-white border border-zinc-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-zinc-50 transition-colors"
          >
            <ChevronLeft className={`w-3 h-3 text-zinc-500 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <div className="border-t border-zinc-100" />
        <nav className="flex flex-col gap-1 pt-2 px-4">
          {items.map((item) => {
            const isActive = isItemActive(item)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <span className="shrink-0 w-5 h-5">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-zinc-100 px-6 py-5 flex items-center gap-3">
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-300 shrink-0" />
        )}
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-zinc-900 truncate">{userName}</span>
            <span className="text-xs text-zinc-400">{userRole}</span>
          </div>
        )}
      </div>
    </aside>
  )
}

export const studentNavItems: SidebarItem[] = [
  { label: 'Главная', icon: <Home className="w-5 h-5" />, path: '/student', exact: true },
  { label: 'Курсы', icon: <BookOpen className="w-5 h-5" />, path: '/student/courses' },
  { label: 'Профиль', icon: <User className="w-5 h-5" />, path: '/student/profile' },
  { label: 'Войти по коду', icon: <KeyRound className="w-5 h-5" />, path: '/join' },
]

export const teacherNavItems: SidebarItem[] = [
  { label: 'Дашборд', icon: <LayoutDashboard className="w-5 h-5" />, path: '/teacher', exact: true },
  { label: 'Курсы', icon: <BookOpen className="w-5 h-5" />, path: '/teacher/courses' },
  { label: 'Профиль', icon: <User className="w-5 h-5" />, path: '/teacher/profile' },
  { label: 'Live-сессия', icon: <Radio className="w-5 h-5" />, path: '/teacher/live' },
]
