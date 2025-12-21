/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import api from '../api/axios'

interface VoteStatus {
  hasVoted: boolean
  voteType: 'up' | 'down' | null
}

type VotesMap = Record<number, VoteStatus>

export function useBulkVotes(noteIds: number[]) {
  const [votes, setVotes] = useState<VotesMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (noteIds.length === 0) {
      setLoading(false)
      return
    }

    fetchBulkVotes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(noteIds)]) // Stringify to properly compare arrays

  const fetchBulkVotes = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/notes/votes/bulk', {
        noteIds,
      })

      setVotes(data.votes)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load votes')
      console.error('Bulk votes error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchBulkVotes()
  }

  return { votes, loading, error, refetch }
}