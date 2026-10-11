import { NavLink } from 'react-router-dom'

const menuItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Tenants', path: '/tenants' },
  { label: 'Plans', path: '/plans' },
  { label: 'Usage', path: '/usage' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="brand">SaaS Billing Platform</h2>

      <nav>
        {menuItems.map((item) => (
          <NavLink
            style={{ underline: 'none', textDecoration: 'none' }}
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* <div className="sidebar-footer">SaaS Billing Platform</div> */}
    </aside>
  )
}
