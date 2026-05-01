import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

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
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
