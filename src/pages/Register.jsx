import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/InputField'
import Button from '../components/Button'
import { useSettings } from '../context/SettingsContext'
import '../styles/login.css'
import Logo from '../assets/Bacoor.png'
import { addressData } from '../data/addressData'

export default function Register(){
  const { register } = useAuth()
  const navigate = useNavigate()

  const {
    dark, setDark,
    contrast, setContrast,
    fontSize, setFontSize
  } = useSettings()

  const [form, setForm] = useState({
    first: '',
    middle: '',
    last: '',
    suffix: '',
    gender: '',
    phase: '',
    street: '',
    block: '',
    lot: '',
    email: '',
    password: '',
    confirm: '',
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [err, setErr] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const panelRef = useRef(null)

  function setField(key, value){
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const stepLabels = ['Personal', 'Address', 'Account']

  function isStepValid(step){
    if(step === 0){
      return form.first.trim() && form.last.trim() && form.gender.trim()
    }

    if(step === 1){
      return form.phase.trim() && form.street.trim() && form.block.trim() && form.lot.trim()
    }

    if(step === 2){
      return form.email.trim() && form.password.length >= 6 && form.password === form.confirm
    }

    return false
  }

  function validateStep(step){
    if(step === 0){
      if(!isStepValid(0)){
        setErr('Please complete all personal information before continuing.')
        return false
      }
    }

    if(step === 1){
      if(!isStepValid(1)){
        setErr('Please complete all address information before continuing.')
        return false
      }
    }

    if(step === 2){
      if(!form.email.trim()){
        setErr('Email is required.')
        return false
      }

      if(form.password.length < 6){
        setErr('Password must be at least 6 characters.')
        return false
      }

      if(form.password !== form.confirm){
        setErr('Passwords do not match.')
        return false
      }
    }

    setErr('')
    return true
  }

  function canGoToStep(index){
    if(index <= currentStep) return true
    for(let i = 0; i < index; i++){
      if(!isStepValid(i)) return false
    }
    return true
  }

  const passwordsMatch =
    form.password.length > 0 &&
    form.confirm.length > 0 &&
    form.password === form.confirm

  const passwordsMismatch =
    form.password.length > 0 &&
    form.confirm.length > 0 &&
    form.password !== form.confirm

  async function handle(e){
    e.preventDefault()
    setErr('')

    if(!validateStep(0) || !validateStep(1) || !validateStep(2)){
      return
    }

    const fullName =
      `${form.first} ${form.middle ? form.middle + ' ' : ''}${form.last}${form.suffix ? ' ' + form.suffix : ''}`.trim()

    const res = await register({
      first_name: form.first,
      middle_name: form.middle,
      last_name: form.last,
      suffix: form.suffix,
      gender: form.gender,
      email: form.email,
      password: form.password,
      address: `${form.phase}, ${form.street}, Block ${form.block}, Lot ${form.lot}`
    })

    if(res.ok) navigate('/dashboard')
    else setErr(res.message || 'Registration failed.')
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
    <div className="login-shell register-shell">
      <header className="login-topbar">
        <div className="topbar-left">
          <div className="topbar-brand">
            <img
              src={Logo}
              alt="City of Bacoor logo"
              className="topbar-logo"
            />

            <div className="brand-copy">
              <div className="brand-kicker">Municipality</div>
              <div className="brand-name">City of Bacoor</div>
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
        <form className="login-card register-card" onSubmit={handle} noValidate>
          <div className="login-body">
            <div className="card-head">
              <h2 className="card-title">Create Account</h2>
              <p className="card-sub">Fill out your details to create your resident account.</p>
            </div>

            <div className="register-steps" aria-label="Registration steps">
              {stepLabels.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={`step-item ${currentStep === index ? 'step-active' : ''}`}
                  onClick={() => canGoToStep(index) && setCurrentStep(index)}
                  disabled={!canGoToStep(index)}
                >
                  <span className="step-count">{index + 1}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="register-grid">
              {currentStep === 0 && (
                <div className="register-col">
                  <div className="register-title">
                    <span className="step-pill">1</span>
                    Personal Information
                  </div>

                  <InputField
                    label="First Name *"
                    value={form.first}
                    onChange={e => setField('first', e.target.value)}
                    placeholder="Juan"
                    autoComplete="given-name"
                  />

                  <InputField
                    label="Middle Name"
                    value={form.middle}
                    onChange={e => setField('middle', e.target.value)}
                    placeholder="Optional"
                    autoComplete="additional-name"
                  />

                  <InputField
                    label="Last Name *"
                    value={form.last}
                    onChange={e => setField('last', e.target.value)}
                    placeholder="Dela Cruz"
                    autoComplete="family-name"
                  />

                  <InputField
                    label="Suffix"
                    value={form.suffix}
                    onChange={e => setField('suffix', e.target.value)}
                    placeholder="Optional"
                    autoComplete="honorific-suffix"
                  />

                  <div className="form-group">
                    <label className="field-label">Gender *</label>
                    <select
                      className="field-input"
                      value={form.gender}
                      onChange={e => setField('gender', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {err && <div className="error">{err}</div>}

                  <div className="register-actions step-actions">
                    <Button
                      type="button"
                      onClick={() => {
                        if(validateStep(0)) setCurrentStep(1)
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="register-col">
                  <div className="register-title">
                    <span className="step-pill">2</span>
                    Address Information
                  </div>

                  <div className="form-group">
                    <label className="field-label">Phase *</label>
                    <select
                      className="field-input"
                      value={form.phase}
                      onChange={e => {
                        setField('phase', e.target.value)
                        setField('street', '') // Reset street when phase changes
                      }}
                    >
                      <option value="">Select Phase</option>
                      {Object.keys(addressData).map(phase => (
                        <option key={phase} value={phase}>{phase}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="field-label">Street *</label>
                    <select
                      className="field-input"
                      value={form.street}
                      onChange={e => setField('street', e.target.value)}
                      disabled={!form.phase}
                    >
                      <option value="">Select Street</option>
                      {form.phase && addressData[form.phase].map(street => (
                        <option key={street} value={street}>{street}</option>
                      ))}
                    </select>
                  </div>

                  <InputField
                    label="Block *"
                    value={form.block}
                    onChange={e => setField('block', e.target.value)}
                    placeholder="Block number"
                  />

                  <InputField
                    label="Lot *"
                    value={form.lot}
                    onChange={e => setField('lot', e.target.value)}
                    placeholder="Lot number"
                  />

                  {err && <div className="error">{err}</div>}

                  <div className="register-actions step-actions">
                    <Button type="button" variant="secondary" onClick={() => setCurrentStep(0)}>
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if(validateStep(1)) setCurrentStep(2)
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="register-col">
                  <div className="register-title">
                    <span className="step-pill">3</span>
                    Account Details
                  </div>

                  <InputField
                    label="Email *"
                    type="email"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                  />

                  <InputField
                    label="Password *"
                    type="password"
                    allowToggle
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />

                  <div className="pw-hint">Use at least <strong>6 characters</strong>.</div>

                  <InputField
                    label="Confirm Password *"
                    type="password"
                    allowToggle
                    value={form.confirm}
                    onChange={e => setField('confirm', e.target.value)}
                    placeholder="Re-type password"
                    autoComplete="new-password"
                  />

                  {passwordsMatch && <div className="pw-ok">✅ Passwords match</div>}
                  {passwordsMismatch && <div className="pw-bad">⚠️ Passwords do not match</div>}

                  {err && <div className="error">{err}</div>}

                  <div className="register-actions step-actions">
                    <Button type="button" variant="secondary" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button type="submit">Register</Button>
                  </div>
                </div>
              )}
            </div>
            <p className="muted bottom-text" style={{ marginTop: 18 }}>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}