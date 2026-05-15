import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import './header.css'

export default function Header(){
  const { dark, setDark, contrast, setContrast } = useSettings()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef(null)
  const settingsRef = useRef(null)

  // Close dropdowns on outside click + Esc
  useEffect(() => {
    function onDown(e){
      if(menuOpen && menuRef.current && !menuRef.current.contains(e.target)){
        setMenuOpen(false)
      }
      if(settingsOpen && settingsRef.current && !settingsRef.current.contains(e.target)){
        setSettingsOpen(false)
      }
    }
    function onEsc(e){
      if(e.key === 'Escape'){
        setMenuOpen(false)
        setSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [menuOpen, settingsOpen])

  function goProfile(){
    setMenuOpen(false)
    navigate('/profile')
  }

  function doLogout(){
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  function toggleDark(){
    setDark(!dark)
    setMenuOpen(false)
    setSettingsOpen(false)
  }

  function toggleContrast(){
    setContrast(!contrast)
    setMenuOpen(false)
    setSettingsOpen(false)
  }

  // simple initials (fallback)
  const initials = (user?.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  return (
    <header className="top-header">
      <div className="top-left">
        <div className="barangay-name">Barangay Service & Complaint Management System</div>
        <div className="header-sub">
          {user?.role ? (user.role === 'admin' || user.role === 'staff' ? 'Admin' : 'Resident') : ''}
        </div>
      </div>

      <div className="top-middle" />

      <div className="top-right">
        <div className="mobile-settings-wrapper" ref={settingsRef}>
          <button
            type="button"
            className="settings-btn mobile-only"
            aria-haspopup="menu"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen(v => !v)}
            title="Display settings"
          >
            <span className="settings-gear">⚙</span>
            <span className="settings-text">Settings</span>
          </button>

          {settingsOpen && (
            <div className="settings-dropdown" role="menu" aria-label="Mobile display settings">
              <button type="button" className="settings-item" onClick={toggleDark}>
                {dark ? 'Disable dark' : 'Enable dark'}
              </button>
              <button type="button" className="settings-item" onClick={toggleContrast}>
                {contrast ? 'Disable contrast' : 'Enable contrast'}
              </button>
            </div>
          )}
        </div>

        <div className="header-controls">
          <button
            type="button"
            onClick={toggleDark}
            aria-pressed={dark}
            className="small"
          >
            {dark ? 'Dark' : 'Light'}
          </button>

          <button
            type="button"
            onClick={toggleContrast}
            aria-pressed={contrast}
            className="small"
          >
            {contrast ? 'HighC' : 'Contrast'}
          </button>
        </div>

        {/* Avatar + Dropdown */}
        <div className="avatar-wrap" ref={menuRef}>
          <button
            type="button"
            className="avatar-btn"
            onClick={() => setMenuOpen(v => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title="Account menu"
          >
            <span className="avatar-circle">{initials}</span>
          </button>

          {menuOpen && (
            <div className="avatar-menu" role="menu" aria-label="Account menu">
              <div className="avatar-menu-head">
                <div className="avatar-menu-name">{user?.name || 'User'}</div>
                <div className="avatar-menu-email">{user?.email || ''}</div>
              </div>

              <button type="button" className="avatar-item" role="menuitem" onClick={goProfile}>
                Profile
              </button>

              <button type="button" className="avatar-item danger" role="menuitem" onClick={doLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}