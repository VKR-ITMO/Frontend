import { Outlet } from 'react-router-dom'
import GuestHeader from './GuestHeader'
import Footer from './Footer'

export default function GuestLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <GuestHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
