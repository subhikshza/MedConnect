import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Doctors from './pages/Doctors'
import BookAppointment from './pages/BookAppointment'
import MyAppointments from './pages/MyAppointments'
import DoctorDashboard from './pages/DoctorDashboard'
import PatientDashboard from './pages/PatientDashboard'
import Profile from './pages/Profile'

// Guard: if nobody is logged in, send them to the login page.
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Focused pages get a clean layout: no marketing nav links, no footer.
const MINIMAL_ROUTES = ['/login', '/signup', '/book', '/appointments', '/doctor-dashboard', '/patient', '/profile']

function App() {
  const location = useLocation()
  const minimal = MINIMAL_ROUTES.some((p) => location.pathname.startsWith(p))

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar minimal={minimal} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/doctors" element={<Doctors />} />

          {/* These require login */}
          <Route path="/book" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/book/:doctorId" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
          <Route path="/doctor-dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/patient" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
      {!minimal && <Footer />}
    </div>
  )
}

export default App
