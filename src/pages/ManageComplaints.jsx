import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import '../styles/history.css'
import mockApi from '../api/mockApi'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export default function ManageComplaints(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedComplaint, setSelectedComplaint] = useState(null)

  async function load(){
    setLoading(true)
    setError(null)

    try{
      const data = mockApi.listComplaints()
      setItems(data || [])
    }catch(err){
      setError(err?.message || 'Failed to load')
    }

    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  const statusOptions = ['Submitted', 'Pending', 'Resolved', 'Closed']

  async function handleUpdate(id, status){
    const item = items.find(i => i.complaint_id === id)
    if(!item) return

    if(!status || status === item.status) return

    try{
      const result = mockApi.updateComplaintStatus(id, status)
      if(!result.success) throw new Error(result.message || 'Failed to update status')
      load()
    }catch(err){
      alert('Update failed: ' + (err?.message || 'Unknown error'))
    }
  }

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint)
  }

  const closeModal = () => {
    setSelectedComplaint(null)
  }

  const wrapText = (text, maxChars = 72) => {
    return String(text || '').split('\n').flatMap(line => {
      if(line.length <= maxChars) return [line]
      const words = line.split(' ')
      const lines = []
      let current = ''
      words.forEach(word => {
        if((current + ' ' + word).trim().length > maxChars){
          lines.push(current.trim())
          current = word
        } else {
          current = (current + ' ' + word).trim()
        }
      })
      if(current) lines.push(current.trim())
      return lines
    })
  }

  async function generateRespondentNoticeLetterPdf(record){
    const pdfDoc = await PDFDocument.create()
    let page = pdfDoc.addPage([620, 800])
    const { height } = page.getSize()
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let y = height - 40

    // Title
    const header = 'BARANGAY COMPLAINT NOTICE'
    page.drawText(header, {
      x: 40,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    y -= 30

    // Date
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    page.drawText(`Date: ${dateStr}`, {
      x: 40,
      y,
      size: 11,
      font: normalFont,
      color: rgb(0, 0, 0)
    })
    y -= 25

    // To: Respondent
    page.drawText('To:', {
      x: 40,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    y -= 18

    page.drawText(record.respondent_name || 'Sir/Madam', {
      x: 50,
      y,
      size: 11,
      font: normalFont,
      color: rgb(0, 0, 0)
    })
    y -= 18

    if(record.respondent_contact){
      const contactLines = wrapText(record.respondent_contact, 50)
      contactLines.forEach(line => {
        page.drawText(line, {
          x: 50,
          y,
          size: 11,
          font: normalFont,
          color: rgb(0, 0, 0)
        })
        y -= 18
      })
    }

    y -= 10

    // Salutation
    page.drawText('Dear ' + (record.respondent_name || 'Sir/Madam') + ',', {
      x: 40,
      y,
      size: 11,
      font: normalFont,
      color: rgb(0, 0, 0)
    })
    y -= 25

    // Main body text
    const bodyIntro = wrapText('This is to notify you that a formal complaint has been filed against you with our Barangay Office. Please see the details below:', 70)
    bodyIntro.forEach(line => {
      page.drawText(line, {
        x: 40,
        y,
        size: 11,
        font: normalFont,
        color: rgb(0, 0, 0)
      })
      y -= 18
    })

    y -= 8

    // Complaint Details Section
    page.drawText('COMPLAINT DETAILS:', {
      x: 40,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    y -= 18

    const details = [
      `Reference Number: ${record.ref || `C-${record.complaint_id}`}`,
      `Complainant: ${record.anonymous ? 'Anonymous' : (record.resident_name || 'Unknown')}`,
      `Category: ${record.category || record.category_id || 'General'}`,
      `Incident Location: ${record.location || 'N/A'}`,
      `Date of Incident: ${record.date_submitted ? new Date(record.date_submitted).toLocaleDateString('en-US') : 'N/A'}`,
      `Date Submitted: ${new Date().toLocaleDateString('en-US')}`
    ]

    details.forEach(detail => {
      page.drawText(detail, {
        x: 50,
        y,
        size: 10,
        font: normalFont,
        color: rgb(0, 0, 0)
      })
      y -= 16
    })

    y -= 8

    // Complaint Description
    page.drawText('NATURE OF COMPLAINT:', {
      x: 40,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    y -= 18

    const descLines = wrapText(record.description || 'No description provided.', 70)
    descLines.forEach(line => {
      page.drawText(line, {
        x: 50,
        y,
        size: 10,
        font: normalFont,
        color: rgb(0, 0, 0)
      })
      y -= 16
      if(y < 60){
        y = height - 40
        const nextPage = pdfDoc.addPage([620, 800])
        page = nextPage
      }
    })

    y -= 8

    // Barangay Notes
    if(record.notes && record.notes.trim()){
      page.drawText('BARANGAY NOTES:', {
        x: 40,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0)
      })
      y -= 18

      const noteLines = wrapText(record.notes, 70)
      noteLines.forEach(line => {
        page.drawText(line, {
          x: 50,
          y,
          size: 10,
          font: normalFont,
          color: rgb(0, 0, 0)
        })
        y -= 16
        if(y < 60){
          y = height - 40
          const nextPage = pdfDoc.addPage([620, 800])
          page = nextPage
        }
      })
      y -= 8
    }

    // Status
    page.drawText(`Current Status: ${record.status || 'Submitted'}`, {
      x: 40,
      y,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0)
    })
    y -= 25

    // Closing statement
    const closingLines = wrapText('You are requested to respond to this complaint within seven (7) days by contacting our Barangay Office. Failure to respond may result in further action by the Barangay.', 70)
    closingLines.forEach(line => {
      page.drawText(line, {
        x: 40,
        y,
        size: 10,
        font: normalFont,
        color: rgb(0, 0, 0)
      })
      y -= 16
    })

    y -= 15

    // Signature line
    page.drawText('Respectfully,', {
      x: 40,
      y,
      size: 11,
      font: normalFont,
      color: rgb(0, 0, 0)
    })
    y -= 30
    y -= 8

    page.drawText('____________________________', {
      x: 40,
      y,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0)
    })
    y -= 15

    page.drawText('Barangay Office', {
      x: 40,
      y,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0)
    })

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }

  async function generatePublicNoticePdf(record){
    const pdfDoc = await PDFDocument.create()
    let page = pdfDoc.addPage([620, 800])
    const { height } = page.getSize()
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let y = height - 40

    // Title
    const header = 'BARANGAY PUBLIC NOTICE'
    page.drawText(header, {
      x: 40,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    y -= 30

    // Date
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    page.drawText(`Date: ${dateStr}`, {
      x: 40,
      y,
      size: 11,
      font: normalFont,
      color: rgb(0, 0, 0)
    })
    y -= 25

    // Heading
    page.drawText('NOTICE TO ALL RESIDENTS', {
      x: 40,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    y -= 25

    // Body text
    const bodyLines = wrapText('The Barangay Office has received a complaint regarding the following matter. This notice is issued for public awareness and records purposes.', 70)
    bodyLines.forEach(line => {
      page.drawText(line, {
        x: 40,
        y,
        size: 11,
        font: normalFont,
        color: rgb(0, 0, 0)
      })
      y -= 18
    })

    y -= 10

    // Complaint Details
    page.drawText('COMPLAINT DETAILS:', {
      x: 40,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    y -= 18

    const details = [
      `Reference Number: ${record.ref || `C-${record.complaint_id}`}`,
      `Category: ${record.category || record.category_id || 'General'}`,
      `Location: ${record.location || 'N/A'}`,
      `Date Reported: ${record.date_submitted ? new Date(record.date_submitted).toLocaleDateString('en-US') : 'N/A'}`
    ]

    details.forEach(detail => {
      page.drawText(detail, {
        x: 50,
        y,
        size: 10,
        font: normalFont,
        color: rgb(0, 0, 0)
      })
      y -= 16
    })

    y -= 8

    // Description
    page.drawText('DESCRIPTION:', {
      x: 40,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    y -= 18

    const descLines = wrapText(record.description || 'No description provided.', 70)
    descLines.forEach(line => {
      page.drawText(line, {
        x: 50,
        y,
        size: 10,
        font: normalFont,
        color: rgb(0, 0, 0)
      })
      y -= 16
      if(y < 60){
        y = height - 40
        const nextPage = pdfDoc.addPage([620, 800])
        page = nextPage
      }
    })

    y -= 8

    // Barangay Action
    page.drawText('BARANGAY ACTION:', {
      x: 40,
      y,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0)
    })
    y -= 18

    const status = record.status || 'Under Review'
    const actionText = `Status: ${status}. The Barangay Office is ${status === 'Resolved' ? 'has completed its review of' : status === 'Closed' ? 'has closed the case regarding' : 'currently reviewing'} this matter.`
    const actionLines = wrapText(actionText, 70)
    actionLines.forEach(line => {
      page.drawText(line, {
        x: 50,
        y,
        size: 10,
        font: normalFont,
        color: rgb(0, 0, 0)
      })
      y -= 16
      if(y < 60){
        y = height - 40
        const nextPage = pdfDoc.addPage([620, 800])
        page = nextPage
      }
    })

    if(record.notes && record.notes.trim()){
      y -= 8
      page.drawText('NOTES:', {
        x: 40,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0)
      })
      y -= 18

      const noteLines = wrapText(record.notes, 70)
      noteLines.forEach(line => {
        page.drawText(line, {
          x: 50,
          y,
          size: 10,
          font: normalFont,
          color: rgb(0, 0, 0)
        })
        y -= 16
        if(y < 60){
          y = height - 40
          const nextPage = pdfDoc.addPage([620, 800])
          page = nextPage
        }
      })
    }

    y -= 15

    // Contact info
    const contactLines = wrapText('For inquiries regarding this matter, please contact the Barangay Office at your earliest convenience.', 70)
    contactLines.forEach(line => {
      page.drawText(line, {
        x: 40,
        y,
        size: 10,
        font: normalFont,
        color: rgb(0, 0, 0)
      })
      y -= 16
      if(y < 40){
        y = height - 40
        const nextPage = pdfDoc.addPage([620, 800])
        page = nextPage
      }
    })

    y -= 15

    // Signature
    page.drawText('Respectfully,', {
      x: 40,
      y,
      size: 11,
      font: normalFont,
      color: rgb(0, 0, 0)
    })
    y -= 30
    y -= 8

    page.drawText('____________________________', {
      x: 40,
      y,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0)
    })
    y -= 15

    page.drawText('Barangay Office', {
      x: 40,
      y,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0)
    })

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  }

  async function handleDownloadPdf(complaint){
    const record = complaint || selectedComplaint
    if(!record) return

    try{
      let pdfBytes
      const fileType = record.respondent_name ? 'notice' : 'public-notice'

      if(record.respondent_name){
        // Targeted complaint letter to respondent
        pdfBytes = await generateRespondentNoticeLetterPdf(record)
      } else {
        // Public notice (no specific respondent)
        pdfBytes = await generatePublicNoticePdf(record)
      }

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const fileNameText = (record.ref || `C-${record.complaint_id}`).replace(/[^a-zA-Z0-9-_]/g, '_')
      link.download = `${fileNameText}_${fileType}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch(err){
      alert('Error generating PDF: ' + (err.message || 'Unknown error'))
      console.error(err)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header />

        <main>
          <h1 className="page-title">Manage Complaints</h1>

          {error && <div className="field-error">{error}</div>}

          {loading ? (
            <div className="empty-state">Loading complaints...</div>
          ) : (
            <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Resident</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map(it => (
                    <tr key={it.complaint_id}>
                      <td>{it.complaint_id}</td>
                      <td>{it.title || it.description?.slice(0,60) || '—'}</td>
                      <td>{it.resident_name || it.name || it.resident_id || '—'}</td>
                      <td>{new Date(it.date_submitted || Date.now()).toLocaleDateString('en-US')}</td>
                      <td>
                        <StatusBadge status={it.status} />
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                          {new Date(it.date_updated || it.date_submitted || Date.now()).toLocaleDateString('en-US')}
                          <div style={{ fontSize: '0.85rem', marginTop: '4px', fontWeight: '700' }}>
                            {new Date(it.date_updated || it.date_submitted || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions-inline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select
                            className="ui-input"
                            value={it.status || 'Submitted'}
                            onChange={(e) => handleUpdate(it.complaint_id, e.target.value)}
                            style={{ height: '36px', fontSize: '0.9rem', maxWidth: '140px' }}
                          >
                            {statusOptions.map(option => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="table-action"
                            onClick={() => handleViewComplaint(it)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="table-action"
                            onClick={() => handleDownloadPdf(it)}
                          >
                            Download PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {selectedComplaint && (
              <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-card complaint-details-modal" onClick={e => e.stopPropagation()}>
                  <button className="modal-close-btn" type="button" onClick={closeModal}>
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
                    <span className="detail-label">Complaint Letter:</span>
                    <p className="detail-value description">{selectedComplaint.description || '—'}</p>
                  </div>

                  <div className="complaint-detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{selectedComplaint.location || '—'}</span>
                  </div>

                  <div className="complaint-detail-row">
                    <span className="detail-label">Submitted:</span>
                    <span className="detail-value">{selectedComplaint.date_submitted ? new Date(selectedComplaint.date_submitted).toLocaleDateString('en-US') : '—'}</span>
                  </div>

                  <div className="complaint-detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value"><StatusBadge status={selectedComplaint.status} /></span>
                  </div>

                  {selectedComplaint.notes && selectedComplaint.notes.trim() && (
                    <div className="complaint-detail-row full-width">
                      <span className="detail-label">Admin Notes:</span>
                      <p className="detail-value description">{selectedComplaint.notes}</p>
                    </div>
                  )}

                  <button className="modal-action-btn" type="button" onClick={() => handleDownloadPdf(selectedComplaint)}>
                    Download Complaint PDF
                  </button>
                  <button className="modal-action-btn" type="button" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            )}
            </>
          )}

        </main>
      </div>
    </div>
  )
}