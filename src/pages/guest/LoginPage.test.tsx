import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import LoginPage from './LoginPage'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    localStorage.clear()
  })

  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByText('Войти в аккаунт')).toBeInTheDocument()
    expect(screen.getByText('Введите свои данные для входа')).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders role toggle', () => {
    render(<LoginPage />)
    expect(screen.getByText('Студент')).toBeInTheDocument()
    expect(screen.getByText('Преподаватель')).toBeInTheDocument()
  })

  it('renders test accounts hint', () => {
    render(<LoginPage />)
    expect(screen.getByText('Тестовые аккаунты:')).toBeInTheDocument()
    expect(screen.getByText(/student@test.com/)).toBeInTheDocument()
    expect(screen.getByText(/teacher@test.com/)).toBeInTheDocument()
  })

  it('renders login button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('renders forgot password link', () => {
    render(<LoginPage />)
    const forgotLink = screen.getByText('Забыли пароль?')
    expect(forgotLink).toBeInTheDocument()
    expect(forgotLink.closest('a')).toHaveAttribute('href', '/forgot-password')
  })

  it('renders register link', () => {
    render(<LoginPage />)
    const registerLink = screen.getByText('Зарегистрироваться')
    expect(registerLink).toBeInTheDocument()
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
  })

  it('allows typing in email field', () => {
    render(<LoginPage />)
    const emailInput = screen.getByPlaceholderText('name@example.com')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    expect(emailInput).toHaveValue('test@example.com')
  })

  it('allows typing in password field', () => {
    render(<LoginPage />)
    const passwordInput = screen.getByPlaceholderText('••••••••')
    fireEvent.change(passwordInput, { target: { value: 'mypassword' } })
    expect(passwordInput).toHaveValue('mypassword')
  })

  it('shows error on invalid credentials', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('name@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: 'Войти' })

    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument()
    })
  })

  it('navigates to student dashboard on successful student login', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('name@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: 'Войти' })

    fireEvent.change(emailInput, { target: { value: 'student@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'student123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/student')
    })
  })

  it('navigates to teacher dashboard on successful teacher login', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('name@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: 'Войти' })

    fireEvent.change(emailInput, { target: { value: 'teacher@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'teacher123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/teacher')
    })
  })

  it('shows loading state during login', async () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByPlaceholderText('name@example.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: 'Войти' })

    fireEvent.change(emailInput, { target: { value: 'student@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'student123' } })
    fireEvent.click(submitButton)

    expect(screen.getByText('Вход...')).toBeInTheDocument()
  })
})
