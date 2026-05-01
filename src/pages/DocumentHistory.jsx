import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../styles/history.css'
import api from '../api/axios'
import mockApi from '../api/mockApi'

export default function DocumentHistory(){

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Always use mock API for consistent data
    const mockData = mockApi.listDocs()
    setData(mockData)
    setLoading(false)
  }, [])

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header title="Document History" />

        <main>
          <h1 className="page-title">Document History</h1>

          <div className="history-card">

            {loading ? (
              <div className="empty-state">Loading documents...</div>
            ) : data.length === 0 ? (
              <div className="empty-state">No document requests found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Resident</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(d => (
                    <tr key={d.request_id}>
                      <td>{d.reference_number}</td>
                      <td>{d.name || d.resident_id || '—'}</td>
                      <td>{d.document_type}</td>
                      <td>{new Date(d.date_requested).toLocaleDateString('en-US')}</td>
                      <td>{d.status}</td>
                      <td>
                        <button className="table-action">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}