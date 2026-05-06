import api from './client'
import type { Reaction, ReactionStats, ReactionType } from './types'

export const reactionsApi = {
  sendReaction: (sessionId: string, type: ReactionType): Promise<Reaction> => {
    return api.post<Reaction>(`/sessions/${sessionId}/reactions`, { type })
  },

  getReactionStats: (sessionId: string): Promise<ReactionStats> => {
    return api.get<ReactionStats>(`/sessions/${sessionId}/reactions/stats`)
  },
}
