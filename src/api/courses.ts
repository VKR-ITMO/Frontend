import api from './client'
import type { Course, CourseWithStats, CourseCreate, CourseUpdate, User } from './types'

export const coursesApi = {
  getCourses: (role?: string): Promise<Course[]> => {
    const query = role ? `?role=${role}` : ''
    return api.get<Course[]>(`/courses${query}`)
  },

  getCourse: (courseId: string): Promise<CourseWithStats> => {
    return api.get<CourseWithStats>(`/courses/${courseId}`)
  },

  createCourse: (data: CourseCreate): Promise<Course> => {
    return api.post<Course>('/courses', data)
  },

  updateCourse: (courseId: string, data: CourseUpdate): Promise<Course> => {
    return api.put<Course>(`/courses/${courseId}`, data)
  },

  deleteCourse: (courseId: string): Promise<void> => {
    return api.delete(`/courses/${courseId}`)
  },

  getCourseStudents: (courseId: string): Promise<User[]> => {
    return api.get<User[]>(`/courses/${courseId}/students`)
  },

  enrollToCourse: (courseId: string): Promise<{ message: string }> => {
    return api.post(`/courses/${courseId}/enroll`)
  },

  unenrollFromCourse: (courseId: string): Promise<void> => {
    return api.delete(`/courses/${courseId}/enroll`)
  },
}
