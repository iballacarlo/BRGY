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
                        {r.date || '—'}
                      </td>

                      <td>
                        <StatusBadge status={r.status}/>
                      </td>

                      <td>
                        <button className="view-btn">
                          View
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </section>

        </main>

      </div>

    </div>
  )
} 