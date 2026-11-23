import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Toast from '../components/Toast'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [role, setRole] = useState('patient') // 'patient' | 'doctor'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0) // seconds left before "Resend" is allowed
  const [showToast, setShowToast] = useState(false)

  const sendOtp = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    setError('')
    setLoading(true)
    // Supabase emails a 6-digit code to the address.
    const { error: otpError } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (otpError) {
      setError(otpError.message)
      return
    }
    setStep('otp')
    setResendTimer(60) // start the 60s cooldown
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.')
      return
    }
    setError('')
    setLoading(true)
    // Verify the code — this creates a real Supabase session.
    const { data, error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    if (verifyError) {
      setLoading(false)
      setError(verifyError.message)
      return
    }

    // Fetch the real saved profile (name, role, specialization/age, etc.)
    // from our own backend instead of using fake mock data.
    let profile
    try {
      const res = await axios.get(`http://127.0.0.1:8000/users/${data.user.id}`)
      profile = res.data
    } catch (err) {
      setLoading(false)
      setError("Couldn't load your profile. Make sure you've signed up first.")
      return
    }

    setLoading(false)
    login(profile)
    // Show the success pop-up, then move to the dashboard a beat later.
    setShowToast(true)
    setTimeout(() => {
      navigate(profile.role === 'doctor' ? '/doctor-dashboard' : '/patient')
    }, 900)
  }

  // Ticks the resend cooldown down by 1 every second until it hits 0.
  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    return () => clearTimeout(id)
  }, [resendTimer])

  const resend = async () => {
    if (resendTimer > 0) return
    setError('')
    setLoading(true)
    const { error: resendError } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (resendError) {
      setError(resendError.message)
      return
    }
    setResendTimer(60) // restart the cooldown
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Toast message="Login successful!" show={showToast} />
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {step === 'email'
            ? 'Log in to book and manage your appointments.'
            : `Enter the 6-digit code sent to ${email}`}
        </p>

        {/* Role toggle */}
        {step === 'email' && (
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-brand-surface p-1">
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
        )}

        {/* Step 1: email */}
        {step === 'email' && (
          <form onSubmit={sendOtp} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
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
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify & Log In'}
            </button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setStep('email')} className="text-ink-soft hover:text-brand">
                ← Change email
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
          New here?{' '}
          <Link to="/signup" className="font-semibold text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  )
}
