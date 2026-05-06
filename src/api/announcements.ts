import api from './client'
import type { Announcement, AnnouncementCreate } from './types'

export const announcementsApi = {
  getAnnouncements: (): Promise<Announcement[]> => {
    return api.get<Announcement[]>('/announcements')
  },

  createAnnouncement: (data: AnnouncementCreate): Promise<Announcement> => {
    return api.post<Announcement>('/announcements', data)
  },

  updateAnnouncement: (announcementId: string, data: Partial<AnnouncementCreate>): Promise<Announcement> => {
    return api.put<Announcement>(`/announcements/${announcementId}`, data)
  },

  deleteAnnouncement: (announcementId: string): Promise<void> => {
    return api.delete(`/announcements/${announcementId}`)
  },
}
