import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const TIME_SLOTS = ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '04:00 PM', '04:30 PM']

function initials(name) {
  return name.replace('Dr. ', '').split(' ').map((w) => w[0]).slice(0, 2).join('')
}

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // The full doctors list (for the dropdown when no doctorId came from the
  // URL), fetched once from the real API.
  const [doctors, setDoctors] = useState([])
  const [selectedId, setSelectedId] = useState(doctorId || '')
  const doctor = doctors.find((d) => d.id === selectedId)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [booked, setBooked] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/doctors')
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error('Failed to load doctors:', err))
  }, [])

  const confirm = async (e) => {
    e.preventDefault()
    if (!doctor) return setError('Please choose a doctor.')
    if (!date) return setError('Please pick a date.')
    if (!time) return setError('Please pick a time slot.')
    setError('')
    setLoading(true)
    try {
      await axios.post('http://127.0.0.1:8000/appointments', {
        patient_id: user.profile_id,
        doctor_id: doctor.id,
        appointment_date: date,
        appointment_time: time,
      })
      setBooked(true)
    } catch (err) {
      console.error(err)
      setError('Could not book the appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ---------- success screen ----------
  if (booked && doctor) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16 text-center">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-lg">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12l3 3 5-6" />
            </svg>
          </span>
          <h1 className="mt-5 text-2xl font-bold text-ink">Appointment Requested!</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Your request has been sent to {doctor.name}. You'll be notified once it's accepted.
          </p>

          <div className="mt-6 space-y-2 rounded-xl bg-brand-surface p-4 text-left text-sm">
            <div className="flex justify-between"><span className="text-ink-soft">Doctor</span><span className="font-medium text-ink">{doctor.name}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Specialization</span><span className="font-medium text-ink">{doctor.specialization}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Date</span><span className="font-medium text-ink">{date}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Time</span><span className="font-medium text-ink">{time}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Status</span><span className="font-medium text-amber-500">Pending</span></div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link to="/appointments" className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              My Appointments
            </Link>
            <Link to="/doctors" className="flex-1 rounded-lg border border-brand py-2.5 text-sm font-semibold text-brand hover:bg-brand-surface">
              Book Another
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // ---------- booking form ----------
  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <button onClick={() => navigate('/doctors')} className="text-sm text-ink-soft hover:text-brand">
        ← Back to doctors
      </button>
      <h1 className="mt-3 text-3xl font-bold text-ink">Book an Appointment</h1>

      {/* Doctor picker (shown if no doctor came from the URL) */}
      {!doctorId && (
        <div className="mt-6">
          <label className="text-sm font-medium text-ink">Choose a doctor</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
          >
            <option value="">Select...</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialization}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected doctor summary */}
      {doctor && (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-lg font-bold text-brand">
            {initials(doctor.name)}
          </span>
          <div>
            <h3 className="font-semibold text-ink">{doctor.name}</h3>
            <p className="text-sm text-ink-soft">{doctor.specialization} · {doctor.experience} yrs · ₹{doctor.fee}</p>
            <p className="text-xs text-ink-soft">Available: {doctor.available_days}</p>
          </div>
        </div>
      )}

      <form onSubmit={confirm} className="mt-6 space-y-6">
        {/* Date */}
        <div>
          <label className="text-sm font-medium text-ink">Select date</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
          />
        </div>

        {/* Time slots */}
        <div>
          <label className="text-sm font-medium text-ink">Select time slot</label>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`rounded-lg border py-2 text-sm font-medium transition ${
                  time === slot
                    ? 'border-brand bg-brand text-white'
                    : 'border-slate-200 text-ink-soft hover:border-brand hover:text-brand'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </form>
    </section>
  )
}
