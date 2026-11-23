import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Heartbeat pulse logo mark
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h3l2-6 4 12 2-6h4" />
        </svg>
      </span>
      <span className="text-xl font-bold text-ink">MedConnect</span>
    </Link>
  )
}

export default function Navbar({ minimal = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const links = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/#about' },
    { label: 'Features', to: '/#features' },
    { label: 'How It Works', to: '/#how' },
    { label: 'Contact', to: '/#contact' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Logo />

        {!minimal && (
          <ul className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
            {links.map((l) =>
              l.to.includes('#') ? (
                <li key={l.label}>
                  <a href={l.to} className="transition hover:text-brand">
                    {l.label}
                  </a>
                </li>
              ) : (
                <li key={l.label}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      `transition hover:text-brand ${isActive ? 'text-brand' : ''}`
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient'}
                className="hidden text-sm font-medium text-ink-soft transition hover:text-brand sm:inline"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="hidden text-sm font-medium text-ink-soft transition hover:text-brand sm:inline"
              >
                Profile
              </Link>
              <span className="hidden text-sm text-ink-soft md:inline">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-surface"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-surface"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
