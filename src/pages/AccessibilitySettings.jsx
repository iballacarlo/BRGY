import React, { useEffect, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useSettings } from '../context/SettingsContext'
import Button from '../components/Button'
import '../styles/form.css'

export default function AccessibilitySettings(){
  const {
    dark, setDark,
    contrast, setContrast,
    fontSize, setFontSize,
    tts, setTts,
    screenReader, setScreenReader,
    saveSettings,
    resetSettings
  } = useSettings()

  const [notice, setNotice] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if(!notice) return
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    function onEsc(e){
      if(e.key === 'Escape') setConfirmOpen(false)
    }

    if(confirmOpen){
      document.addEventListener('keydown', onEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [confirmOpen])

  function onOverlayClick(e){
    if(modalRef.current && !modalRef.current.contains(e.target)){
      setConfirmOpen(false)
    }
  }

  function handleSaveClick(){
    setConfirmAction('save')
    setConfirmOpen(true)
  }

  function handleResetClick(){
    setConfirmAction('reset')
    setConfirmOpen(true)
  }

  function handleConfirm(){
    if(confirmAction === 'save'){
      saveSettings()
      setNotice('Accessibility settings saved.')
    } else if(confirmAction === 'reset'){
      resetSettings()
      setNotice('Accessibility settings reset to default.')
    }
    setConfirmOpen(false)
    setConfirmAction(null)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header title="Accessibility Settings" />

        <main>
          <h1 className="page-title">Accessibility Settings</h1>

          <div className="form-card settings-card">
            <div className="form-head">
              <h2 className="form-title">Display & Accessibility</h2>
              <p className="form-sub">
                Customize your experience for better visibility and usability.
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
                    aria-label={dark ? 'Disable dark mode' : 'Enable dark mode'}
                    checked={dark}
                    onChange={e => setDark(e.target.checked)}
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
                    aria-label={contrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
                    checked={contrast}
                    onChange={e => setContrast(e.target.checked)}
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
                    aria-label={tts ? 'Disable text to speech' : 'Enable text to speech'}
                    checked={tts}
                    onChange={e => setTts(e.target.checked)}
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
                    aria-label={screenReader ? 'Disable screen reader mode' : 'Enable screen reader mode'}
                    checked={screenReader}
                    onChange={e => setScreenReader(e.target.checked)}
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
              <Button variant="secondary" onClick={handleResetClick}>
                Reset to Default
              </Button>
              <Button onClick={handleSaveClick}>
                Save
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={confirmAction === 'save' ? 'Save settings confirmation' : 'Reset settings confirmation'}
          onMouseDown={onOverlayClick}
        >
          <div className="modal-card" ref={modalRef}>
            <h3>
              {confirmAction === 'save' ? 'Save Settings' : 'Reset Settings'}
            </h3>
            <p>
              {confirmAction === 'save'
                ? 'Are you sure you want to save these accessibility settings?'
                : 'Are you sure you want to reset accessibility settings to default?'}
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`btn ${confirmAction === 'reset' ? 'danger' : ''}`}
                onClick={handleConfirm}
              >
                {confirmAction === 'save' ? 'Yes, Save' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}