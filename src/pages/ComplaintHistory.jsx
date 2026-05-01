import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import '../styles/history.css'
import api from '../api/axios'
import mockApi from '../api/mockApi'

export default function ComplaintHistory(){

  const [filter, setFilter] = useState('All')
  const [q, setQ] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  useEffect(() => {
    // Always use mock API for consistent data with category field
    const mockData = mockApi.listComplaints()
    setData(mockData)
    setLoading(false)
  }, [])

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint)
  }

  const closeModal = () => {
    setSelectedComplaint(null)
  }

  const getStatusEmoji = (status) => {
    const normalized = (status || '').toLowerCase()
    if(normalized.includes('processed') || normalized.includes('resolved') || normalized.includes('approved')) return '🟢'
    if(normalized.includes('processing') || normalized.includes('in progress')) return '🟡'
    if(normalized.includes('pending') || normalized.includes('submitted')) return '⚪'
    return '⚪'
  }

  const summaryItems = data.slice(0, 3).map(item => ({
    complaint: item.title || item.category || `C-${item.complaint_id}`,
    statusText: `${item.status || 'Pending'} ${getStatusEmoji(item.status)}`
  }))

  const list = data.filter(item =>
    (filter === 'All' || item.status === filter) &&
    (q === '' ||
      item.complaint_id?.toString().includes(q) ||
      item.title?.toLowerCase().includes(q.toLowerCase())
    )
  )

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header title="Complaint History" />

        <main>
          <h1 className="page-title">Complaint History</h1>

          <div className="history-card">

            <div className="history-controls">
              <div className="filter-group">
                <select
                  className="ui-input"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>Resolved</option>
                  <option>Pending</option>
                </select>

                <input
                  className="ui-input"
                  placeholder="Search by Ref or Title"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="empty-state">Loading complaints...</div>
            ) : list.length === 0 ? (
              <div className="empty-state">No complaints found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Resident</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(r => (
                    <tr key={r.complaint_id}>
                      <td>{r.ref || `C-${r.complaint_id}`}</td>
                      <td>{r.resident_name || r.name || r.resident_id || '—'}</td>
                      <td>{r.category || r.category_id || '—'}</td>
                      <td>{r.date_submitted ? new Date(r.date_submitted).toLocaleDateString('en-US') : '—'}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        <button 
                          className="table-action"
                          onClick={() => handleViewComplaint(r)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>

          {/* COMPLAINT DETAILS MODAL */}
          {selectedComplaint && (
            <div
              className="modal-overlay"
              onClick={closeModal}
            >
              <div className="modal-card complaint-details-modal" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="modal-close-btn"
                  onClick={closeModal}
                  type="button"
                >
                  ✕
                </button>

                <h2 className="modal-title">Complaint Details</h2>

                <div className="complaint-detail-row">
                  <span className="detail-label">Reference:</span>
                  <span className="detail-value">{selectedComplaint.ref || `C-${selectedComplaint.complaint_id}`}</span>
                </div>

                <div className="complaint-detail-row">
                  <span className="detail-label">Resident:</span>
                  <span className="detail-value">{selectedComplaint.resident_name || selectedComplaint.name || selectedComplaint.resident_id || '—'}</span>
                </div>

                <div className="complaint-detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedComplaint.category || selectedComplaint.category_id || '—'}</span>
                </div>

                <div className="complaint-detail-row">
                  <span className="detail-label">Title:</span>
                  <span className="detail-value">{selectedComplaint.title || '—'}</span>
                </div>

                <div className="complaint-detail-row full-width">
                  <span className="detail-label">Description:</span>
                  <p className="detail-value description">{selectedComplaint.description || '—'}</p>
                </div>

                <div className="complaint-detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{selectedComplaint.location || '—'}</span>
                </div>

                <div className="complaint-detail-row">
                  <span className="detail-label">Date Submitted:</span>
                  <span className="detail-value">{selectedComplaint.date_submitted ? new Date(selectedComplaint.date_submitted).toLocaleDateString('en-US') : '—'}</span>
                </div>

                <div className="complaint-detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value"><StatusBadge status={selectedComplaint.status} /></span>
                </div>

                {selectedComplaint.notes && selectedComplaint.notes.trim() && (
                  <div className="complaint-detail-row full-width">
                    <span className="detail-label">Notes:</span>
                    <p className="detail-value description">{selectedComplaint.notes}</p>
                  </div>
                )}

                {selectedComplaint.anonymous && (
                  <div className="complaint-detail-row">
                    <span className="detail-label">Anonymous:</span>
                    <span className="detail-value">Yes</span>
                  </div>
                )}

                <button 
                  className="modal-action-btn"
                  onClick={closeModal}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}