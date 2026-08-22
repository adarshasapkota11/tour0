import { Outlet, useLocation } from 'react-router-dom'

import Footer from './Footer'
import Navbar from './Navbar'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink">
      <ScrollToTop />
      <Navbar />
      <main key={pathname} className="flex-1 page-enter">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
