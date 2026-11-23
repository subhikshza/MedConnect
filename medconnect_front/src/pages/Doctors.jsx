import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// initials for the avatar circle, e.g. "Dr. Aarthi Ramesh" -> "AR"
function initials(name) {
  return name
    .replace('Dr. ', '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
}

function DoctorCard({ doc, onBook }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-lg font-bold text-brand">
          {initials(doc.name)}
        </span>
        <div>
          <h3 className="font-semibold text-ink">{doc.name}</h3>
          <span className="mt-1 inline-block rounded-full bg-brand-surface px-2.5 py-0.5 text-xs font-medium text-brand-darker">
            {doc.specialization}
          </span>
        </div>
        <span className="ml-auto flex items-center gap-1 text-sm font-medium text-amber-500">
          ★ <span className="text-ink">{doc.rating}</span>
        </span>
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-ink-soft">
        <p>{doc.experience} years experience</p>
        <p>Available: {doc.available_days}</p>
        <p>Timing: {doc.available_time}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-lg font-bold text-ink">₹{doc.fee}</span>
        <button
          onClick={() => onBook(doc.id)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Book Appointment
        </button>
      </div>
    </div>
  )
}

export default function Doctors() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch the real doctors list from FastAPI once, when this page loads.
  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/doctors')
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error('Failed to load doctors:', err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter((d) => {
    const q = query.toLowerCase()
    return d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q)
  })

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-ink">Find a Doctor</h1>
        <p className="mt-2 text-ink-soft">Browse our trusted specialists and book an appointment.</p>
      </div>

      {/* Search */}
      <div className="mx-auto mt-8 max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or specialization..."
          className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <p className="mt-16 text-center text-ink-soft">Loading doctors...</p>
      ) : filtered.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <DoctorCard key={doc.id} doc={doc} onBook={(id) => navigate(`/book/${id}`)} />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <p className="mt-16 text-center text-ink-soft">
          No doctors have signed up yet — sign up as a doctor to see one here.
        </p>
      ) : (
        <p className="mt-16 text-center text-ink-soft">No doctors match “{query}”.</p>
      )}
    </section>
  )
}
