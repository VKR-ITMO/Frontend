import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should start with no user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should login with valid student credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let success: boolean = false
    await act(async () => {
      success = await result.current.login('student@test.com', 'student123')
    })

    expect(success).toBe(true)
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.role).toBe('student')
    expect(result.current.user?.email).toBe('student@test.com')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should login with valid teacher credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let success: boolean = false
    await act(async () => {
      success = await result.current.login('teacher@test.com', 'teacher123')
    })

    expect(success).toBe(true)
    expect(result.current.user?.role).toBe('teacher')
  })

  it('should login with valid admin credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let success: boolean = false
    await act(async () => {
      success = await result.current.login('admin@test.com', 'admin123')
    })

    expect(success).toBe(true)
    expect(result.current.user?.role).toBe('admin')
  })

  it('should fail login with invalid credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let success: boolean = true
    await act(async () => {
      success = await result.current.login('wrong@test.com', 'wrongpassword')
    })

    expect(success).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should fail login with wrong password', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let success: boolean = true
    await act(async () => {
      success = await result.current.login('student@test.com', 'wrongpassword')
    })

    expect(success).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should logout correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Login first
    await act(async () => {
      await result.current.login('student@test.com', 'student123')
    })

    expect(result.current.user).not.toBeNull()

    // Then logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('lecturehub_user')
  })

  it('should persist user in localStorage on login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.login('student@test.com', 'student123')
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'lecturehub_user',
      expect.stringContaining('student@test.com')
    )
  })

  it('should handle case-insensitive email', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let success: boolean = false
    await act(async () => {
      success = await result.current.login('STUDENT@TEST.COM', 'student123')
    })

    expect(success).toBe(true)
    expect(result.current.user?.email).toBe('student@test.com')
  })
})
