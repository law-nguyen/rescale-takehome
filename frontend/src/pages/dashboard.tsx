import { useState, useEffect } from 'react'
import { getJobs, createJob, updateJob, deleteJob } from '../api'
import type { Job, StatusType, APIError } from '../types'
import JobRow from '../components/jobRow'
import Modal from '../components/modal'
import './styles/dashboard.css'

function Dashboard() {
  // const [count, setCount] = useState(0)
  const [jobs, setJobs] = useState<Job[]>([])
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotal] = useState<number>(1)
  const [newJob, setNewJob] = useState<string>('')
  const [jobError, setJobError] = useState<string>('')
  const [toDelete, setToDelete] = useState<Job | null>(null)

  // This was a hacky solution claude came up with.
  // originally, I wanted to just call my loadJobs function in the useEffect,
  // but was running into some errors regarding cascading renders that I didn't know how to fix.
  useEffect(() => {
    let cancelled = false
  
    const load = async () => {
      try {
        const res = await getJobs(page)
        if (cancelled) return   // don't setState if component unmounted
        setJobs(res.data.results)
        setTotal(Math.ceil(res.data.count / 25))
        setJobError('')
      } catch {
        if (cancelled) return
        setJobError('Failed to load jobs. Check server status.')
      }
    }
  
    load()
    return () => { cancelled = true }
  }, [page])

  const loadJobs = async (): Promise<void> => {
    try {
      const res = await getJobs(page)
      setJobs(res.data.results)
      setTotal(Math.ceil(res.data.count / 25))
      setJobError('')
    } catch {
      setJobError('Failed to load jobs. Check server status.')
    }
  }

  const handleCreate = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!newJob.trim()) {
      setJobError('Job name cannot be empty.')
      return
    }
    try {
      await createJob(newJob.trim())
      setNewJob('')
      setJobError('')
      if (page === 1) loadJobs()
        else setPage(1)
    } catch (err) {
      const data = (err as { response?: { data?: APIError } }).response?.data
      const message =
        data?.error ??
        data?.name?.[0] ??
        'Failed to create job.'
      setJobError(message)
    }
  }

  const handleStatusChange = async (id: number, status_type: StatusType): Promise<void> => {
    setJobError('')
    try {
      const res = await updateJob(id, status_type)
      setJobs(prev => prev.map(j => j.id === id ? res.data : j))
    } catch {
      setJobError('Failed to update status.')
    }
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!toDelete) return
    setJobError('')
    try {
      await deleteJob(toDelete.id)
      setToDelete(null)
      loadJobs()
    } catch {
      setJobError('Failed to delete job.')
      setToDelete(null)
    }
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-inner">
          <div className="header-title">
            <h1>HPC Dashboard</h1>
          </div>

          <form className="create-form" onSubmit={handleCreate}>
            <div className="input-wrap">
              <input
                className={'job-input'}
                type="text"
                placeholder="New job name…"
                value={newJob}
                onChange={e => { setNewJob(e.target.value); setJobError('') }}
              />
            </div>
            <button className="btn-submit" type="submit">+ Create New Job</button>
          </form>
        </div>
      </header>

      <main className="main">

        <div className="table-header">
          <span>Job Name</span>
          <span>Status</span>
          <span></span>
        </div>

        <div className="job-list">
          {jobs.length === 0 ? (
            <div className="state-msg">No jobs found. Submit one above.</div>
          ) : (
            jobs.map(job => (
              <JobRow
                key={job.id}
                job={job}
                onStatusChange={handleStatusChange}
                onDelete={() => setToDelete(job)}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        )}
      </main>

    {/* TODO: to add job history, I can create a new modal here for it */}
    {toDelete && (
      <Modal
        title="Delete job?"
        message={`${toDelete.name} will be permanently removed.`}
        onClose={() => setToDelete(null)}
        buttons={[
          { label: 'Cancel', variant: 'cancel', onClick: () => setToDelete(null) },
          { label: 'Delete', variant: 'danger', onClick: handleDeleteConfirm },
        ]}
      />
    )}

    {jobError && (
      <Modal
        title="Something went wrong"
        message={jobError}
        onClose={() => setJobError('')}
        buttons={[
          { label: 'Dismiss', variant: 'primary', onClick: () => setJobError('') },
        ]}
      />
    )}
  </div>
  )
}

export default Dashboard
