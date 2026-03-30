export type StatusType = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
 
export interface Job {
  id: number
  name: string
  current_status: StatusType | null
  created_at: string // datetime
  updated_at: string // datetime
}

export interface PaginatedResponse<T> {
  count:    number
  next:     string | null
  previous: string | null
  results:  T[]
}


export interface StatusConfig {
  color: string
  label: string
}

export interface ModalButton {
  label:   string
  onClick: () => void
  variant: 'primary' | 'danger' | 'cancel'
}

export interface ModalProps {
  title:    string
  message:  string
  buttons:  ModalButton[]
  onClose:  () => void 
}

export interface JobRowProps {
  job:            Job
  onStatusChange: (id: number, status: StatusType) => Promise<void>
  onDelete:       () => void
}

export interface APIError {
  error?: string
  name?:  string[]
}
 
export type StatusConfigMap = Record<StatusType, StatusConfig>

