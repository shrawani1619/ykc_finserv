import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const [sidebarMinimized, setSidebarMinimized] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar onMinimizeChange={setSidebarMinimized} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarMinimized ? 'ml-20' : 'ml-64'} relative z-0 min-w-0 overflow-hidden`}>
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative z-10 w-full">
          <div className="w-full max-w-full mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
