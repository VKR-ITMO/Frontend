import api from './client'
import type { Lecture, LectureCreate, LectureUpdate, LecturePublishResponse } from './types'

export const lecturesApi = {
  getCourseLectures: (courseId: string): Promise<Lecture[]> => {
    return api.get<Lecture[]>(`/lectures/courses/${courseId}/lectures`)
  },

  getLecture: (lectureId: string): Promise<Lecture> => {
    return api.get<Lecture>(`/lectures/${lectureId}`)
  },

  createLecture: (courseId: string, data: LectureCreate): Promise<Lecture> => {
    return api.post<Lecture>(`/lectures/courses/${courseId}/lectures`, data)
  },

  createFreeLecture: (topic: string): Promise<Lecture> => {
    return api.post<Lecture>(`/lectures/free?topic=${encodeURIComponent(topic)}`)
  },

  updateLecture: (lectureId: string, data: LectureUpdate): Promise<Lecture> => {
    return api.put<Lecture>(`/lectures/${lectureId}`, data)
  },

  deleteLecture: (lectureId: string): Promise<void> => {
    return api.delete(`/lectures/${lectureId}`)
  },

  publishLecture: (lectureId: string): Promise<LecturePublishResponse> => {
    return api.post<LecturePublishResponse>(`/lectures/${lectureId}/publish`)
  },
}
