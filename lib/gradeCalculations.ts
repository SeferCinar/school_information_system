/**
 * Pure calculation functions for grades
 * These functions don't depend on database or external services
 * They can be easily unit tested without mocking
 */

// Letter grade calculation based on weighted average
// Midterm 40% + Final 60% (or based on exam percentages)
export function calculateLetterGrade(examScores: Record<string, number>, examPercentages: Record<string, number>): string {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const [examType, score] of Object.entries(examScores)) {
    const percentage = examPercentages[examType] || 0;
    totalWeightedScore += score * (percentage / 100);
    totalWeight += percentage / 100;
  }

  if (totalWeight === 0) return 'FF';

  const finalScore = totalWeightedScore / totalWeight;

  // Turkish grading system
  if (finalScore >= 90) return 'AA';
  if (finalScore >= 85) return 'BA';
  if (finalScore >= 80) return 'BB';
  if (finalScore >= 75) return 'CB';
  if (finalScore >= 70) return 'CC';
  if (finalScore >= 65) return 'DC';
  if (finalScore >= 60) return 'DD';
  return 'FF';
}

// GPA calculation (4.0 scale)
export function calculateGPA(grades: Array<{ letter_grade: string; akts: number }>): number {
  const gradePoints: Record<string, number> = {
    'AA': 4.0,
    'BA': 3.5,
    'BB': 3.0,
    'CB': 2.5,
    'CC': 2.0,
    'DC': 1.5,
    'DD': 1.0,
    'FF': 0.0,
  };

  let totalPoints = 0;
  let totalCredits = 0;

  for (const grade of grades) {
    const points = gradePoints[grade.letter_grade] || 0;
    const credits = grade.akts || 0;
    totalPoints += points * credits;
    totalCredits += credits;
  }

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}
