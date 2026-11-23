import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Toast from '../components/Toast'

const field =
  'mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [role, setRole] = useState('patient') // 'patient' | 'doctor'
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Male',
    blood_group: '',
    specialization: '',
    experience: '',
  })

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  // Shows a readable error and logs the full one to the console for debugging.
  const showError = (err) => {
    console.error(err)
    const m = err?.message
    setError(
      m && m !== '{}'
        ? m
        : "Couldn't send the code to this email. The free Resend sender only delivers to your own Resend address — use that email, or verify a domain in Resend.",
    )
  }

  const submitForm = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Please enter your name.')
    if (!form.email.includes('@')) return setError('Please enter a valid email.')
    setError('')
    setLoading(true)
    // Sends the OTP email (and creates the auth user on first time).
    const { error: otpError } = await supabase.auth.signInWithOtp({ email: form.email })
    setLoading(false)
    if (otpError) return showError(otpError)
    setStep('otp')
    setResendTimer(60)
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return setError('Enter the 6-digit code.')
    setError('')
    setLoading(true)
    // Verify the code — creates the real Supabase session.
    const { data, error: verifyError } = await supabase.auth.verifyOtp({ email: form.email, token: otp, type: 'email' })
    if (verifyError) {
      setLoading(false)
      return showError(verifyError)
    }

    // Now save the profile to our own backend, which writes it into
    // the users + doctors/patients tables. data.user.id is the real
    // Supabase Auth id — that's what links this row to the login.
    let profile
    try {
      await axios.post('http://127.0.0.1:8000/signup', {
        id: data.user.id,
        name: form.name,
        email: form.email,
        role,
        age: role === 'patient' ? Number(form.age) || null : null,
        gender: role === 'patient' ? form.gender : null,
        blood_group: role === 'patient' ? form.blood_group : null,
        specialization: role === 'doctor' ? form.specialization : null,
        experience: role === 'doctor' ? Number(form.experience) || null : null,
      })
      // Fetch the profile back from the backend instead of building it
      // from the form — this is what includes profile_id (the doctors/
      // patients row's own id, which booking an appointment needs).
      // Building it locally from the form was the bug: it always came
      // out missing profile_id, so booking would fail right after signup
      // until you logged out and back in (which used the correct path).
      const res = await axios.get(`http://127.0.0.1:8000/users/${data.user.id}`)
      profile = res.data
    } catch (err) {
      setLoading(false)
      return showError({ message: 'Your account was verified, but saving your profile failed. Please try again.' })
    }

    setLoading(false)
    login(profile)
    // Show the success pop-up, then move to the dashboard a beat later.
    setShowToast(true)
    setTimeout(() => {
      navigate(role === 'doctor' ? '/doctor-dashboard' : '/patient')
    }, 900)
  }

  // Resend cooldown countdown.
  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  const resend = async () => {
    if (resendTimer > 0) return
    setError('')
    setLoading(true)
    const { error: resendError } = await supabase.auth.signInWithOtp({ email: form.email })
    setLoading(false)
    if (resendError) return showError(resendError)
    setResendTimer(60)
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Toast message="Account created successfully!" show={showToast} />
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {step === 'form'
            ? 'Sign up to book and manage appointments.'
            : `Enter the 6-digit code sent to ${form.email}`}
        </p>

        {step === 'form' && (
          <form onSubmit={submitForm} className="mt-6 space-y-4">
            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-brand-surface p-1">
              {['patient', 'doctor'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-md py-2 text-sm font-semibold capitalize transition ${
                    role === r ? 'bg-brand text-white shadow-sm' : 'text-ink-soft hover:text-brand'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Full name</label>
              <input value={form.name} onChange={update('name')} placeholder="Your name" className={field} />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Email</label>
              <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className={field} />
            </div>

            {/* Patient-only fields */}
            {role === 'patient' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-ink">Age</label>
                  <input type="number" value={form.age} onChange={update('age')} placeholder="22" className={field} />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Gender</label>
                  <select value={form.gender} onChange={update('gender')} className={field}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Blood</label>
                  <input value={form.blood_group} onChange={update('blood_group')} placeholder="O+" className={field} />
                </div>
              </div>
            )}

            {/* Doctor-only fields */}
            {role === 'doctor' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-ink">Specialization</label>
                  <input value={form.specialization} onChange={update('specialization')} placeholder="Cardiologist" className={field} />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Experience (yrs)</label>
                  <input type="number" value={form.experience} onChange={update('experience')} placeholder="5" className={field} />
                </div>
              </div>
            )}

            {typeof error === 'string' && error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verifyOtp} className="mt-6 space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="______"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
            {typeof error === 'string' && error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setStep('form')} className="text-ink-soft hover:text-brand">
                ← Back
              </button>
              {resendTimer > 0 ? (
                <span className="text-ink-soft">
                  Resend in {Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resend}
                  disabled={loading}
                  className="font-medium text-brand hover:underline disabled:opacity-60"
                >
                  Resend code
                </button>
              )}
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </section>
  )
}
