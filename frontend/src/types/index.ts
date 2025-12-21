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

export interface WorkspaceListItem {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  notesCount: number
}

export interface WorkspacesResponse {
  meta: PaginationMeta
  data: WorkspaceListItem[]
}

export interface WorkspaceNotesResponse {
  workspace: {
    id: number
    name: string
  }
  pagination: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
  notes: Note[]
}

export interface Note {
  id: number
  workspaceId: number
  userId: number
  title: string
  content: string | null
  status: 'draft' | 'published'
  visibility: 'private' | 'public'
  voteCount: number
  lastAutosaveAt: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  tags: Tag[]
  user: {
    id: number
    fullName: string
  }
  workspace?: {
    id: number
    name: string
    tenantId?: number
    company: {
      id: number
      name: string
    }
  }
}

export interface Tag {
  id: number
  name: string
}

export interface NotesResponse {
  notes: Note[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl: string
  lastPageUrl: string
  nextPageUrl: string | null
  previousPageUrl: string | null
}

export interface VoteStatus {
  hasVoted: boolean
  voteType: 'up' | 'down' | null
  voteCount?: number
}

export interface VoteStats {
  upvotes: number
  downvotes: number
  total: number
  score: number
}

export type SortOption = 'newest' | 'oldest' | 'most_upvoted' | 'most_downvoted'