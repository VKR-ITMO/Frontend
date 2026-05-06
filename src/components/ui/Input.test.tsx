import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import Input from './Input'

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders input element', () => {
    render(<Input label="Email" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('applies placeholder correctly', () => {
    render(<Input label="Email" placeholder="Enter email" />)
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input label="Email" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('applies type correctly', () => {
    render(<Input label="Password" type="password" />)
    const input = document.querySelector('input[type="password"]')
    expect(input).toBeInTheDocument()
  })

  it('accepts defaultValue', () => {
    render(<Input label="Name" defaultValue="John" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('John')
  })

  it('accepts controlled value', () => {
    render(<Input label="Name" value="Jane" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Jane')
  })

  it('renders with correct styling', () => {
    render(<Input label="Test" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border')
    expect(input).toHaveClass('rounded-lg')
  })
})
