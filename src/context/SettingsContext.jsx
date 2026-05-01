import React, { createContext, useContext, useEffect, useState } from 'react'

const SettingsContext = createContext()

export function SettingsProvider({ children }){
  const [dark, setDark] = useState(false)
  const [contrast, setContrast] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [tts, setTts] = useState(false)
  const [screenReader, setScreenReader] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('settings') || '{}')

    if(saved.dark !== undefined) setDark(saved.dark)
    if(saved.contrast !== undefined) setContrast(saved.contrast)
    if(saved.fontSize) setFontSize(saved.fontSize)
    if(saved.tts !== undefined) setTts(saved.tts)
    if(saved.screenReader !== undefined) setScreenReader(saved.screenReader)
  }, [])

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
    localStorage.setItem(
      'settings',
      JSON.stringify({ dark, contrast, fontSize, tts, screenReader })
    )
  }, [dark, contrast, fontSize, tts, screenReader])

  useEffect(() => {
    if(tts && window.speechSynthesis){
      const msg = new SpeechSynthesisUtterance(
        'Accessibility: Text to speech enabled'
      )
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(msg)
    }
  }, [tts])

  return (
    <SettingsContext.Provider
      value={{
        dark, setDark,
        contrast, setContrast,
        fontSize, setFontSize,
        tts, setTts,
        screenReader, setScreenReader
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(){
  return useContext(SettingsContext)
}