import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Button from '../components/Button'
import '../styles/form.css'
import { Settings, Tags, Save, RotateCcw } from 'lucide-react'

const ALL_DOCUMENT_TYPES = [
  'Barangay Clearance',
  'Certificate of Residency',
  'Certificate of Indigency'
]
const STORAGE_DOCUMENT_TYPES_KEY = 'admin_disabled_document_types'

export default function AdminSettings(){
  const [categories, setCategories] = useState(['Noise', 'Garbage', 'Traffic'])
  const [newCat, setNewCat] = useState('')
  const [systemName, setSystemName] = useState('City of Bacoor')
  const [contactEmail, setContactEmail] = useState('admin@bacoor.gov.ph')
  const [disabledDocumentTypes, setDisabledDocumentTypes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_DOCUMENT_TYPES_KEY) || '{}')
    } catch {
      return {}
    }
  })

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
    setCategories(['Noise', 'Garbage', 'Traffic'])
    setNewCat('')
    setSystemName('City of Bacoor')
    setContactEmail('admin@bacoor.gov.ph')
    setDisabledDocumentTypes({})
    localStorage.removeItem(STORAGE_DOCUMENT_TYPES_KEY)
  }

  function toggleDocumentType(type){
    setDisabledDocumentTypes(prev => {
      const next = { ...prev, [type]: !prev[type] }
      if(!next[type]) delete next[type]
      localStorage.setItem(STORAGE_DOCUMENT_TYPES_KEY, JSON.stringify(next))
      return next
    })
  }

  function save(){
    localStorage.setItem(STORAGE_DOCUMENT_TYPES_KEY, JSON.stringify(disabledDocumentTypes))
    alert('Settings saved (demo).')
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
                  These categories will appear in the complaint form.
                </div>
              </div>

              <label className="form-label">Document Visibility</label>
              <div className="form-field">
                {ALL_DOCUMENT_TYPES.map((docType) => (
                  <div
                    key={docType}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1px solid rgba(0,0,0,0.10)',
                      background: 'rgba(255,255,255,0.65)'
                    }}
                  >
                    <span>{docType}</span>
                    <Button
                      type="button"
                      variant={disabledDocumentTypes[docType] ? 'secondary' : 'primary'}
                      onClick={() => toggleDocumentType(docType)}
                    >
                      {disabledDocumentTypes[docType] ? 'Enable' : 'Disable'}
                    </Button>
                  </div>
                ))}
                <div className="helper" style={{ marginTop: 10 }}>
                  Disabled document types are hidden from resident document requests.
                </div>
              </div>
            </div>

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