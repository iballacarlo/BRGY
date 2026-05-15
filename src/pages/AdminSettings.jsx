import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Button from '../components/Button'
import '../styles/form.css'
import { Settings, Tags, Save, RotateCcw, Accessibility } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import mockApi from '../api/mockApi'

const DEFAULT_CATEGORIES = ['Noise', 'Garbage', 'Traffic']
const DEFAULT_SYSTEM_NAME = 'Barangay Service & Complaint Management System'
const DEFAULT_CONTACT_EMAIL = 'brgy.mambog.ii@gmail.com'

export default function AdminSettings(){
  const {
    dark, setDark,
    contrast, setContrast,
    fontSize, setFontSize,
    tts, setTts,
    screenReader, setScreenReader,
    saveSettings,
    resetSettings
  } = useSettings()

  const [categories, setCategories] = useState([])
  const [newCat, setNewCat] = useState('')
  const [systemName, setSystemName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setCategories(mockApi.listCategories())
    const config = mockApi.getSystemSettings()
    setSystemName(config.systemName || DEFAULT_SYSTEM_NAME)
    setContactEmail(config.contactEmail || DEFAULT_CONTACT_EMAIL)
  }, [])

  useEffect(() => {
    if(!notice) return
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  function addCategory(){
    const v = newCat.trim()
    if(!v) return
    if(categories.some(c => c.toLowerCase() === v.toLowerCase())) return
    setCategories(prev => [...prev, v])
    setNewCat('')
  }

  function removeCategory(idx){
    setCategories(prev => prev.filter((_, i) => i !== idx))
  }

  function resetDefaults(){
    setCategories(DEFAULT_CATEGORIES)
    setNewCat('')
    setSystemName(DEFAULT_SYSTEM_NAME)
    setContactEmail(DEFAULT_CONTACT_EMAIL)
    resetSettings()
    mockApi.saveCategories(DEFAULT_CATEGORIES)
    mockApi.saveSystemSettings({
      systemName: DEFAULT_SYSTEM_NAME,
      contactEmail: DEFAULT_CONTACT_EMAIL
    })
    setNotice('System and accessibility settings reset to default.')
  }

  function save(){
    mockApi.saveCategories(categories)
    mockApi.saveSystemSettings({
      systemName,
      contactEmail
    })
    saveSettings()
    setNotice('System and accessibility settings saved.')
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header title="System Settings" />

        <main>
          <h1 className="page-title">System Settings</h1>

          <section className="form-card">
            <div className="form-head">
              <h2
                className="form-title"
                style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}
              >
                <Settings size={18} strokeWidth={2} />
                Configuration
              </h2>

              <p className="form-sub">
                Manage categories, system configuration, and admin-level settings.
              </p>
            </div>

            <div className="form-grid">
              <label className="form-label">System Name</label>
              <div className="form-field">
                <input
                  className="ui-input"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  placeholder="System name"
                />
                <div className="helper">Shown in headers and branding areas.</div>
              </div>

              <label className="form-label">Contact Email</label>
              <div className="form-field">
                <input
                  className="ui-input"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Contact email"
                />
                <div className="helper">Used for notifications and support.</div>
              </div>

              <label className="form-label" style={{ paddingTop: 10 }}>
                Complaint Categories
              </label>

              <div className="form-field">
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    marginBottom: 10
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      gap: 8,
                      alignItems: 'center',
                      fontWeight: 900,
                      color: 'var(--text, #111827)'
                    }}
                  >
                    <Tags size={16} strokeWidth={2} />
                    Categories
                  </div>

                  <div style={{ flex: 1 }} />
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center'
                  }}
                >
                  <input
                    className="ui-input"
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    placeholder="Add new category (e.g., Water Supply)"
                    onKeyDown={(e) => {
                      if(e.key === 'Enter'){
                        e.preventDefault()
                        addCategory()
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={addCategory}>
                    Add
                  </Button>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10
                  }}
                >
                  {categories.map((c, idx) => (
                    <div
                      key={c + idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 999,
                        fontWeight: 900,
                        border: '1px solid rgba(0,0,0,0.10)',
                        background: 'rgba(255,255,255,0.65)'
                      }}
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => removeCategory(idx)}
                        aria-label={`Remove ${c}`}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontWeight: 900,
                          opacity: 0.8
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="helper" style={{ marginTop: 10 }}>
                  These categories will appear in the complaint form across all resident devices.
                </div>
              </div>
            </div>

            <div className="form-head" style={{ marginTop: 32 }}>
              <h2
                className="form-title"
                style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}
              >
                <Accessibility size={18} strokeWidth={2} />
                Accessibility Settings
              </h2>

              <p className="form-sub">
                Control dark mode, contrast, font size, and assistive features from the same admin settings page.
              </p>
            </div>

            <div className="settings-grid">
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-title">Dark Mode</div>
                  <div className="setting-desc">Switch to darker interface colors.</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={dark}
                    onChange={(e) => setDark(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-title">High Contrast</div>
                  <div className="setting-desc">Increase contrast for better readability.</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={contrast}
                    onChange={(e) => setContrast(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-title">Text-to-Speech</div>
                  <div className="setting-desc">Enable spoken feedback.</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={tts}
                    onChange={(e) => setTts(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-title">Screen Reader Mode</div>
                  <div className="setting-desc">Optimize layout for screen readers.</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={screenReader}
                    onChange={(e) => setScreenReader(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="font-size-section">
                <div className="setting-title">Font Size</div>
                <div className="font-size-options">
                  {['small','medium','large','xlarge'].map(size => (
                    <button
                      key={size}
                      type="button"
                      className={`font-chip ${fontSize === size ? 'active' : ''}`}
                      onClick={() => setFontSize(size)}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {notice && <div className="form-notice">{notice}</div>}

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={resetDefaults}>
                <RotateCcw size={16} strokeWidth={2} />
                Reset
              </Button>

              <Button type="button" onClick={save}>
                <Save size={16} strokeWidth={2} />
                Save Changes
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}