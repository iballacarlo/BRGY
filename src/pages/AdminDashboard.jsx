import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import mockApi from '../api/mockApi'
import StatusBadge from '../components/StatusBadge'
import '../styles/dashboard.css'

import {
  Users,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  BadgeCheck,
  PackageCheck,
  Search
} from 'lucide-react'

export default function AdminDashboard(){

  const complaints = mockApi.listComplaints()
  const docs = mockApi.listDocs()
  const users = JSON.parse(localStorage.getItem('mock_users') || '[]')

  const [q,setQ] = useState('')
  const [selectedActivity, setSelectedActivity] = useState(null)

  const totalResidents = users.length
  const totalComplaints = complaints.length

  const pendingComplaints = complaints.filter(c =>
    (c.status||'').toLowerCase().includes('pend')
  ).length

  const resolvedComplaints = complaints.filter(c =>
    (c.status||'').toLowerCase().includes('resolv')
  ).length

  const totalDocs = docs.length

  const pendingDocs = docs.filter(d =>
    (d.status||'').toLowerCase().includes('pend')
  ).length

  const approvedDocs = docs.filter(d =>
    (d.status||'').toLowerCase().includes('approved')
  ).length

  const releasedDocs = docs.filter(d =>
    (d.status||'').toLowerCase().includes('released')
  ).length


  const stats = useMemo(()=>[
    {label:'Residents',value:totalResidents,icon:<Users size={18}/>},
    {label:'Complaints',value:totalComplaints,icon:<ClipboardList size={18}/>},
    {label:'Pending Complaints',value:pendingComplaints,icon:<AlertCircle size={18}/>},
    {label:'Resolved Complaints',value:resolvedComplaints,icon:<CheckCircle2 size={18}/>},
    {label:'Document Requests',value:totalDocs,icon:<FileText size={18}/>},
    {label:'Pending Requests',value:pendingDocs,icon:<Clock size={18}/>},
    {label:'Approved Requests',value:approvedDocs,icon:<BadgeCheck size={18}/>},
    {label:'Released Documents',value:releasedDocs,icon:<PackageCheck size={18}/>},
  ],[
    totalResidents,
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    totalDocs,
    pendingDocs,
    approvedDocs,
    releasedDocs
  ])

  const getStatusEmoji = (status) => {
    const normalized = (status || '').toLowerCase()
    if(normalized.includes('processed') || normalized.includes('resolved') || normalized.includes('approved')) return '🟢'
    if(normalized.includes('processing') || normalized.includes('in progress')) return '🟡'
    if(normalized.includes('pending') || normalized.includes('submitted')) return '⚪'
    return '⚪'
  }

  const userHistory = complaints.slice(0, 3).map(c => ({
    complaint: c.title || c.category || `C-${c.complaint_id}`,
    statusText: `${c.status || 'Pending'} ${getStatusEmoji(c.status)}`
  }))

  const recentActivity = [...complaints,...docs]
    .sort((a,b)=> new Date(b.date) - new Date(a.date))
    .slice(0,5)

  const closeModal = () => setSelectedActivity(null)

  const getActivityDate = (item) => {
    if(item.date) return new Date(item.date).toLocaleDateString('en-US')
    if(item.date_requested) return new Date(item.date_requested).toLocaleDateString('en-US')
    return '—'
  }

  return (
    <div className="app-shell">

      <Sidebar/>

      <div className="main-area admin-area">

        <Header/>

        <main className="dash-main">

          <div className="dash-head">

            <h1 className="page-title">
              Admin Dashboard
            </h1>

            <div className="dash-search">

              <Search size={18}/>

              <input
                placeholder="Search complaints, requests, residents..."
                value={q}
                onChange={(e)=>setQ(e.target.value)}
              />

              <button className="dash-search-btn">
                Search
              </button>

            </div>

          </div>


          {/* STAT CARDS */}

          <section className="stat-grid">

            {stats.map(s=>(
              <div key={s.label} className="stat-tile">

                <div className="stat-top">

                  <div className="stat-icon">
                    {s.icon}
                  </div>

                  <div className="stat-label">
                    {s.label}
                  </div>

                </div>

                <div className="stat-value">
                  {s.value}
                </div>

              </div>
            ))}

          </section>
          
          {/* RECENT ACTIVITY */}

          <section className="dashboard-panel">

            <div className="panel-head">

              <h2 className="panel-title">
                Recent Activity
              </h2>

              <p className="panel-sub">
                Latest complaints and document requests.
              </p>

            </div>


            <div className="dashboard-table-wrap">

              <table className="dashboard-table">

                <thead>

                  <tr>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>

                </thead>


                <tbody>

                  {recentActivity.map((r,i)=>(
                    <tr key={i}>

                      <td>{r.ref || r.id}</td>

                      <td>
                        {r.category || r.type || 'Request'}
                      </td>

                      <td>
                        {r.date ? new Date(r.date).toLocaleDateString('en-US') : '—'}
                      </td>

                      <td>
                        <StatusBadge status={r.status}/>
                      </td>

                      <td>
                        <button className="view-btn" onClick={() => setSelectedActivity(r)}>
                          View
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </section>

          {selectedActivity && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" type="button" onClick={closeModal}>
                  ✕
                </button>
                <h2 className="modal-title">View Activity</h2>
                <div className="form-card">
                  <div className="form-field">
                    <label className="form-label">Reference</label>
                    <div>{selectedActivity.reference_number || selectedActivity.id || selectedActivity.complaint_id || '—'}</div>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Type</label>
                    <div>{selectedActivity.document_type || selectedActivity.type || selectedActivity.category || 'Request'}</div>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Status</label>
                    <div>{selectedActivity.status || '—'}</div>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Date</label>
                    <div>{getActivityDate(selectedActivity)}</div>
                  </div>
                  {selectedActivity.name && (
                    <div className="form-field">
                      <label className="form-label">Resident</label>
                      <div>{selectedActivity.name}</div>
                    </div>
                  )}
                  {selectedActivity.purpose && (
                    <div className="form-field">
                      <label className="form-label">Purpose</label>
                      <div>{selectedActivity.purpose}</div>
                    </div>
                  )}
                  {selectedActivity.title && (
                    <div className="form-field">
                      <label className="form-label">Title</label>
                      <div>{selectedActivity.title}</div>
                    </div>
                  )}
                  {selectedActivity.description && (
                    <div className="form-field">
                      <label className="form-label">Description</label>
                      <div>{selectedActivity.description}</div>
                    </div>
                  )}
                  {selectedActivity.address && (
                    <div className="form-field">
                      <label className="form-label">Address</label>
                      <div>{selectedActivity.address}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  )
} 