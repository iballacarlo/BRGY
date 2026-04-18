import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Button from '../components/Button'
import '../styles/form.css'
import api from '../api/axios'
import mockApi from '../api/mockApi'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { addressData } from '../data/addressData'
import { useNavigate } from 'react-router-dom'

const DOC_TYPES = [
  'Barangay Clearance',
  'Certificate of Residency',
  'Certificate of Indigency',
]
const STORAGE_DOCUMENT_TYPES_KEY = 'admin_disabled_document_types'

export default function DocumentRequest(){
  const [type, setType] = useState('Barangay Clearance')
  const [purpose, setPurpose] = useState('')
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [phase, setPhase] = useState('')
  const [street, setStreet] = useState('')
  const [block, setBlock] = useState('')
  const [lot, setLot] = useState('')
  const [disabledDocumentTypes, setDisabledDocumentTypes] = useState({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_DOCUMENT_TYPES_KEY)
      const parsed = stored ? JSON.parse(stored) : {}
      setDisabledDocumentTypes(parsed)
      const allowedDocTypes = DOC_TYPES.filter(docType => !parsed[docType])
      if(allowedDocTypes.length > 0){
        if(!allowedDocTypes.includes(type)){
          setType(allowedDocTypes[0])
        }
      } else {
        setType('')
      }
    } catch {
      setDisabledDocumentTypes({})
    }
  }, [])

  const formatMmDdYyyy = (value) => {
    const date = new Date(value)
    if(!value || Number.isNaN(date.getTime())) return ''
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`
  }
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submittedRequest, setSubmittedRequest] = useState(null)

  const nav = useNavigate()

  function validate(){
    const e = {}
    if(!name.trim()) e.name = 'Name is required'
    if(!birthdate.trim()) e.birthdate = 'Birthdate is required'
    else if(Number.isNaN(new Date(birthdate).getTime())) e.birthdate = 'Birthdate must be valid'
    if(!phase.trim()) e.phase = 'Phase is required'
    if(!street.trim()) e.street = 'Street is required'
    if(!block.trim()) e.block = 'Block is required'
    if(!lot.trim()) e.lot = 'Lot is required'
    if(!type) e.type = 'Document type is required'
    if(!purpose.trim()) e.purpose = 'Purpose is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function onPickType(next){
    setType(next)
    setErrors(prev => ({ ...prev, type: undefined, businessName: undefined }))
  }

  const availableDocTypes = DOC_TYPES.filter(docType => !disabledDocumentTypes[docType])

  async function submitToApi(){
    try {
      // Use mock API to ensure all data is stored properly
      const formattedAddress = `${phase}, ${street}, Block ${block}, Lot ${lot}`
      const result = mockApi.addDoc({
        userId: JSON.parse(localStorage.getItem('mock_current_user') || '{}')?.id,
        type: type,
        document_type: type,
        name,
        birthdate: birthdate ? formatMmDdYyyy(birthdate) : '',
        address: formattedAddress,
        purpose: purpose
      })
      
      // Also try to send to real backend for redundancy
      try {
        await api.post('/docs', {
          name,
          birthdate,
          address: formattedAddress,
          document_type: type,
          purpose
        })
      } catch(err) {
        console.log('Real API unavailable, but document saved to local storage')
      }
      
      return { data: { success: true, data: result } }
    } catch(err) {
      throw err
    }
  }

  async function handleSubmit(){
    if(!validate()) return

    try{
      const res = await submitToApi()
      if(res.data.success) {
        setSubmittedRequest({
          type,
          status: 'Processed by Admin',
          description: `This certifies that the resident has requested a ${type.toLowerCase()} and it has been approved.`,
          date: new Date().toLocaleDateString('en-US')
        })
        setConfirmOpen(false)
        setName('')
        setBirthdate('')
        setPhase('')
        setStreet('')
        setBlock('')
        setLot('')
        setPurpose('')
      } else {
        alert('Error: ' + res.data.message)
      }
    } catch(err){
      alert('Error submitting request: ' + (err.response?.data?.message || err.message))
    }
  }

  function openConfirm(e){
    e.preventDefault()
    if(!validate()) return
    setConfirmOpen(true)
  }

  async function handleDownloadLetter(){
    if(!submittedRequest) return

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 360])
    const { width, height } = page.getSize()
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const textLines = [
      '---------------------------------',
      `| ${submittedRequest.type} Request` + ' '.repeat(Math.max(0, 27 - submittedRequest.type.length)) + '|',
      '---------------------------------',
      `Status: ${submittedRequest.status}`,
      '',
      submittedRequest.type,
      '',
      'This certifies that the resident has requested',
      `a ${submittedRequest.type.toLowerCase()} and it has been approved.`,
      '',
      `Date: ${submittedRequest.date}`
    ]

    const lineHeight = 18
    let y = height - 40

    page.drawText('Barangay Document Request', {
      x: 40,
      y,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0)
    })

    y -= 36
    textLines.forEach(line => {
      page.drawText(line, {
        x: 40,
        y,
        size: 12,
        font: normalFont,
        color: rgb(0, 0, 0)
      })
      y -= lineHeight
    })

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const fileNameText = submittedRequest.type.replace(/\s+/g, '_').toLowerCase()
    link.download = `${fileNameText}_request.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header title="Document Request" />

        <main>
          <h1 className="page-title">Request Document</h1>

          <form className="form-card" onSubmit={openConfirm} noValidate>
            <div className="form-head">
              <h2 className="form-title">Request Details</h2>
              <p className="form-sub">
                Fill out the details below. Fields marked with <span className="req">*</span> are required.
              </p>
            </div>

            <div className="form-grid">
              <label className="form-label">
                Name <span className="req">*</span>
              </label>
              <div className="form-field">
                <input
                  className={`ui-input ${errors.name ? 'ui-error' : ''}`}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>

              <label className="form-label">
                Birthdate <span className="req">*</span>
              </label>
              <div className="form-field">
                <input
                  type="date"
                  className={`ui-input ${errors.birthdate ? 'ui-error' : ''}`}
                  value={birthdate}
                  onChange={e => setBirthdate(e.target.value)}
                />
                {errors.birthdate && <div className="field-error">{errors.birthdate}</div>}
              </div>

              <label className="form-label">
                Phase <span className="req">*</span>
              </label>
              <div className="form-field">
                <select
                  className={`ui-input ${errors.phase ? 'ui-error' : ''}`}
                  value={phase}
                  onChange={e => {
                    setPhase(e.target.value)
                    setStreet('')
                  }}
                >
                  <option value="">Select Phase</option>
                  {Object.keys(addressData).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.phase && <div className="field-error">{errors.phase}</div>}
              </div>

              <label className="form-label">
                Street <span className="req">*</span>
              </label>
              <div className="form-field">
                <select
                  className={`ui-input ${errors.street ? 'ui-error' : ''}`}
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  disabled={!phase}
                >
                  <option value="">Select Street</option>
                  {phase && addressData[phase].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.street && <div className="field-error">{errors.street}</div>}
              </div>

              <label className="form-label">
                Block <span className="req">*</span>
              </label>
              <div className="form-field">
                <input
                  className={`ui-input ${errors.block ? 'ui-error' : ''}`}
                  value={block}
                  onChange={e => setBlock(e.target.value)}
                  placeholder="Block number"
                />
                {errors.block && <div className="field-error">{errors.block}</div>}
              </div>

              <label className="form-label">
                Lot <span className="req">*</span>
              </label>
              <div className="form-field">
                <input
                  className={`ui-input ${errors.lot ? 'ui-error' : ''}`}
                  value={lot}
                  onChange={e => setLot(e.target.value)}
                  placeholder="Lot number"
                />
                {errors.lot && <div className="field-error">{errors.lot}</div>}
              </div>

              <label className="form-label">
                Document Type <span className="req">*</span>
              </label>
              <div className="form-field">
                {availableDocTypes.length === 0 ? (
                  <div className="field-error">
                    No document types are currently available. Please contact the barangay office.
                  </div>
                ) : (
                  <div className={`type-chips ${errors.type ? 'type-chips-error' : ''}`} role="group" aria-label="Document type">
                    {availableDocTypes.map(t => (
                      <button
                        key={t}
                        type="button"
                        className={`type-chip ${type === t ? 'active' : ''}`}
                        onClick={() => onPickType(t)}
                        aria-pressed={type === t}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                {errors.type && <div className="field-error">{errors.type}</div>}
              </div>


              <label className="form-label">
                Purpose <span className="req">*</span>
              </label>
              <div className="form-field">
                <textarea
                  className={`ui-input ui-textarea ${errors.purpose ? 'ui-error' : ''}`}
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="State your purpose (e.g., Employment, Scholarship, etc.)"
                />
                {errors.purpose && <div className="field-error">{errors.purpose}</div>}
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" disabled={availableDocTypes.length === 0}>Submit</Button>
            </div>
          </form>

          {/* ✅ CONFIRM MODAL */}
          {confirmOpen && (
            <div
              className="modal-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Confirm document request"
              onClick={() => setConfirmOpen(false)}
            >
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <h3>Confirm Request</h3>
                <p>Are you sure you want to submit this document request?</p>

                <div className="modal-actions">
                  <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                    Cancel
                  </Button>

                  <Button
                    onClick={() => {
                      handleSubmit()
                    }}
                  >
                    Yes, Submit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}