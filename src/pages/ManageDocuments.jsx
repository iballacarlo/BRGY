import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import '../styles/history.css'
import '../styles/form.css'
import api from '../api/axios'
import mockApi from '../api/mockApi'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import BacoorLogo from '../assets/Bacoor.png'

const REQUEST_DOC_TYPES = [
  'Barangay Clearance',
  'Business Permit',
  'Residency Certificate',
  'Certificate of Indigency'
]

export default function ManageDocuments(){

  const [items,setItems] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [requestType, setRequestType] = useState('Barangay Clearance')
  const [documentStatuses, setDocumentStatuses] = useState([
    { name: 'Barangay Clearance', status: 'Active' },
    { name: 'Business Permit', status: 'Active' },
    { name: 'Residency Certificate', status: 'Disabled' }
  ])
  const [processingRequest, setProcessingRequest] = useState(null)
  const [modalMode, setModalMode] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [documentFields, setDocumentFields] = useState({
    document_type: 'Barangay Clearance',
    name: '',
    birthdate: '',
    address: '',
    purpose: '',
    business_name: '',
    notes: '',
    province: '',
    barangay: ''
  })

  const toggleDocumentStatus = (idx) => {
    setDocumentStatuses(prev => prev.map((doc, i) =>
      i === idx
        ? { ...doc, status: doc.status === 'Active' ? 'Disabled' : 'Active' }
        : doc
    ))
  }

  const openAddRequest = () => {
    setModalMode('add')
    setProcessingRequest(null)
    setDocumentFields({
      document_type: requestType,
      name: '',
      birthdate: '',
      address: '',
      purpose: '',
      business_name: '',
      notes: '',
      province: 'Cavite',
      barangay: 'Mambog II',
      status: 'Submitted'
    })
    setFormErrors({})
  }

  const openEditRequest = (item) => {
    setModalMode('edit')
    setProcessingRequest(item)
    setDocumentFields(buildDocumentFields(item))
    setFormErrors({})
  }

  const handleDeleteRequest = async (item) => {
    if(!item) return
    const shouldDelete = window.confirm('Delete this document request?')
    if(!shouldDelete) return

    mockApi.deleteDoc(item.request_id)
    try {
      await api.delete(`/docs/${item.request_id}`)
    } catch {
      // ignore backend failures for mock storage
    }
    load()
  }

  const validateDocumentForm = () => {
    const errors = {}
    if(!documentFields.document_type) errors.document_type = 'Document type is required'
    if(!documentFields.name?.trim()) errors.name = 'Name is required'
    if(!documentFields.address?.trim()) errors.address = 'Address is required'
    if(!documentFields.purpose?.trim()) errors.purpose = 'Purpose is required'
    if(documentFields.document_type === 'Business Permit' && !documentFields.business_name?.trim()) {
      errors.business_name = 'Business name is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveRequest = async () => {
    if(!validateDocumentForm()) return

    const payload = {
      document_type: documentFields.document_type,
      type: documentFields.document_type,
      name: documentFields.name,
      birthdate: documentFields.birthdate,
      address: documentFields.address,
      purpose: documentFields.purpose,
      business_name: documentFields.business_name,
      notes: documentFields.notes,
      status: documentFields.status || 'Submitted'
    }

    try {
      if(modalMode === 'add'){
        mockApi.addDoc(payload)
        await api.post('/docs', {
          document_type: payload.document_type,
          purpose: payload.purpose,
          name: payload.name,
          birthdate: payload.birthdate,
          address: payload.address,
          business_name: payload.business_name
        }).catch(() => {})
        load()
        alert('Document request added.')
      } else if(modalMode === 'edit' && processingRequest){
        mockApi.updateDoc(processingRequest.request_id, payload)
        try {
          await api.put(`/docs/${processingRequest.request_id}`, { status: payload.status })
        } catch {
          // backend edit not supported beyond status update
        }
        load()
        alert('Document request updated.')
      }
    } catch(err){
      alert('Failed to save request: ' + (err?.message || 'Unknown error'))
    }

    closeProcessingModal()
  }

  async function load(){
    setLoading(true)

    try{
      const response = await api.get('/docs')
      if(response.data?.success){
        setItems(response.data.data || [])
      } else {
        setItems(mockApi.listDocs() || [])
      }
    }catch(err){
      setItems(mockApi.listDocs() || [])
    }

    setLoading(false)
  }

  async function submitRequest(){
    try{
      mockApi.addDoc({
        type: requestType,
        document_type: requestType,
        purpose: `Request for ${requestType}`
      })
      await api.post('/docs', {
        document_type: requestType,
        purpose: `Request for ${requestType}`
      }).catch(() => {})

      load()
      alert(`${requestType} request submitted`)
    }catch(err){
      alert('Error submitting request: ' + (err?.message || 'Unknown error'))
    }
  }

  useEffect(()=>{ load() }, [])

  async function handleUpdate(id){
    const item = items.find(i=>i.request_id===id)
    if(!item) return

    const status = prompt(
      'Set status (Submitted, Pending, Approved, Released):',
      item.status || 'Submitted'
    )

    if(status==null) return

    try{
      await api.put(`/docs/${id}`,{ status })
      load()
    }catch(err){
      alert('Update failed: '+(err?.response?.data?.message || err.message))
    }
  }

  const getTemplateForType = (value) => {
    const normalized = String(value || '').toLowerCase()
    if(normalized.includes('clearance')) return 'Barangay Clearance'
    if(normalized.includes('residency') || normalized.includes('residence')) return 'Certificate of Residency'
    if(normalized.includes('indigency')) return 'Certificate of Indigency'
    if(normalized.includes('business')) return 'Business Permit'
    return 'Barangay Clearance'
  }

  const getTemplateFields = (template) => {
    switch(template){
      case 'Certificate of Residency':
        return [
          { name: 'name', label: 'Full Name', type: 'text' },
          { name: 'birthdate', label: 'Birthdate', type: 'date' },
          { name: 'address', label: 'Address', type: 'text' },
          { name: 'purpose', label: 'Purpose', type: 'text' }
        ]
      case 'Certificate of Indigency':
        return [
          { name: 'name', label: 'Full Name', type: 'text' },
          { name: 'address', label: 'Address', type: 'text' },
          { name: 'purpose', label: 'Reason for Indigency', type: 'text' }
        ]
      case 'Business Permit':
        return [
          { name: 'name', label: 'Owner Name', type: 'text' },
          { name: 'business_name', label: 'Business Name', type: 'text' },
          { name: 'address', label: 'Business Address', type: 'text' },
          { name: 'purpose', label: 'Purpose', type: 'text' }
        ]
      default:
        return [
          { name: 'name', label: 'Full Name', type: 'text' },
          { name: 'birthdate', label: 'Birthdate', type: 'date' },
          { name: 'address', label: 'Address', type: 'text' },
          { name: 'purpose', label: 'Purpose', type: 'text' }
        ]
    }
  }

  const buildDocumentFields = (item) => ({
    document_type: item.document_type || item.type || requestType || 'Barangay Clearance',
    name: item.name || item.resident_name || item.requester_name || '',
    birthdate: item.birthdate || '',
    address: item.address || item.business_address || '',
    purpose: item.purpose || `Request for ${item.document_type || item.type || ''}`,
    business_name: item.business_name || item.document_name || '',
    notes: item.notes || '',
    province: 'Cavite',
    barangay: 'Mambog II',
    status: item.status || 'Submitted'
  })

  const handleProcessRequest = (item) => {
    setModalMode('process')
    setProcessingRequest(item)
    setDocumentFields(buildDocumentFields(item))
  }

  const handleFieldChange = (field, value) => {
    setDocumentFields(prev => ({ ...prev, [field]: value }))
  }

  const closeProcessingModal = () => {
    setProcessingRequest(null)
    setModalMode(null)
    setFormErrors({})
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

  const createDocumentPdf = async (item, fields) => {
    const template = getTemplateForType(item.document_type || item.type)
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842])
    const { width, height } = page.getSize()
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const issuedDate = new Date().toLocaleDateString('en-US')

    const logoBytes = await fetch(BacoorLogo).then((res) => res.arrayBuffer())
    const logoImage = await pdfDoc.embedPng(logoBytes)

    const cardX = 48
    const cardY = 80
    const cardWidth = width - cardX * 2
    const cardHeight = height - cardY * 2

    const paragraphs = [
      template === 'Barangay Clearance' ? [
        `This is to certify that ${fields.name || '[Name]'} of legal age, ${fields.address ? `a resident of ${fields.address}` : '[Address]'}, and a bonafide resident of this barangay.`,
        `This certification is issued upon the request of the above-named person for ${fields.purpose || 'official purposes'}.`
      ] : null,
      template === 'Certificate of Residency' ? [
        `This is to certify that ${fields.name || '[Name]'} is a bonafide resident of ${fields.address || '[Address]'}, Barangay Mambog II, Cavite.`,
        `This certificate is issued for the purpose of ${fields.purpose || 'official use'}.`
      ] : null,
      template === 'Certificate of Indigency' ? [
        `This is to certify that ${fields.name || '[Name]'} is a bonafide resident of ${fields.address || '[Address]'}, Barangay Mambog II, Cavite, and is considered indigent.`,
        `This certificate is issued for the purpose of ${fields.purpose || 'supporting indigency assistance'}.`
      ] : null,
      template === 'Business Permit' ? [
        `This is to certify that ${fields.business_name || '[Business Name]'}, owned and operated by ${fields.name || '[Owner Name]'}, is located at ${fields.address || '[Business Address]'}, Barangay Mambog II, Cavite.`,
        `This certificate is issued for the purpose of ${fields.purpose || 'business operation'}.`
      ] : null
    ].filter(Boolean).flat()

    const cardInnerLeft = cardX + 24
    const cardInnerRight = cardX + cardWidth - 24
    let y = height - 120

    const drawCentered = (text, size, font, y) => {
      const textWidth = font.widthOfTextAtSize(text, size)
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y,
        size,
        font,
        color: rgb(0, 0, 0)
      })
    }

    const drawCenteredBlock = (text, y, size = 12, font = normalFont, lineHeight = 18, maxWidth = cardWidth - 48) => {
      const lines = wrapText(text, Math.floor((maxWidth / size) * 1.5))
      lines.forEach(line => {
        const lineWidth = font.widthOfTextAtSize(line, size)
        page.drawText(line, {
          x: (width - lineWidth) / 2,
          y,
          size,
          font,
          color: rgb(0, 0, 0)
        })
        y -= lineHeight
      })
      return y
    }

    drawCentered('Republic of the Philippines', 16, boldFont, y)
    y -= 26
    drawCentered('Province of Cavite', 15, boldFont, y)
    y -= 24
    drawCentered('Barangay Mambog II', 15, boldFont, y)
    y -= 60

    const titleY = y
    drawCentered(template, 18, titleFont, titleY)

    const logoWidth = 560
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth
    const logoX = (width - logoWidth) / 2
    const logoY = (height / 2) - (logoHeight / 2) + 20
    page.drawImage(logoImage, {
      x: logoX,
      y: logoY,
      width: logoWidth,
      height: logoHeight,
      opacity: 0.2
    })

    let bodyY = titleY - 72
    paragraphs.forEach(paragraph => {
      bodyY = drawCenteredBlock(paragraph, bodyY, 18, normalFont, 24, cardWidth - 96)
      bodyY -= 24
    })

    const issuedY = bodyY - 18
    drawCentered(`Date Issued: ${issuedDate}`, 14, normalFont, issuedY)

    const signatureY = issuedY - 56
    drawCentered('_________________________', 14, normalFont, signatureY)
    drawCentered('Barangay Captain', 14, normalFont, signatureY - 28)

    return pdfDoc.save()
  }

  const handleDownloadPdf = async () => {
    if(!processingRequest) return
    const pdfBytes = await createDocumentPdf(processingRequest, documentFields)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const name = (processingRequest.reference_number || processingRequest.request_id || 'document').toString().replace(/[^a-zA-Z0-9-_]/g, '_')
    const template = getTemplateForType(processingRequest.document_type || processingRequest.type)
    link.download = `${name}_${template.replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrintPdf = async () => {
    if(!processingRequest) return
    const pdfBytes = await createDocumentPdf(processingRequest, documentFields)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const printWin = window.open(url)
    if(printWin){
      printWin.focus()
      printWin.onload = () => printWin.print()
    } else {
      alert('Unable to open document for printing. Please allow popups.')
    }
  }

  const handleFinalizeRequest = async () => {
    if(!processingRequest) return
    mockApi.updateDocStatus(processingRequest.request_id, 'Released')
    try {
      await api.put(`/docs/${processingRequest.request_id}`, { status: 'Released' })
    } catch {
      // Best-effort; continue with local state
    }
    load()
    setProcessingRequest(null)
  }

  const processingTemplate = processingRequest
    ? getTemplateForType(processingRequest.document_type || processingRequest.type)
    : getTemplateForType(documentFields.document_type || requestType)

  return(
    <div className="app-shell">
      <Sidebar/>

      <div className="main-area">
        <Header/>

        <main>
          <div className="page-heading-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">Manage Documents</h1>
            <Button variant="secondary" onClick={openAddRequest}>Add Request</Button>
          </div>

          {error && <div className="field-error">{error}</div>}

          {loading ? (
            <div className="empty-state">Loading documents...</div>
          ) : (
            <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Type</th>
                    <th>Resident</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((it, idx)=>(
                    <tr key={it.reference_number || it.request_id || it.id || it.numericId || idx}>
                      <td>{it.reference_number || it.request_id}</td>
                      <td>{it.document_type || it.document}</td>
                      <td>{it.name || it.resident_id || '—'}</td>
                      <td>{new Date(it.date_requested || Date.now()).toLocaleDateString('en-US')}</td>
                      <td><StatusBadge status={it.status}/></td>
                      <td>
                        <div className="table-actions-inline" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Button onClick={()=>handleProcessRequest(it)}>Process</Button>
                          <Button variant="secondary" onClick={() => openEditRequest(it)}>Edit</Button>
                          <Button variant="secondary" onClick={() => handleDeleteRequest(it)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {modalMode && (
              <div className="modal-overlay" onClick={closeProcessingModal}>
                <div className="modal-card complaint-details-modal" onClick={e => e.stopPropagation()}>
                  <button className="modal-close-btn" type="button" onClick={closeProcessingModal}>
                    ✕
                  </button>

                  <h2 className="modal-title">
                    {modalMode === 'add' ? 'Add Document Request' : modalMode === 'edit' ? 'Edit Document Request' : 'Process Document Request'}
                  </h2>

                  <div className="form-card process-modal-grid-single">
                    <div className="document-preview-shell-a4">
                      <div className="document-preview-a4">
                        <div className="document-preview-header">
                          <div style={{ fontSize: '9px', fontWeight: '700', marginBottom: '1px' }}>Republic of the Philippines</div>
                          <div style={{ fontSize: '8px', fontWeight: '700', marginBottom: '1px' }}>Province of Cavite</div>
                          <div style={{ fontSize: '8px', fontWeight: '700' }}>Barangay Mambog II</div>
                        </div>

                        <div className="document-preview-body">
                          <div className="document-preview-title">{processingTemplate}</div>

                          <div style={{ marginTop: '6px', fontSize: '10px', lineHeight: '1.3' }}>
                            {processingTemplate === 'Barangay Clearance' && (
                              <>
                                <p>This is to certify that <strong>{documentFields.name || '[Name]'}</strong> of legal age, {documentFields.address ? `a resident of ${documentFields.address}` : '[Address]'}, and a bonafide resident of this barangay.</p>
                                <p>This certification is issued upon the request of the above-named person for {documentFields.purpose || 'official purposes'}.</p>
                              </>
                            )}
                            {processingTemplate === 'Certificate of Residency' && (
                              <>
                                <p>This is to certify that <strong>{documentFields.name || '[Name]'}</strong> is a bonafide resident of {documentFields.address || '[Address]'}, Barangay Mambog II, Cavite.</p>
                                <p>This certificate is issued for the purpose of {documentFields.purpose || 'official use'}.</p>
                              </>
                            )}
                            {processingTemplate === 'Certificate of Indigency' && (
                              <>
                                <p>This is to certify that <strong>{documentFields.name || '[Name]'}</strong> is a bonafide resident of {documentFields.address || '[Address]'}, Barangay Mambog II, Cavite, and is considered indigent.</p>
                                <p>This certificate is issued for the purpose of {documentFields.purpose || 'supporting indigency assistance'}.</p>
                              </>
                            )}
                            {processingTemplate === 'Business Permit' && (
                              <>
                                <p>This is to certify that <strong>{documentFields.business_name || '[Business Name]'}</strong>, owned and operated by <strong>{documentFields.name || '[Owner Name]'}</strong>, is located at {documentFields.address || '[Business Address]'}, Barangay Mambog II, Cavite.</p>
                                <p>This certificate is issued for the purpose of {documentFields.purpose || 'business operation'}.</p>
                              </>
                            )}
                          </div>

                          <div className="document-preview-footer">
                            <div style={{ marginTop: '8px', fontSize: '9px' }}>Date Issued: {new Date().toLocaleDateString('en-US')}</div>
                            <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '9px' }}>
                              <div>_________________________</div>
                              <div style={{ marginTop: '2px' }}>Barangay Captain</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="document-edit-sidebar">
                      <div className="sidebar-card">
                        <h3 className="sidebar-title">
                          {modalMode === 'add' ? 'New Request' : modalMode === 'edit' ? 'Edit Information' : 'Process Information'}
                        </h3>
                        <div className="form-field">
                          <label className="form-label">Document Type</label>
                          <select
                            className="ui-input"
                            value={documentFields.document_type || ''}
                            onChange={e => handleFieldChange('document_type', e.target.value)}
                          >
                            {REQUEST_DOC_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {formErrors.document_type && <div className="field-error">{formErrors.document_type}</div>}
                        </div>
                        <div className="form-field">
                          <label className="form-label">Full Name</label>
                          <input
                            className="ui-input"
                            value={documentFields.name || ''}
                            onChange={e => handleFieldChange('name', e.target.value)}
                          />
                          {formErrors.name && <div className="field-error">{formErrors.name}</div>}
                        </div>
                        <div className="form-field">
                          <label className="form-label">Address</label>
                          <input
                            className="ui-input"
                            value={documentFields.address || ''}
                            onChange={e => handleFieldChange('address', e.target.value)}
                          />
                          {formErrors.address && <div className="field-error">{formErrors.address}</div>}
                        </div>
                        {processingTemplate === 'Business Permit' && (
                          <div className="form-field">
                            <label className="form-label">Business Name</label>
                            <input
                              className="ui-input"
                              value={documentFields.business_name || ''}
                              onChange={e => handleFieldChange('business_name', e.target.value)}
                            />
                            {formErrors.business_name && <div className="field-error">{formErrors.business_name}</div>}
                          </div>
                        )}
                        {processingTemplate !== 'Certificate of Indigency' && (
                          <div className="form-field">
                            <label className="form-label">Birthdate</label>
                            <input
                              type="date"
                              className="ui-input"
                              value={documentFields.birthdate || ''}
                              onChange={e => handleFieldChange('birthdate', e.target.value)}
                            />
                          </div>
                        )}
                        <div className="form-field">
                          <label className="form-label">Purpose</label>
                          <input
                            className="ui-input"
                            value={documentFields.purpose || ''}
                            onChange={e => handleFieldChange('purpose', e.target.value)}
                          />
                          {formErrors.purpose && <div className="field-error">{formErrors.purpose}</div>}
                        </div>
                        <div className="form-field">
                          <label className="form-label">Notes</label>
                          <textarea
                            className="ui-input"
                            rows="3"
                            value={documentFields.notes || ''}
                            onChange={e => handleFieldChange('notes', e.target.value)}
                          />
                        </div>
                        {modalMode !== 'process' && (
                          <div className="sidebar-actions-buttons">
                            <Button variant="secondary" onClick={closeProcessingModal} style={{ flex: 1 }}>Cancel</Button>
                            <Button onClick={handleSaveRequest} style={{ flex: 1 }}>
                              {modalMode === 'add' ? 'Save Request' : 'Save Changes'}
                            </Button>
                          </div>
                        )}
                        {modalMode === 'process' && (
                          <div className="sidebar-actions-buttons">
                            <Button variant="secondary" onClick={closeProcessingModal} style={{ flex: 1 }}>Cancel</Button>
                            <Button variant="secondary" onClick={handlePrintPdf} style={{ flex: 1 }}>Print</Button>
                            <Button variant="secondary" onClick={handleDownloadPdf} style={{ flex: 1 }}>
                              Download
                            </Button>
                            <Button onClick={handleFinalizeRequest} style={{ flex: 1 }}>Finalize</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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