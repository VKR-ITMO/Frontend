import api from './client'

export interface MaterialCreate {
  name: string
  description?: string
  url?: string
  file_size?: string
}

export interface Material {
  id: string
  course_id: string
  name: string
  description?: string
  url?: string
  file_size?: string
  created_at: string
}

export const materialsApi = {
  getMaterials: (courseId: string): Promise<Material[]> => {
    return api.get<Material[]>(`/courses/${courseId}/materials`)
  },

  createMaterial: (courseId: string, data: MaterialCreate): Promise<Material> => {
    return api.post<Material>(`/courses/${courseId}/materials`, data)
  },

  deleteMaterial: (courseId: string, materialId: string): Promise<void> => {
    return api.delete(`/courses/${courseId}/materials/${materialId}`)
  },
}
