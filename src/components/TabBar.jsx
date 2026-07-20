import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Users, Plus, Briefcase, Trophy } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/consultants', label: 'Contacts', icon: Users },
  { to: '/projects', label: 'Projects', icon: Briefcase },
  { to: '/profile', label: 'Profile', icon: Trophy },
]

export default function TabBar() {
  const navigate = useNavigate()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-5 items-end px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
        <Tab {...tabs[0]} />
        <Tab {...tabs[1]} />
        <li className="flex list-none justify-center">
          <button
            onClick={() => navigate('/log')}
            aria-label="Log interaction"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 active:scale-95"
          >
            <Plus size={26} />
          </button>
        </li>
        <Tab {...tabs[2]} />
        <Tab {...tabs[3]} />
      </div>
    </nav>
  )
}

function Tab({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium ${
          isActive ? 'text-blue-600' : 'text-slate-400'
        }`
      }
    >
      <Icon size={22} />
      {label}
    </NavLink>
  )
}
