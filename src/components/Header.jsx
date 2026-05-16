import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import mockApi from '../api/mockApi'
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

  // first-letter of first name (fallbacks to email first char or 'U')
  const firstName = user?.first_name || (user?.name || '').split(' ')[0] || ''
  const initials = firstName
    ? firstName[0].toUpperCase()
    : ((user?.email || user?.username) ? (user?.email || user?.username)[0].toUpperCase() : 'U')

  // parse name parts for avatar modal display
  function parseName(obj){
    const raw = obj?.name || ''
    const first = obj?.first_name || raw.split(' ')[0] || ''
    const middle = obj?.middle_name || (() => {
      const parts = raw.trim().split(/\s+/)
      return parts.length > 2 ? parts.slice(1, -1).join(' ') : ''
    })()
    const last = obj?.last_name || (() => {
      const parts = raw.trim().split(/\s+/)
      return parts.length > 1 ? parts[parts.length - 1] : ''
    })()
    const suffix = obj?.suffix || (() => {
      const s = raw.trim().split(' ').pop().replace('.','').toUpperCase()
      return ['JR','SR','II','III','IV','V'].includes(s) ? s : ''
    })()
    return { first, middle, last, suffix }
  }
  const profileEmail =
    user?.email ||
    user?.username ||
    user?.user_email ||
    user?.email_address ||
    mockApi.getCurrentUser()?.email ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem('mock_current_user') || '{}')?.email || ''
      } catch {
        return ''
      }
    })()

  const nameParts = parseName(user || {})
  const fullName = [nameParts.first, nameParts.middle, nameParts.last, nameParts.suffix]
    .filter(Boolean)
    .join(' ')

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
                <div className="avatar-menu-name">{fullName}</div>
                <div className="avatar-menu-email">{profileEmail}</div>
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