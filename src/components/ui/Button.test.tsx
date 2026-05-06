import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/test-utils'
import Button from './Button'

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-zinc-900')
    expect(button).toHaveClass('text-white')
  })

  it('applies secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-zinc-100')
    expect(button).toHaveClass('text-zinc-700')
  })

  it('applies danger variant correctly', () => {
    render(<Button variant="danger">Danger</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-red-600')
  })

  it('applies ghost variant correctly', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('text-zinc-700')
  })

  it('applies outline variant correctly', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border')
  })

  it('applies small size correctly', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
  })

  it('applies medium size by default', () => {
    render(<Button>Medium</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6')
    expect(button).toHaveClass('py-3')
  })

  it('applies large size correctly', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-8')
  })

  it('applies fullWidth correctly', () => {
    render(<Button fullWidth>Full Width</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('w-full')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-20')
    expect(button).toHaveClass('cursor-not-allowed')
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('accepts additional className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('passes through additional props', () => {
    render(<Button data-testid="test-button" type="submit">Submit</Button>)
    const button = screen.getByTestId('test-button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})
