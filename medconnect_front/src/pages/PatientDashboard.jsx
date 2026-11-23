import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const statusStyle = {
  Pending: 'bg-amber-100 text-amber-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Cancelled: 'bg-slate-200 text-slate-600',
  Completed: 'bg-brand-light text-brand-darker',
}

function initials(name = '') {
  return name.replace('Dr. ', '').split(' ').map((w) => w[0]).slice(0, 2).join('')
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

export default function PatientDashboard() {
  const { user: me } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctorCount, setDoctorCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!me?.profile_id) return
    Promise.all([
      axios.get(`http://127.0.0.1:8000/patients/${me.profile_id}/appointments`),
      axios.get('http://127.0.0.1:8000/doctors'),
    ])
      .then(([apptRes, docRes]) => {
        setAppointments(apptRes.data)
        setDoctorCount(docRes.data.length)
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false))
  }, [me?.profile_id])

  const upcoming = appointments.filter((a) => a.status === 'Pending' || a.status === 'Accepted')
  const pending = appointments.filter((a) => a.status === 'Pending')
  const completed = appointments.filter((a) => a.status === 'Completed')

  if (!me) return null

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      {/* Greeting + quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Welcome, {me.name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="mt-1 text-ink-soft">Manage your appointments and find doctors.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/doctors" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Find a Doctor
          </Link>
          <Link to="/appointments" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-surface">
            My Appointments
          </Link>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Upcoming" value={upcoming.length} sub="scheduled" />
        <StatTile label="Pending" value={pending.length} sub="awaiting doctor" />
        <StatTile label="Completed" value={completed.length} sub="past visits" />
        <StatTile label="Doctors" value={doctorCount} sub="available now" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Appointments */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Your Appointments</h2>
            <Link to="/appointments" className="text-sm font-medium text-brand hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-4">
            {loading ? (
              <p className="text-sm text-ink-soft">Loading...</p>
            ) : appointments.length === 0 ? (
              <p className="text-sm text-ink-soft">You have no appointments yet.</p>
            ) : (
              appointments.map((a) => (
                <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
                    {initials(a.doctor_name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-ink">{a.doctor_name}</h3>
                    <p className="text-sm text-ink-soft">{a.specialization}</p>
                    <p className="mt-1 text-sm text-ink-soft">{a.appointment_date} · {a.appointment_time}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Profile card */}
        <div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-light text-2xl font-bold text-brand">
                {initials(me.name)}
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{me.name}</h3>
              <span className="mt-1 rounded-full bg-brand-surface px-3 py-0.5 text-xs font-medium text-brand-darker">Patient</span>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-soft">Age</span><span className="font-medium text-ink">{me.age ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Gender</span><span className="font-medium text-ink">{me.gender ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Blood Group</span><span className="font-medium text-ink">{me.blood_group ?? '—'}</span></div>
              <div className="flex justify-between gap-2"><span className="text-ink-soft">Email</span><span className="truncate font-medium text-ink">{me.email}</span></div>
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
