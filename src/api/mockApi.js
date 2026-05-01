// Simple frontend-only mock API backed by localStorage

const KEY_USERS = 'mock_users'
const KEY_COMPLAINTS = 'mock_complaints'
const KEY_DOCS = 'mock_docs'

function load(key){
  return JSON.parse(localStorage.getItem(key) || '[]')
}

function save(key, data){
  localStorage.setItem(key, JSON.stringify(data))
}

function nowIso(){
  return new Date().toISOString()
}

function todayYmd(){
  return new Date().toISOString().slice(0, 10)
}

function getNextNumericId(list, field = 'numericId'){
  return (list[list.length - 1]?.[field] || 0) + 1
}

function generateComplaintRef(list){
  const year = new Date().getFullYear()
  const next = String(list.length + 1).padStart(3, '0')
  return `BRG-${year}-${next}`
}

function generateDocRef(list){
  const year = new Date().getFullYear()
  const next = String(list.length + 1).padStart(3, '0')
  return `DOC-${year}-${next}`
}

function seed(){
  if(!localStorage.getItem(KEY_USERS)){
    const users = [
      {
        id: 1,
        name: 'Admin',
        first_name: 'Admin',
        last_name: '',
        email: 'admin@gmail.com',
        password: '123',
        role: 'admin'
      },
      {
        id: 2,
        name: 'Carlo',
        first_name: 'Carlo',
        last_name: '',
        email: 'carlo@gmail.com',
        password: '123',
        role: 'resident'
      }
    ]
    save(KEY_USERS, users)
  }

  // Only initialize empty arrays if they don't exist - don't clear existing data!
  if(!localStorage.getItem(KEY_COMPLAINTS)) save(KEY_COMPLAINTS, [])
  if(!localStorage.getItem(KEY_DOCS)) save(KEY_DOCS, [])
}

seed()

function findUserByEmail(email){
  const users = load(KEY_USERS)
  return users.find(u => u.email === email)
}

const api = {
  // =========================
  // Auth
  // =========================
  register(data){
    const users = load(KEY_USERS)

    if(findUserByEmail(data.email)){
      return { success:false, message:'Email already used' }
    }

    const id = (users[users.length - 1]?.id || 0) + 1

    const first_name = data.first_name || ''
    const last_name = data.last_name || ''
    const name =
      data.name ||
      `${first_name}${last_name ? ' ' + last_name : ''}`.trim() ||
      data.email

    const user = {
      id,
      name,
      first_name,
      middle_name: data.middle_name || '',
      last_name,
      suffix: data.suffix || '',
      gender: data.gender || '',
      email: data.email,
      password: data.password,
      role: 'resident',
      created_at: nowIso()
    }

    users.push(user)
    save(KEY_USERS, users)

    const token = 'tok_' + id
    return { success:true, token, user }
  },

  login(email, password){
    const user = findUserByEmail(email)

    if(!user || user.password !== password){
      return { success:false, message:'Invalid credentials' }
    }

    const token = 'tok_' + user.id
    return { success:true, token, user }
  },

  getCurrentUser(){
    const token = localStorage.getItem('token')
    if(!token) return null

    const id = parseInt(token.split('_')[1], 10)
    const users = load(KEY_USERS)

    return users.find(u => u.id === id) || null
  },

  // =========================
  // Complaints
  // =========================
  listComplaints(){
    return load(KEY_COMPLAINTS)
  },

  listComplaintsByUser(userId){
    return load(KEY_COMPLAINTS).filter(c => c.userId === userId)
  },

  addComplaint(c){
    const list = load(KEY_COMPLAINTS)
    const currentUser = api.getCurrentUser()

    const numericId = getNextNumericId(list, 'numericId')
    const reference = generateComplaintRef(list)

    const residentName = c.resident_name || c.name || ''

    const item = {
      numericId,
      id: reference,
      ref: reference,
      complaint_id: numericId,

      userId: c.userId || currentUser?.id || null,
      resident_id: c.userId || currentUser?.id || null,
      resident_name: residentName,
      name: residentName,

      // Respondent (person being complained about) - optional
      respondent_name: c.respondent_name || '',
      respondent_contact: c.respondent_contact || '',

      category: c.category || c.category_id || '',
      category_id: c.category || c.category_id || '',
      title: c.title || '',
      description: c.description || '',
      location: c.location || '',
      anonymous: !!c.anonymous,
      notes: c.notes || '',
      images: c.images || [],

      status: c.status || 'Submitted',

      date: todayYmd(),
      created: nowIso(),
      created_at: nowIso(),
      date_submitted: nowIso()
    }

    list.unshift(item)
    save(KEY_COMPLAINTS, list)

    return item
  },

  updateComplaintStatus(id, status){
    const list = load(KEY_COMPLAINTS)
    const idx = list.findIndex(item => {
      const isEqual = v => v === id || String(v) === String(id)
      return isEqual(item.id) || isEqual(item.complaint_id) || isEqual(item.numericId)
    })

    if(idx === -1){
      return { success:false, message:'Complaint not found' }
    }

    list[idx].status = status
    list[idx].updated_at = nowIso()
    save(KEY_COMPLAINTS, list)

    return { success:true, data:list[idx] }
  },

  // =========================
  // Documents
  // =========================
  listDocs(){
    return load(KEY_DOCS)
  },

  listDocsByUser(userId){
    return load(KEY_DOCS).filter(d => d.userId === userId)
  },

  addDoc(d){
    const list = load(KEY_DOCS)
    const currentUser = api.getCurrentUser()

    const numericId = getNextNumericId(list, 'numericId')
    const reference = generateDocRef(list)

    const item = {
      numericId,
      id: reference,
      ref: reference,
      request_id: numericId,
      reference_number: reference,

      userId: d.userId || currentUser?.id || null,
      resident_id: d.userId || currentUser?.id || null,

      type: d.type || d.document_type || '',
      document_type: d.document_type || d.type || '',
      purpose: d.purpose || '',
      name: d.name || '',
      birthdate: d.birthdate || '',
      address: d.address || '',
      business_name: d.business_name || '',
      notes: d.notes || '',

      status: d.status || 'Submitted',

      date: todayYmd(),
      created: nowIso(),
      created_at: nowIso(),
      date_requested: nowIso()
    }

    list.unshift(item)
    save(KEY_DOCS, list)

    return item
  },

  updateDocStatus(id, status){
    const list = load(KEY_DOCS)
    const idx = list.findIndex(item => {
      const isEqual = v => v === id || String(v) === String(id)
      return isEqual(item.id) || isEqual(item.request_id) || isEqual(item.numericId)
    })

    if(idx === -1){
      return { success:false, message:'Document request not found' }
    }

    list[idx].status = status
    list[idx].updated_at = nowIso()
    save(KEY_DOCS, list)

    return { success:true, data:list[idx] }
  }
}

export default api