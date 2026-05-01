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
  const menuRef = useRef(null)

  // Close dropdown on outside click + Esc
  useEffect(() => {
    function onDown(e){
      if(!menuOpen) return
      if(menuRef.current && !menuRef.current.contains(e.target)){
        setMenuOpen(false)
      }
    }
    function onEsc(e){
      if(e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [menuOpen])

  function goProfile(){
    setMenuOpen(false)
    navigate('/profile')
  }

  function doLogout(){
    setMenuOpen(false)
    logout()
    navigate('/login')
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
        <div className="barangay-name">Barangay Service & Complaint Management System
</div>
        <div className="header-sub">
          {user?.role ? (user.role === 'admin' || user.role === 'staff' ? 'Admin' : 'Resident') : ''}
        </div>
      </div>

      <div className="top-middle" />

      <div className="top-right">
        <div className="header-controls">
          <button
            type="button"
            onClick={() => setDark(!dark)}
            aria-pressed={dark}
            className="small"
          >
            {dark ? 'Dark' : 'Light'}
          </button>

          <button
            type="button"
            onClick={() => setContrast(!contrast)}
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