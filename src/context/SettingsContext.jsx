import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const SettingsContext = createContext()

function getSettingsKey(user){
  return `settings_${user?.id || 'guest'}`
}

export function SettingsProvider({ children }){
  const { user } = useAuth()
  const [dark, setDark] = useState(false)
  const [contrast, setContrast] = useState(false)
  const [fontSize, setFontSize] = useState('small')
  const [tts, setTts] = useState(false)
  const [screenReader, setScreenReader] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const storageKey = getSettingsKey(user)

  useEffect(() => {
    setLoaded(false)

    let saved = {}
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
    } catch {
      saved = {}
    }

    setDark(saved.dark !== undefined ? saved.dark : false)
    setContrast(saved.contrast !== undefined ? saved.contrast : false)
    setFontSize(saved.fontSize !== undefined ? saved.fontSize : 'small')
    setTts(saved.tts !== undefined ? saved.tts : false)
    setScreenReader(saved.screenReader !== undefined ? saved.screenReader : false)
    setLoaded(true)
  }, [storageKey])

  useEffect(() => {
    const root = document.documentElement

    root.dataset.theme = dark ? 'dark' : 'light'
    root.dataset.contrast = contrast ? 'high' : 'normal'

    root.classList.toggle('dark', dark)
    root.classList.toggle('high-contrast', contrast)
  }, [dark, contrast])

  useEffect(() => {
    const root = document.documentElement

    root.classList.remove(
      'font-small',
      'font-medium',
      'font-large',
      'font-xlarge'
    )

    root.classList.add(`font-${fontSize}`)
  }, [fontSize])

  useEffect(() => {
    if(tts && window.speechSynthesis){
      const msg = new SpeechSynthesisUtterance(
        'Accessibility: Text to speech enabled'
      )
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(msg)
    }
  }, [tts])

  const saveSettings = () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ dark, contrast, fontSize, tts, screenReader })
    )
  }

  const resetSettings = () => {
    setDark(false)
    setContrast(false)
    setFontSize('small')
    setTts(false)
    setScreenReader(false)
    // Save reset state to localStorage
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        dark: false,
        contrast: false,
        fontSize: 'small',
        tts: false,
        screenReader: false
      })
    )
  }

  return (
    <SettingsContext.Provider
      value={{
        dark, setDark,
        contrast, setContrast,
        fontSize, setFontSize,
        tts, setTts,
        screenReader, setScreenReader,
        saveSettings,
        resetSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(){
  return useContext(SettingsContext)
}