import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const location = useLocation()

  const titles = {
    '/': 'Overview',
    '/tenants': 'Tenants',
    '/plans': 'Plans',
    '/usage': 'Usage',
  }

  const title = titles[location.pathname] || 'Overview'

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        {/* <header className="topbar">
          <div>
            <p className="eyebrow">BILLING MANAGEMENT</p>
            <h1>{title}</h1>
          </div>
          <div className="avatar">A</div>
        </header> */}

        <Outlet />
      </main>
    </div>
  )
}
