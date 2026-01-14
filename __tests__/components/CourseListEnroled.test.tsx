/**
 * Unit tests for CourseListEnroled component
 * Simple rendering tests
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import CourseListEnroled from '@/components/CourseListEnroled'

// Mock the server actions
const mockGetCourses = jest.fn()
const mockGetStudent = jest.fn()

jest.mock('@/actions/courseActions', () => ({
  getCourses: (...args: any[]) => mockGetCourses(...args),
}))

jest.mock('@/actions/studentActions', () => ({
  getStudent: (...args: any[]) => mockGetStudent(...args),
}))

// Mock useAuth
const mockUseAuth = jest.fn()
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('CourseListEnroled Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    mockGetCourses.mockResolvedValue([
      {
        _id: '1',
        code: 'CS101',
        name: 'Introduction to Programming',
        department: 'Computer Engineering',
        akts: 3,
        semester: 'Fall',
      },
    ])

    mockGetStudent.mockResolvedValue({
      _id: '1',
      student_no: 'S001',
      enrolledCourses: ['CS101'],
    })

    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'student@example.com',
        name: 'John Student',
        role: 'student',
        ref_id: '1',
      },
      isLoading: false,
    })
  })

  test('renders component heading', () => {
    render(<CourseListEnroled />)
    expect(screen.getByText('My Enrolled Courses')).toBeInTheDocument()
  })

  test('displays enrolled courses after loading', async () => {
    render(<CourseListEnroled />)

    // Wait for loading to complete and courses to appear
    await waitFor(
      () => {
        expect(screen.getByText('CS101')).toBeInTheDocument()
        expect(screen.getByText('Introduction to Programming')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  test('shows search input', () => {
    render(<CourseListEnroled />)
    const searchInput = screen.getByPlaceholderText('Search by name or code...')
    expect(searchInput).toBeInTheDocument()
  })

  test('shows semester filter', () => {
    render(<CourseListEnroled />)
    const semesterSelect = screen.getByText('All Semesters')
    expect(semesterSelect).toBeInTheDocument()
  })

  test('shows loading state initially', () => {
    render(<CourseListEnroled />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
