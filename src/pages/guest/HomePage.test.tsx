import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/test-utils'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders hero section with main heading', () => {
    render(<HomePage />)
    expect(screen.getByText('Лекции, которые')).toBeInTheDocument()
    expect(screen.getByText('действительно работают')).toBeInTheDocument()
  })

  it('renders hero description', () => {
    render(<HomePage />)
    expect(screen.getByText(/Платформа для интерактивных лекций/)).toBeInTheDocument()
  })

  it('renders join as guest button', () => {
    render(<HomePage />)
    expect(screen.getByText('Присоединиться как гость')).toBeInTheDocument()
  })

  it('renders features section heading', () => {
    render(<HomePage />)
    expect(screen.getByText('Всё что нужно для живой лекции')).toBeInTheDocument()
  })

  it('renders all 6 feature cards', () => {
    render(<HomePage />)
    expect(screen.getByText('Реакции в реальном времени')).toBeInTheDocument()
    expect(screen.getByText('Квизы на лету')).toBeInTheDocument()
    expect(screen.getByText('Аналитика и рейтинги')).toBeInTheDocument()
    expect(screen.getByText('Безопасный вход через ИСУ')).toBeInTheDocument()
    expect(screen.getByText('Геймификация')).toBeInTheDocument()
    expect(screen.getByText('Вход по QR-коду')).toBeInTheDocument()
  })

  it('renders footer with copyright', () => {
    render(<HomePage />)
    expect(screen.getByText(/© 2025 LectureHub/)).toBeInTheDocument()
  })

  it('renders footer navigation links', () => {
    render(<HomePage />)
    const loginLinks = screen.getAllByText('Войти')
    expect(loginLinks.length).toBeGreaterThan(0)
    expect(screen.getByText('Регистрация')).toBeInTheDocument()
    expect(screen.getByText('Присоединиться')).toBeInTheDocument()
  })

  it('has correct link to join page', () => {
    render(<HomePage />)
    const joinButton = screen.getByText('Присоединиться как гость').closest('a')
    expect(joinButton).toHaveAttribute('href', '/join')
  })

  it('has correct link to login page in footer', () => {
    render(<HomePage />)
    const footerLinks = screen.getAllByText('Войти')
    const footerLoginLink = footerLinks.find(link => link.closest('footer'))
    expect(footerLoginLink?.closest('a')).toHaveAttribute('href', '/login')
  })
})
