import React from 'react'
import './button.css'

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  ...props
}){
  return (
    <button
      type={type}
      className={`btn ${variant}`}
      {...props}
    >
      {children}
    </button>
  )
}