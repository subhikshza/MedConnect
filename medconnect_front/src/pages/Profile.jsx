import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function initials(name = '') {
  return name.replace('Dr. ', '').split(' ').map((w) => w[0]).slice(0, 2).join('')
}

const inputCls =
  'mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light'
const labelCls = 'text-sm font-medium text-ink'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const isDoctor = user?.role === 'doctor'

  const [form, setForm] = useState(user || {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
    setSaved(false)
  }

  // Saves for real now — PUT /users/{id} writes to users + doctors/patients
  // in Supabase, then we drop the fresh merged profile straight into
  // AuthContext so the dashboard/navbar update immediately too.
  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await axios.put(`http://127.0.0.1:8000/users/${user.id}`, {
        name: form.name,
        age: isDoctor ? null : Number(form.age) || null,
        gender: isDoctor ? null : form.gender,
        blood_group: isDoctor ? null : form.blood_group,
        specialization: isDoctor ? form.specialization : null,
        experience: isDoctor ? Number(form.experience) || null : null,
      })
      updateProfile(res.data)
      setSaved(true)
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('Could not save changes. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <Link to={isDoctor ? '/doctor-dashboard' : '/patient'} className="text-sm text-ink-soft hover:text-brand">
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-ink">My Profile</h1>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-xl font-bold text-brand">
            {initials(form.name)}
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">{form.name}</h2>
            <span className="rounded-full bg-brand-surface px-3 py-0.5 text-xs font-medium capitalize text-brand-darker">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={save} className="mt-6 space-y-4">
          <div>
            <label className={labelCls}>Full name</label>
            <input value={form.name || ''} onChange={set('name')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input value={form.email || ''} readOnly className={`${inputCls} bg-slate-50 text-ink-soft`} />
          </div>

          {isDoctor ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Specialization</label>
                <input value={form.specialization || ''} onChange={set('specialization')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Experience (yrs)</label>
                <input type="number" value={form.experience || ''} onChange={set('experience')} className={inputCls} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Age</label>
                <input type="number" value={form.age || ''} onChange={set('age')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select value={form.gender || 'Male'} onChange={set('gender')} className={inputCls}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Blood Group</label>
                <input value={form.blood_group || ''} onChange={set('blood_group')} className={inputCls} />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-brand px-6 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <span className="text-sm font-medium text-green-600">Profile updated ✓</span>}
          </div>
        </form>
      </div>
    </section>
  )
}
