import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import InputField from '../components/InputField'
import Button from '../components/Button'
import { useSettings } from '../context/SettingsContext'
import api from '../api/axios'
import '../styles/login.css'
import Logo from '../assets/Bacoor.png'

export default function ForgotPassword(){
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const {
    dark, setDark,
    contrast, setContrast,
    fontSize, setFontSize
  } = useSettings()

  const [email, setEmail] = useState('')
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [generatedToken, setGeneratedToken] = useState('')
  const [step, setStep] = useState(searchParams.get('token') ? 2 : 1)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  const panelRef = useRef(null)

  useEffect(() => {
    function onDown(e){
      if(!settingsOpen) return
      const el = panelRef.current
      if(el && !el.contains(e.target)) setSettingsOpen(false)
    }

    function onEsc(e){
      if(e.key === 'Escape') setSettingsOpen(false)
    }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onEsc)

    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [settingsOpen])

  function validateStep1(){
    const e = {}
    if(!email.trim()) e.email = 'Email is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2(){
    const e = {}
    if(!email.trim()) e.email = 'Email is required'
    if(!token.trim()) e.token = 'Reset code is required'
    if(!password.trim()) e.password = 'Password is required'
    if(!confirmPassword.trim()) e.confirmPassword = 'Confirm password is required'
    if(password && confirmPassword && password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    if(password && password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleRequestReset(e){
    e.preventDefault()
    if(!validateStep1()) return

    setLoading(true)
    try{
      const res = await api.post('/forgot-password', { email })
      const data = res.data
      
      if(data.success){
        setGeneratedToken(data.token)
        setToken(data.token)
        setSuccessMessage('Reset code generated successfully!')
        setErrors({})
        setStep(2)
      } else {
        setErrors({ form: data.message || 'Failed to request reset' })
      }
    } catch(err){
      setErrors({ form: err.message || 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e){
    e.preventDefault()
    if(!validateStep2()) return

    setLoading(true)
    try{
      const res = await api.post('/reset-password', { email, token, password })
      const data = res.data

      if(data.success){
        setSuccessMessage('Password reset successfully! Redirecting to login...')
        setErrors({})
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setErrors({ form: data.message || 'Failed to reset password' })
      }
    } catch(err){
      setErrors({ form: err?.response?.data?.message || err.message || 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  const fontOptions = useMemo(() => ([
    { key: 'small', label: 'S' },
    { key: 'medium', label: 'M' },
    { key: 'large', label: 'L' },
    { key: 'xlarge', label: 'XL' },
  ]), [])

  return (
    <div className="login-shell">
      <header className="login-topbar">
        <div className="topbar-left">
          <div className="topbar-brand">
            <img
              src="/src/assets/Bacoor.png"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = Logo
              }}
              alt="City of Bacoor logo"
              className="topbar-logo"
            />

            <div className="brand-copy">
              <div className="brand-kicker">Barangay</div>
              <div className="brand-name">Mambog II</div>
            </div>
          </div>
        </div>

        <div className="topbar-center">
          <h1 className="system-title">Barangay Service &amp; Complaint Management System</h1>
          <p className="system-subtitle">
            Online platform for complaint submission and barangay document requests
          </p>
        </div>

        <div className="topbar-right" ref={panelRef}>
          <button
            type="button"
            className="settings-btn"
            aria-label="Open display settings"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen(v => !v)}
            title="Display settings"
          >
            <span className="settings-gear">⚙</span>
            <span className="settings-text">Settings</span>
          </button>

          {settingsOpen && (
            <div className="settings-panel" role="dialog" aria-label="Display settings">
              <div className="settings-head">
                <strong>Display Settings</strong>
                <button
                  type="button"
                  className="settings-close"
                  aria-label="Close settings"
                  onClick={() => setSettingsOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="settings-item">
                <div className="settings-label">
                  <span>High contrast</span>
                  <small>Improve visibility and borders</small>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={contrast}
                    onChange={(e) => setContrast(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="settings-item">
                <div className="settings-label">
                  <span>Dark mode</span>
                  <small>Use darker page colors</small>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={dark}
                    onChange={(e) => setDark(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>

              <div className="settings-divider" />

              <div className="settings-label block">
                <span>Font size</span>
                <small>Adjust text size for readability</small>
              </div>

              <div className="font-size-row" role="group" aria-label="Font size">
                {fontOptions.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`chip ${fontSize === opt.key ? 'active' : ''}`}
                    onClick={() => setFontSize(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="login-main">
        <section className="login-layout">
          <aside className="login-info" aria-label="System information">
            <div className="info-badge">Password Recovery</div>

            <h2 className="info-title">
              Reset your password securely
            </h2>

            <p className="info-text">
              Follow the simple steps to recover access to your account.
              Enter your email address and you'll receive a reset code.
              Use that code to create a new password.
            </p>

            <div className="info-points">
              <div className="info-point">
                <span className="info-dot" />
                <span>Enter your registered email address</span>
              </div>

              <div className="info-point">
                <span className="info-dot" />
                <span>Receive your password reset code</span>
              </div>

              <div className="info-point">
                <span className="info-dot" />
                <span>Create a new secure password</span>
              </div>
            </div>
          </aside>

          {step === 1 && (
            <form className="login-card" onSubmit={handleRequestReset} aria-labelledby="resetTitle" noValidate>
              <div className="login-body">
                <div className="card-head">
                  <h2 id="resetTitle" className="card-title">Forgot password?</h2>
                  <p className="card-sub">Enter your email address to receive a reset code.</p>
                </div>

                <InputField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  error={errors.email}
                  placeholder="Enter your registered email"
                  autoComplete="email"
                />

                {successMessage && <div className="success">{successMessage}</div>}
                {errors.form && <div className="error">{errors.form}</div>}

                <div className="actions">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </Button>
                </div>

                <p className="muted bottom-text">
                  Remember your password? <Link to="/login">Login here</Link>
                </p>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="login-card" onSubmit={handleResetPassword} aria-labelledby="resetPasswordTitle" noValidate>
              <div className="login-body">
                <div className="card-head">
                  <h2 id="resetPasswordTitle" className="card-title">Reset password</h2>
                  <p className="card-sub">Enter your reset code and new password.</p>
                </div>

                <InputField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  error={errors.email}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled
                />

                <InputField
                  label="Reset Code"
                  type="text"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  error={errors.token}
                  placeholder="Enter the code you received"
                  autoComplete="off"
                />

                <InputField
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  error={errors.password}
                  allowToggle
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />

                <InputField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  allowToggle
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />

                {generatedToken && (
                  <div className="info-box" style={{backgroundColor: 'var(--info-bg)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--info-color)', marginBottom: '12px'}}>
                    <strong>Your Reset Code:</strong> <code style={{display: 'block', marginTop: '4px', wordBreak: 'break-all', fontFamily: 'monospace'}}>{generatedToken}</code>
                  </div>
                )}

                {successMessage && <div className="success">{successMessage}</div>}
                {errors.form && <div className="error">{errors.form}</div>}

                <div className="actions">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>

                <p className="muted bottom-text">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setPassword('')
                      setConfirmPassword('')
                      setErrors({})
                      setSuccessMessage('')
                    }}
                    style={{background: 'none', border: 'none', color: 'var(--link-color)', cursor: 'pointer', textDecoration: 'underline'}}
                  >
                    Back to request code
                  </button>
                </p>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
