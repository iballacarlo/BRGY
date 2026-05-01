import React from 'react'
import './statusbadge.css'

const map = {
  approved: 'green',
  resolved: 'green',
  pending: 'yellow',
  rejected: 'red',
  review: 'blue'
}

export default function StatusBadge({ status }){
  const key = (status || '').toLowerCase()
  const cls = map[key] || 'gray'

  return (
    <span
      className={`status-badge ${cls}`}
      role="status"
      aria-label={`Status ${status}`}
    >
      {status}
    </span>
  )
}