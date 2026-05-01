import React, { useMemo, useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import mockApi from '../api/mockApi'
import '../styles/dashboard.css'

export default function Dashboard(){
  const [complaints, setComplaints] = useState([])
  const [docs, setDocs] = useState([])
  const user = JSON.parse(localStorage.getItem('mock_current_user') || '{}')

  const refreshData = () => {
    const allComplaints = mockApi.listComplaints()
    const allDocs = mockApi.listDocs()
    setComplaints(allComplaints.filter(c => c.userId === user.id))
    setDocs(allDocs.filter(d => d.userId === user.id))
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [user.id])


  const totalComplaints = complaints.length

  const activeComplaints = complaints.filter(c =>
    (c.status || '').toLowerCase().includes('pend')
  ).length


  const totalDocs = docs.length

  const pendingDocs = docs.filter(d =>
    (d.status || '').toLowerCase().includes('pend')
  ).length


  const stats = useMemo(()=>[
    {label:'Total Complaints', value:totalComplaints},
    {label:'Active Complaints', value:activeComplaints},
    {label:'Total Document Requests', value:totalDocs},
    {label:'Pending Requests', value:pendingDocs}
  ],[
    totalComplaints,
    activeComplaints,
    totalDocs,
    pendingDocs
  ])


  const recentActivity = useMemo(() => [...complaints,...docs]
    .sort((a,b)=> new Date(b.date) - new Date(a.date))
    .slice(0,5), [complaints, docs])


  return (
    <div className="app-shell">

      <Sidebar />

      <div className="main-area">

        <Header />

        <main className="dash-main">

          <h1 className="page-title">
            Dashboard
          </h1>


          <section className="stat-grid resident-stat-grid">

            {stats.map(s=>(
              <div key={s.label} className="stat-tile resident-stat">

                <div className="stat-label">
                  {s.label}
                </div>

                <div className="stat-value">
                  {s.value}
                </div>

              </div>
            ))}

          </section>



          <section className="dashboard-panel">

            <div className="panel-head">

              <div>

                <h2 className="panel-title">
                  Recent Activity
                </h2>

                <p className="panel-sub">
                  Your latest complaints and document requests.
                </p>

              </div>

            </div>


            <div className="dashboard-table-wrap">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>


                <tbody>

                  {recentActivity.map((r,i)=>(
                    <tr key={i}>

                      <td>
                        {r.ref || r.id}
                      </td>

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