import axios from 'axios'
import type { Job, PaginatedResponse, StatusType } from './types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
})

// CRUD functions for jobs

export const getJobs = (page: number = 1): Promise<{ data: PaginatedResponse<Job> }> =>
  api.get(`/jobs/?page=${page}`)

export const createJob = (name: string): Promise<{ data: Job }> =>
  api.post('/jobs/', { name })

export const updateJob = (id: number, status_type: StatusType): Promise<{ data: Job }> =>
  api.patch(`/jobs/${id}/`, { status_type })

export const deleteJob = (id: number): Promise<void> =>
  api.delete(`/jobs/${id}/`)