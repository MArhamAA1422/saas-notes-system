export interface User {
  id: number
  fullName: string
  email: string
  company: {
    id: number
    name: string
  }
}

export interface Stats {
  totalNotes: number
  draftNotes: number
  publicNotes: number
  totalWorkspaces: number
}

export interface RecentNote {
  id: number
  title: string
  status: 'draft' | 'published'
  visibility: 'private' | 'public'
  updatedAt: string
  workspace: {
    id: number
    name: string
  }
}

export interface Workspace {
  id: number
  name: string
  notesCount: number
}

export interface DashboardData {
  user: User
  stats: Stats
  recentNotes: RecentNote[]
  workspaces: Workspace[]
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export interface ApiError {
  error: string
  message: string
  errors?: Array<{
    message: string
    rule: string
    field: string
  }>
}