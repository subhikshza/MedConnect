import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

// colour for each status badge
const statusStyle = {
  Pending: 'bg-amber-100 text-amber-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Cancelled: 'bg-slate-200 text-slate-600',
  Completed: 'bg-brand-light text-brand-darker',
}

function initials(name) {
  return name.replace('Dr. ', '').split(' ').map((w) => w[0]).slice(0, 2).join('')
}

export default function MyAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // user.profile_id is the patients table's own row id — that's what
  // appointments.patient_id actually references.
  useEffect(() => {
    if (!user?.profile_id) return
    axios
      .get(`http://127.0.0.1:8000/patients/${user.profile_id}/appointments`)
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error('Failed to load appointments:', err))
      .finally(() => setLoading(false))
  }, [user?.profile_id])

  const cancel = async (id) => {
    // Update on screen immediately, then save it for real.
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a)))
    try {
      await axios.put(`http://127.0.0.1:8000/appointments/${id}/status`, { status: 'Cancelled' })
    } catch (err) {
      console.error('Failed to cancel appointment:', err)
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">My Appointments</h1>
          <p className="mt-1 text-ink-soft">Track and manage your bookings.</p>
        </div>
        <Link to="/doctors" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          + Book New
        </Link>
      </div>

      {loading ? (
        <p className="mt-16 text-center text-ink-soft">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="mt-16 text-center text-ink-soft">You have no appointments yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {appointments.map((a) => (
            <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
                {initials(a.doctor_name)}
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-ink">{a.doctor_name}</h3>
                <p className="text-sm text-ink-soft">{a.specialization}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {a.appointment_date} · {a.appointment_time}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[a.status]}`}>
                  {a.status}
                </span>
                {(a.status === 'Pending' || a.status === 'Accepted') && (
                  <button
                    onClick={() => cancel(a.id)}
                    className="text-sm font-medium text-red-500 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
