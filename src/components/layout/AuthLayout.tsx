import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center bg-white px-4 py-10 sm:py-6">
      <Outlet />
    </div>
  )
}
