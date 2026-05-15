import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'
import mockApi from '../api/mockApi'

const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(token){
      api.get('/me').then(res=>{
        if(res.data && res.data.success){
          setUser(res.data.user)
        } else {
          localStorage.removeItem('token')
        }
        setLoading(false)
      }).catch(()=>{
        localStorage.removeItem('token')
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  },[])

  async function login(email, password){
    try{
      const res = await api.post('/login', { email, password })
      if(res.data && res.data.success){
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        return { ok:true, role: res.data.user?.role }
      }
      return { ok:false, message: res.data.message || 'Login failed' }
    }catch(err){
      // Axios "Network Error" means the request never reached the backend
      if(err.message === 'Network Error'){
        return { ok:false, message: 'Unable to contact backend API. Make sure the PHP server is running and the URL is correct.' }
      }
      return { ok:false, message: err?.response?.data?.message || err.message }
    }
  }

  async function register(data){
    try{
      const res = await api.post('/register', data)
      if(res.data && res.data.success){
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        return { ok:true }
      }
      return { ok:false, message: res.data.message || 'Register failed' }
    }catch(err){
      if(err.message === 'Network Error'){
        return { ok:false, message: 'Unable to contact backend API. Make sure the PHP server is running and the URL is correct.' }
      }
      return { ok:false, message: err?.response?.data?.message || err.message }
    }
  }

  function logout(){
    if(user?.id){
      const currentKey = `settings_${user.id}`
      const guestKey = 'settings_guest'
      const saved = localStorage.getItem(currentKey)
      if(saved){
        localStorage.setItem(guestKey, saved)
      }
    }
    localStorage.removeItem('token')
    setUser(null)
  }

  async function updateProfile(data){
    // data: { name, first_name, middle_name, last_name, suffix }
    // Try backend first (existing app used /profile_update.php)
    try{
      const res = await fetch('/profile_update.php',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({ name: data.name })
      })

      if(res.ok){
        try{
          const json = await res.json()
          if(json && json.success && json.user){
            setUser(json.user)
            return { ok:true }
          }
        }catch{}
        // If backend returned non-JSON or no user, still update local state
        const merged = { ...user, ...data }
        setUser(merged)
        return { ok:true }
      }
    }catch(e){
      // network error -> fallback to mock
    }

    // Fallback to mock API (localStorage)
    if(user?.id){
      const updated = mockApi.updateUser(user.id, {
        name: data.name,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        suffix: data.suffix
      })
      if(updated){
        setUser(updated)
        return { ok:true }
      }
    }

    return { ok:false, message: 'Failed to update profile' }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
