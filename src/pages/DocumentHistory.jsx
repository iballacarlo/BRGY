import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../styles/history.css'
import api from '../api/axios'
import mockApi from '../api/mockApi'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import BacoorLogo from '../assets/Bacoor.png'

export default function DocumentHistory(){

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await api.get('/docs')
      if(response.data?.success){
        setData(response.data.data || [])
      } else {
        setData(mockApi.listDocs())
      }
    } catch (err) {
      setData(mockApi.listDocs())
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    window.addEventListener('focus', loadData)
    return () => window.removeEventListener('focus', loadData)
  }, [])

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

  const createDocumentPdf = async (item) => {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842])
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const logoBytes = await fetch(BacoorLogo).then(res => res.arrayBuffer())
    const logoImage = await pdfDoc.embedPng(logoBytes)
    const logoWidth = 120
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth
    page.drawImage(logoImage, {
      x: 40,
      y: height - 80,
      width: logoWidth,
      height: logoHeight,
      opacity: 0.75
    })

    const headerY = height - 60
    page.drawText('Barangay Mambog II', { x: 180, y: headerY, size: 16, font: boldFont, color: rgb(0, 0, 0) })
    page.drawText('Document Request', { x: 180, y: headerY - 22, size: 13, font: boldFont, color: rgb(0, 0, 0) })

    const labelX = 40
    let y = height - 130
    const lineHeight = 18

    const rows = [
      ['Reference', item.reference_number || item.request_id || 'N/A'],
      ['Type', item.document_type || item.type || 'N/A'],
      ['Status', item.status || 'N/A'],
      ['Requested By', item.name || item.resident_id || 'N/A'],
      ['Date Requested', item.date_requested ? new Date(item.date_requested).toLocaleDateString('en-US') : 'N/A'],
      ['Purpose', item.purpose || 'N/A']
    ]

    rows.forEach(([label, value]) => {
      page.drawText(`${label}:`, { x: labelX, y, size: 11, font: boldFont, color: rgb(0, 0, 0) })
      const lines = wrapText(value, 65)
      lines.forEach((line, index) => {
        page.drawText(line, { x: labelX + 110, y: y - (index * lineHeight), size: 11, font, color: rgb(0, 0, 0) })
      })
      y -= lineHeight * Math.max(1, lines.length)
      y -= 6
    })

    const noteY = y - 18
    page.drawText('Note: Document requests can be downloaded regardless of status.', { x: 40, y: noteY, size: 10, font, color: rgb(0.2, 0.2, 0.2) })

    return pdfDoc.save()
  }

  const handleDownload = async (item) => {
    const pdfBytes = await createDocumentPdf(item)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const filename = `${item.reference_number || item.request_id || 'document'}_${(item.document_type || item.type || 'request').replace(/\s+/g, '_')}.pdf`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

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
                        <button
                          className="table-action"
                          onClick={() => handleDownload(d)}
                          title="Download document"
                        >
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