/**
 * Unit tests for Sidebar component
 * Simple rendering and role-based menu tests
 */

import { render, screen } from '@testing-library/react'
import Sidebar from '@/components/Sidebar'

// Mock useAuth for different roles
const mockUseAuth = (role: string) => ({
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role,
    ref_id: '1',
  },
  logout: jest.fn(),
})

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

import { useAuth } from '@/context/AuthContext'

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders sidebar for student', () => {
    ;(useAuth as jest.Mock).mockReturnValue(mockUseAuth('student'))

    render(<Sidebar />)

    expect(screen.getByText('OBS System')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('My Courses')).toBeInTheDocument()
  })

  test('renders sidebar for instructor', () => {
    ;(useAuth as jest.Mock).mockReturnValue(mockUseAuth('instructor'))

    render(<Sidebar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Manage Courses')).toBeInTheDocument()
    expect(screen.getByText('Exam Creation')).toBeInTheDocument()
  })

  test('renders sidebar for president', () => {
    ;(useAuth as jest.Mock).mockReturnValue(mockUseAuth('president'))

    render(<Sidebar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Edit Grades')).toBeInTheDocument()
  })

  test('shows logout button', () => {
    ;(useAuth as jest.Mock).mockReturnValue(mockUseAuth('student'))

    render(<Sidebar />)

    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  test('returns null when user is not logged in', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null, logout: jest.fn() })

    const { container } = render(<Sidebar />)
    expect(container.firstChild).toBeNull()
  })
})
