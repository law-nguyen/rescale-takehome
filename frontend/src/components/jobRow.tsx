import { useState, useRef, useEffect } from 'react'
import type { StatusType, StatusConfigMap, JobRowProps } from '../types'
import './styles/jobRow.css'

const STATUSES: StatusType[] = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']

const STATUS_CONFIG: StatusConfigMap = {
  PENDING:   { color: '#f59e0b', label: 'Pending' },
  RUNNING:   { color: '#3b82f6', label: 'Running' },
  COMPLETED: { color: '#10b981', label: 'Completed' },
  FAILED:    { color: '#ef4444', label: 'Failed' },
}

export default function JobRow({ job, onStatusChange, onDelete }: JobRowProps) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [updating, setUpdating]         = useState<boolean>(false)
  const dropdownRef                     = useRef<HTMLDivElement>(null)

  const config = job.current_status
    ? STATUS_CONFIG[job.current_status]
    : { color: '#6b7280', label: 'Unknown' }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleStatusSelect = async (newStatus: StatusType): Promise<void> => {
    if (newStatus === job.current_status) { setDropdownOpen(false); return }
    setUpdating(true)
    setDropdownOpen(false)
    await onStatusChange(job.id, newStatus)
    setUpdating(false)
  }

  return (
    <div className="job-row">
      <span className="job-name">{job.name}</span>

      <div className="status-wrapper" ref={dropdownRef}>
        <button
          className="status-badge"
          onClick={() => setDropdownOpen(o => !o)}
          disabled={updating}
          title="Click to change status"
        >
          <span className="status-dot" style={{ background: config.color }} />
          <span className="status-label" style={{ color: config.color }}>
            {updating ? '…' : config.label}
          </span>
          <span className="status-chevron">▾</span>
        </button>

        {dropdownOpen && (
          <div className="status-dropdown">
            {STATUSES.map(s => {
              const c = STATUS_CONFIG[s]
              return (
                <button
                  key={s}
                  className={`dropdown-item ${s === job.current_status ? 'active' : ''}`}
                  onClick={() => handleStatusSelect(s)}
                >
                  <span className="status-dot" style={{ background: c.color }} />
                  {c.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <button className="delete-btn" onClick={onDelete} title="Delete job">✕</button>
    </div>
  )
}