import React from 'react'
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
    screenReader, setScreenReader
  } = useSettings()

  function reset(){
    setDark(false)
    setContrast(false)
    setFontSize('medium')
    setTts(false)
    setScreenReader(false)
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

            <div className="form-actions">
              <Button variant="secondary" onClick={reset}>
                Reset to Default
              </Button>
              <Button>
                Save
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}