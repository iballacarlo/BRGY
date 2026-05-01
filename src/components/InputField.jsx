import React, { useState } from 'react'
import './inputfield.css'

export default function InputField({
  label,
  type = 'text',
  error,
  allowToggle = false,
  ...props
}){
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const canToggle = isPassword && allowToggle

  return (
    <div className={`form-group ${error ? 'has-error' : ''}`}>
      {label && <label className="field-label">{label}</label>}

      <div className={`input-wrap ${canToggle ? 'has-toggle' : ''}`}>
        <input
          className="field-input"
          type={canToggle && show ? 'text' : type}
          {...props}
        />

        {canToggle && (
          <button
            type="button"
            className="showbtn"
            onClick={() => setShow(s => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  )
}