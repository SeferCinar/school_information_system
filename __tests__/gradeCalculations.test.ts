/**
 * Unit tests for pure grade calculation functions
 * 
 * These tests verify that:
 * - Letter grades are calculated correctly based on weighted exam scores
 * - GPA is calculated correctly using the 4.0 scale
 * - Edge cases are handled properly
 * 
 * Note: These are pure functions with no dependencies, so no mocking needed!
 */

import { calculateGPA, calculateLetterGrade } from '@/lib/gradeCalculations'

describe('Grade Calculations (Pure Functions)', () => {
  describe('calculateLetterGrade', () => {
    test('calculates AA for score >= 90', () => {
      const examScores = { Midterm: 95, Final: 92 }
      const examPercentages = { Midterm: 40, Final: 60 }
      // Weighted: (95 * 0.4) + (92 * 0.6) = 38 + 55.2 = 93.2
      
      const grade = calculateLetterGrade(examScores, examPercentages)
      expect(grade).toBe('AA')
    })

    test('calculates BA for score >= 85 and < 90', () => {
      const examScores = { Midterm: 85, Final: 87 }
      const examPercentages = { Midterm: 40, Final: 60 }
      // Weighted: (85 * 0.4) + (87 * 0.6) = 34 + 52.2 = 86.2
      
      const grade = calculateLetterGrade(examScores, examPercentages)
      expect(grade).toBe('BA')
    })

    test('calculates BB for score >= 80 and < 85', () => {
      const examScores = { Midterm: 80, Final: 82 }
      const examPercentages = { Midterm: 40, Final: 60 }
      // Weighted: (80 * 0.4) + (82 * 0.6) = 32 + 49.2 = 81.2
      
      const grade = calculateLetterGrade(examScores, examPercentages)
      expect(grade).toBe('BB')
    })

    test('calculates CC for score >= 70 and < 75', () => {
      const examScores = { Midterm: 70, Final: 72 }
      const examPercentages = { Midterm: 40, Final: 60 }
      // Weighted: (70 * 0.4) + (72 * 0.6) = 28 + 43.2 = 71.2
      
      const grade = calculateLetterGrade(examScores, examPercentages)
      expect(grade).toBe('CC')
    })

    test('calculates DD for score >= 60 and < 65', () => {
      const examScores = { Midterm: 60, Final: 62 }
      const examPercentages = { Midterm: 40, Final: 60 }
      // Weighted: (60 * 0.4) + (62 * 0.6) = 24 + 37.2 = 61.2
      
      const grade = calculateLetterGrade(examScores, examPercentages)
      expect(grade).toBe('DD')
    })

    test('calculates FF for score < 60', () => {
      const examScores = { Midterm: 50, Final: 55 }
      const examPercentages = { Midterm: 40, Final: 60 }
      // Weighted: (50 * 0.4) + (55 * 0.6) = 20 + 33 = 53
      
      const grade = calculateLetterGrade(examScores, examPercentages)
      expect(grade).toBe('FF')
    })

    test('handles multiple exam types with custom percentages', () => {
      const examScores = { 
        Quiz: 90, 
        Midterm: 85, 
        Final: 80 
      }
      const examPercentages = { 
        Quiz: 10, 
        Midterm: 30, 
        Final: 60 
      }
      // Weighted: (90 * 0.1) + (85 * 0.3) + (80 * 0.6) = 9 + 25.5 + 48 = 82.5
      
      const grade = calculateLetterGrade(examScores, examPercentages)
      expect(grade).toBe('BB')
    })

    test('returns FF when total weight is 0', () => {
      const examScores = { Midterm: 90, Final: 85 }
      const examPercentages = {} // No percentages defined
      
      const grade = calculateLetterGrade(examScores, examPercentages)
      expect(grade).toBe('FF')
    })
  })

  describe('calculateGPA', () => {
    test('calculates GPA correctly for AA and BB grades', () => {
      const grades = [
        { letter_grade: 'AA', akts: 3 }, // 4.0 * 3 = 12 points
        { letter_grade: 'BB', akts: 4 }  // 3.0 * 4 = 12 points
      ]
      // Total: 24 points, 7 credits
      // GPA: 24 / 7 = 3.428...
      
      const gpa = calculateGPA(grades)
      expect(gpa).toBeCloseTo(3.43, 2)
    })

    test('calculates GPA correctly for mixed grades', () => {
      const grades = [
        { letter_grade: 'AA', akts: 3 }, // 4.0 * 3 = 12
        { letter_grade: 'BA', akts: 4 }, // 3.5 * 4 = 14
        { letter_grade: 'CC', akts: 2 }  // 2.0 * 2 = 4
      ]
      // Total: 30 points, 9 credits
      // GPA: 30 / 9 = 3.33...
      
      const gpa = calculateGPA(grades)
      expect(gpa).toBeCloseTo(3.33, 2)
    })

    test('returns 0 for empty grades array', () => {
      const gpa = calculateGPA([])
      expect(gpa).toBe(0)
    })

    test('handles FF grades (counts as 0 points)', () => {
      const grades = [
        { letter_grade: 'AA', akts: 3 }, // 4.0 * 3 = 12
        { letter_grade: 'FF', akts: 4 }  // 0.0 * 4 = 0
      ]
      // Total: 12 points, 7 credits
      // GPA: 12 / 7 = 1.71...
      
      const gpa = calculateGPA(grades)
      expect(gpa).toBeCloseTo(1.71, 2)
    })

    test('handles courses with 0 ECTS credits', () => {
      const grades = [
        { letter_grade: 'AA', akts: 0 }, // 4.0 * 0 = 0
        { letter_grade: 'BB', akts: 4 }  // 3.0 * 4 = 12
      ]
      // Total: 12 points, 4 credits
      // GPA: 12 / 4 = 3.0
      
      const gpa = calculateGPA(grades)
      expect(gpa).toBe(3.0)
    })

    test('returns 0 when all credits are 0', () => {
      const grades = [
        { letter_grade: 'AA', akts: 0 },
        { letter_grade: 'BB', akts: 0 }
      ]
      
      const gpa = calculateGPA(grades)
      expect(gpa).toBe(0)
    })

    test('handles all grade types correctly', () => {
      const grades = [
        { letter_grade: 'AA', akts: 1 }, // 4.0
        { letter_grade: 'BA', akts: 1 }, // 3.5
        { letter_grade: 'BB', akts: 1 }, // 3.0
        { letter_grade: 'CB', akts: 1 }, // 2.5
        { letter_grade: 'CC', akts: 1 }, // 2.0
        { letter_grade: 'DC', akts: 1 }, // 1.5
        { letter_grade: 'DD', akts: 1 }, // 1.0
        { letter_grade: 'FF', akts: 1 }  // 0.0
      ]
      // Total: 17.5 points, 8 credits
      // GPA: 17.5 / 8 = 2.1875
      
      const gpa = calculateGPA(grades)
      expect(gpa).toBeCloseTo(2.19, 2)
    })
  })
})
