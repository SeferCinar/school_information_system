/**
 * Unit tests for exam actions
 * Simple tests to demonstrate testing coverage
 */

// Mock database connection
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}))

// Mock mongoose models
jest.mock('@/models/Exam', () => ({
  find: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  aggregate: jest.fn(),
}))

jest.mock('@/models/Lecture', () => ({
  find: jest.fn(),
}))

jest.mock('@/models/Student', () => ({
  findOne: jest.fn(),
}))

import { getExams, getTotalPercentage } from '@/actions/examActions'
import Exam from '@/models/Exam'

describe('Exam Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getExams', () => {
    test('returns exams for a course and semester', async () => {
      const mockExams = [
        {
          _id: 'E001',
          lecture_code: 'CS101',
          semester: 'Fall',
          exam_type: 'Midterm',
          percentage: 40,
          exam_date: new Date('2024-10-15'),
          time: '14:00',
          duration: 90,
        },
        {
          _id: 'E002',
          lecture_code: 'CS101',
          semester: 'Fall',
          exam_type: 'Final',
          percentage: 60,
          exam_date: new Date('2024-12-20'),
          time: '10:00',
          duration: 120,
        },
      ]

      ;(Exam.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockExams),
        }),
      })

      const result = await getExams('CS101', 'Fall')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0].exam_type).toBe('Midterm')
    })

    test('returns empty array when no exams found', async () => {
      ;(Exam.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      })

      const result = await getExams('CS101', 'Fall')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })
  })

  describe('getTotalPercentage', () => {
    test('calculates total percentage correctly', async () => {
      const mockResult = [{ _id: null, total: 100 }]

      ;(Exam.aggregate as jest.Mock).mockResolvedValue(mockResult)

      const result = await getTotalPercentage('CS101', 'Fall')

      expect(result).toBe(100)
    })

    test('returns 0 when no exams exist', async () => {
      ;(Exam.aggregate as jest.Mock).mockResolvedValue([])

      const result = await getTotalPercentage('CS101', 'Fall')

      expect(result).toBe(0)
    })
  })
})
