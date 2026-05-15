import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import mockApi from '../api/mockApi'
import InputField from '../components/InputField'
import Button from '../components/Button'

function splitName(fullName){
  const clean = (fullName || '').trim().replace(/\s+/g,' ')
  if(!clean) return { first:'', middle:'', last:'', suffix:'' }

  const suffixes = ['JR','SR','II','III','IV','V']
  const parts = clean.split(' ')

  let suffix = ''
  const lastPart = parts[parts.length - 1].replace('.','').toUpperCase()

  if(suffixes.includes(lastPart)){
    suffix = parts.pop()
  }

  const first = parts[0] || ''
  const last = parts.length >= 2 ? parts[parts.length - 1] : ''
  const middle = parts.length > 2 ? parts.slice(1,-1).join(' ') : ''

  return { first, middle, last, suffix }
}

export default function Profile(){

  const { user } = useAuth()

  const initial = useMemo(() => {
    const parsed = splitName(user?.name)
    const first = user?.first_name || user?.firstName || user?.fname || parsed.first
    const middle = user?.middle_name || user?.middleName || user?.middle || parsed.middle
    const last = user?.last_name || user?.lastName || user?.lname || parsed.last
    const suffix = user?.suffix || user?.suf || parsed.suffix
    return { first, middle, last, suffix }
  }, [user])

  const [first,setFirst] = useState(initial.first)
  const [middle,setMiddle] = useState(initial.middle)
  const [last,setLast] = useState(initial.last)
  const [suffix,setSuffix] = useState(initial.suffix)

  // keep fields in sync when user/context updates
  React.useEffect(() => {
    setFirst(initial.first)
    setMiddle(initial.middle)
    setLast(initial.last)
    setSuffix(initial.suffix)
  }, [initial.first, initial.middle, initial.last, initial.suffix])

  const [msg,setMsg] = useState('')
  const [saving,setSaving] = useState(false)

  const email = user?.email || user?.username || mockApi.getCurrentUser()?.email || ''

  const { updateProfile } = useAuth()

  async function save(){
    setMsg('')

    if(!first.trim() || !last.trim()){
      setMsg('First name and last name are required.')
      return
    }

    const fullName = `${first} ${middle ? middle + ' ' : ''}${last}${suffix ? ' ' + suffix : ''}`

    setSaving(true)

    try{
      const res = await updateProfile({
        name: fullName,
        first_name: first,
        middle_name: middle,
        last_name: last,
        suffix: suffix
      })

      if(!res.ok){
        setMsg(res.message || 'Failed to save.')
        setSaving(false)
        return
      }

      setMsg('Saved successfully.')
    }catch(err){
      setMsg('Network error.')
    }

    setSaving(false)
  }

  return (
    <div className="app-shell">

      <Sidebar />

      <div className="main-area">

        <Header />

        <main className="dash-main">

          <h1 className="page-title">Profile</h1>

          <section className="card">

            <div className="register-grid">

              {/* Personal Information */}
              <div className="register-col">

                <div className="register-title">Personal Information</div>

                <InputField
                  label="First Name"
                  value={first}
                  onChange={e=>setFirst(e.target.value)}
                />

                <InputField
                  label="Middle Name"
                  value={middle}
                  onChange={e=>setMiddle(e.target.value)}
                />

                <InputField
                  label="Last Name"
                  value={last}
                  onChange={e=>setLast(e.target.value)}
                />

                <InputField
                  label="Suffix"
                  value={suffix}
                  onChange={e=>setSuffix(e.target.value)}
                />

              </div>

              {/* Account Info */}
              <div className="register-col">

                <div className="register-title">Account Information</div>

                <InputField
                  label="Email"
                  value={email}
                  onChange={()=>{}}
                />

                <p className="muted">
                  Email cannot be changed.
                </p>

                {msg && (
                  <div className="error">
                    {msg}
                  </div>
                )}

                <div className="row" style={{marginTop:16,justifyContent:'flex-end'}}>
                  <Button
                    type="button"
                    onClick={save}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  )
}