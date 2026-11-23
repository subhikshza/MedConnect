import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const statusStyle = {
  Pending: 'bg-amber-100 text-amber-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

function initials(name) {
  return (name || '')
    .replace('Dr. ', '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
}

function StatTile({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="text-xs text-ink-soft">{sub}</p>}
    </div>
  )
}

export default function DoctorDashboard() {
  const { user: doc } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Load this doctor's real appointments once we know who's logged in.
  // doc.profile_id is the doctors table's own row id — that's what
  // appointments.doctor_id actually references.
  useEffect(() => {
    if (!doc?.profile_id) return
    axios
      .get(`http://127.0.0.1:8000/doctors/${doc.profile_id}/appointments`)
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error('Failed to load appointments:', err))
      .finally(() => setLoading(false))
  }, [doc?.profile_id])

  const setStatus = async (id, status) => {
    // Update on screen immediately so it feels instant...
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    try {
      // ...then save it for real. If this fails, we just log it — good
      // enough for now, a refresh will show the true state either way.
      await axios.put(`http://127.0.0.1:8000/appointments/${id}/status`, { status })
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const requests = appointments.filter((a) => a.status === 'Pending')
  const schedule = appointments
    .filter((a) => a.status === 'Accepted')
    .slice()
    .sort((a, b) => (a.appointment_date + a.appointment_time).localeCompare(b.appointment_date + b.appointment_time))

  if (!doc) return null

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-ink">
          Welcome back, {doc.name?.split(' ')[1] ? `Dr. ${doc.name.split(' ')[1]}` : doc.name} 👋
        </h1>
        <p className="mt-1 text-ink-soft">Here’s what’s happening with your appointments today.</p>
      </div>

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Pending Requests" value={requests.length} sub="need your response" />
        <StatTile label="Upcoming" value={schedule.length} sub="confirmed appointments" />
        <StatTile label="Total Patients" value={doc.total_patients ?? 0} sub="all time" />
        <StatTile label="Rating" value={`${doc.rating ?? 0} ★`} sub="patient feedback" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left: requests + schedule */}
        <div className="space-y-8 lg:col-span-2">
          {/* Pending requests */}
          <div>
            <h2 className="text-lg font-semibold text-ink">Appointment Requests</h2>
            <div className="mt-4 space-y-4">
              {loading ? (
                <p className="text-sm text-ink-soft">Loading...</p>
              ) : requests.length === 0 ? (
                <p className="text-sm text-ink-soft">No pending requests right now.</p>
              ) : (
                requests.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-ink">{r.patient_name}</h3>
                        <p className="text-sm text-ink-soft">{r.age} yrs · {r.gender}</p>
                        {r.reason && (
                          <p className="mt-2 text-sm text-ink-soft">
                            <span className="font-medium text-ink">Reason:</span> {r.reason}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-ink-soft">{r.appointment_date} · {r.appointment_time}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[r.status]}`}>
                        {r.status}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
                      <button onClick={() => setStatus(r.id, 'Accepted')} className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                        Accept
                      </button>
                      <button onClick={() => setStatus(r.id, 'Rejected')} className="flex-1 rounded-lg border border-red-300 py-2 text-sm font-semibold text-red-500 hover:bg-red-50">
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming schedule */}
          <div>
            <h2 className="text-lg font-semibold text-ink">Upcoming Schedule</h2>
            {schedule.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">No upcoming appointments yet.</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                {schedule.map((s, i) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 p-4 ${i !== 0 ? 'border-t border-slate-100' : ''}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
                      {initials(s.patient_name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{s.patient_name}</p>
                      {s.reason && <p className="truncate text-sm text-ink-soft">{s.reason}</p>}
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-ink">{s.appointment_time}</p>
                      <p className="text-ink-soft">{s.appointment_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: profile card */}
        <div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-light text-2xl font-bold text-brand">
                {initials(doc.name)}
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{doc.name}</h3>
              <span className="mt-1 rounded-full bg-brand-surface px-3 py-0.5 text-xs font-medium text-brand-darker">
                {doc.specialization}
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-soft">Experience</span><span className="font-medium text-ink">{doc.experience} yrs</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Consultation Fee</span><span className="font-medium text-ink">₹{doc.fee}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Available Days</span><span className="font-medium text-ink">{doc.available_days}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Timing</span><span className="font-medium text-ink">{doc.available_time}</span></div>
              <div className="flex justify-between gap-2"><span className="text-ink-soft">Email</span><span className="truncate font-medium text-ink">{doc.email}</span></div>
            </div>

            <Link to="/profile" className="mt-6 block w-full rounded-lg border border-brand py-2.5 text-center text-sm font-semibold text-brand transition hover:bg-brand-surface">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
