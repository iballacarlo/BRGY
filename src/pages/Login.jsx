import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/InputField'
import Button from '../components/Button'
import { useSettings } from '../context/SettingsContext'
import '../styles/login.css'
import Logo from '../assets/Bacoor.png'

export default function Login(){
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    dark, setDark,
    contrast, setContrast,
    fontSize, setFontSize
  } = useSettings()

  const [email, setEmail] = useState(() => localStorage.getItem('remember_email') || '')
  const [password, setPassword] = useState(() => localStorage.getItem('remember_password') || '')
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('remember_email') || localStorage.getItem('remember_password')))
  const [errors, setErrors] = useState({})
  const [settingsOpen, setSettingsOpen] = useState(false)

  const panelRef = useRef(null)

  const passwordAutoComplete = rememberMe ? 'current-password' : 'new-password'

  function validate(){
    const e = {}

    if(!email.trim()) e.email = 'Email is required'
    if(!password.trim()) e.password = 'Password is required'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleLogin(e){
    e.preventDefault()
    if(!validate()) return

    const res = await login(email, password, rememberMe)

    if(res.ok){
      if(rememberMe){
        localStorage.setItem('remember_email', email.trim())
        localStorage.setItem('remember_password', password)
      } else {
        localStorage.removeItem('remember_email')
        localStorage.removeItem('remember_password')
      }

      const role = res.role || (await (await fetch('/me')).json())?.role
      if(role === 'staff' || role === 'admin') navigate('/admin')
      else navigate('/dashboard')
    } else {
      setErrors({ form: res.message || 'Login failed.' })
    }
  }

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
                    aria-label={contrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
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
                    aria-label={dark ? 'Disable dark mode' : 'Enable dark mode'}
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
            <div className="info-badge">Online Barangay Services</div>

            <h2 className="info-title">
              Submit complaints and request barangay documents in one system.
            </h2>

            <p className="info-text">
              The Barangay Service &amp; Complaint Management System helps residents
              send complaints and request important barangay documents through a
              simpler, faster, and more organized online process.
            </p>

            <div className="info-points">
              <div className="info-point">
                <span className="info-dot" />
                <span>Submit complaints directly to the barangay online</span>
              </div>

              <div className="info-point">
                <span className="info-dot" />
                <span>Request needed barangay documents more easily</span>
              </div>

              <div className="info-point">
                <span className="info-dot" />
                <span>Access services through a clear and organized system</span>
              </div>
            </div>
          </aside>

          <form className="login-card" onSubmit={handleLogin} aria-labelledby="loginTitle" noValidate>
            <div className="login-body">
              <div className="card-head">
                <h2 id="loginTitle" className="card-title">Welcome</h2>
                <p className="card-sub">Sign in to continue to your account.</p>
              </div>

              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={errors.email}
                placeholder="Enter your email"
                autoComplete="username"
              />

              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={errors.password}
                allowToggle
                placeholder="Enter your password"
                autoComplete={passwordAutoComplete}
              />

              <div className="login-row">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password" className="link-muted">
                  Forgot password?
                </Link>
              </div>

              {errors.form && <div className="error">{errors.form}</div>}

              <div className="actions">
                <Button type="submit">Login</Button>
              </div>

              <p className="muted bottom-text">
                Don&apos;t have an account? <Link to="/register">Register</Link>
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}