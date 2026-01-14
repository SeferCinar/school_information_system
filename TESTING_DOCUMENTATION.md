# Unit Testing Documentation

## Overview

This document describes the unit testing setup and implementation for the School Information System project. The testing framework uses **Jest** and **React Testing Library** to ensure code quality and reliability.

## Testing Framework Setup

### Dependencies Installed

```json
{
  "devDependencies": {
    "jest": "^30.2.0",
    "@testing-library/react": "^16.3.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/user-event": "^14.6.1",
    "jest-environment-jsdom": "^30.2.0",
    "ts-jest": "^29.4.6",
    "@types/jest": "^30.0.0"
  }
}
```

### Configuration Files

#### 1. `jest.config.js`
- Uses Next.js Jest integration (`next/jest`)
- Configures TypeScript support with `ts-jest`
- Sets up module path mapping (`@/` imports)
- Configures test environment as `jsdom` for React component testing
- Defines test file patterns and coverage collection

#### 2. `jest.setup.js`
- Imports `@testing-library/jest-dom` for custom matchers
- Mocks Next.js router and navigation hooks
- Mocks Next.js Link component
- Sets up test environment variables
- Mocks mongoose to avoid database connections in tests

### Test Scripts

Added to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Test Structure

### Test File Organization

```
__tests__/
├── gradeCalculations.test.ts      # Pure function tests (no mocking needed)
├── gradeActions.test.ts           # Server action tests
├── examActions.test.ts            # Exam action tests
└── components/
    ├── CourseListEnroled.test.tsx # Enrolled courses component
    └── Sidebar.test.tsx           # Sidebar navigation component
```

## Testing Patterns

### 1. Pure Function Tests

**File**: `__tests__/gradeCalculations.test.ts`

Pure calculation functions are tested without any mocking:
- `calculateLetterGrade()` - Tests grade calculation logic
- `calculateGPA()` - Tests GPA calculation with various scenarios

**Example**:
```typescript
test('calculates AA for score >= 90', () => {
  const examScores = { Midterm: 95, Final: 92 }
  const examPercentages = { Midterm: 40, Final: 60 }
  const grade = calculateLetterGrade(examScores, examPercentages)
  expect(grade).toBe('AA')
})
```

**Why Pure Functions?**
- No dependencies, making them easy to test
- Fast execution (no database or network calls)
- Reliable and predictable results
- Can be tested in isolation

### 2. Server Action Tests

**Files**: `__tests__/gradeActions.test.ts`, `__tests__/examActions.test.ts`

Server actions that interact with the database are tested with mocked models:

**Mocking Strategy**:
```typescript
// Mock database connection
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}))

// Mock mongoose models
jest.mock('@/models/Exam', () => ({
  find: jest.fn(),
  create: jest.fn(),
  aggregate: jest.fn(),
}))
```

**Example**:
```typescript
test('returns exams for a course and semester', async () => {
  const mockExams = [
    { _id: 'E001', lecture_code: 'CS101', exam_type: 'Midterm', percentage: 40 }
  ]

  ;(Exam.find as jest.Mock).mockReturnValue({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockExams),
    }),
  })

  const result = await getExams('CS101', 'Fall')
  expect(result.length).toBe(1)
})
```

### 3. React Component Tests

**Files**: `__tests__/components/*.test.tsx`

React components are tested using React Testing Library:

**Mocking Strategy**:
```typescript
// Mock server actions
jest.mock('@/actions/courseActions', () => ({
  getCourses: jest.fn().mockResolvedValue([...]),
}))

// Mock context
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'student' }, isLoading: false }),
}))
```

**Example**:
```typescript
test('renders sidebar for student', () => {
  ;(useAuth as jest.Mock).mockReturnValue(mockUseAuth('student'))
  render(<Sidebar />)
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
  expect(screen.getByText('My Courses')).toBeInTheDocument()
})
```

## Key Testing Concepts Applied

### 1. **Arrange-Act-Assert Pattern**
- **Arrange**: Set up test data and mocks
- **Act**: Execute the function/component
- **Assert**: Verify the expected outcome

### 2. **Mocking External Dependencies**
- Database connections are mocked to avoid actual DB calls
- Server actions are mocked in component tests
- Next.js specific features (router, Link) are mocked

### 3. **Async Testing**
- Use `async/await` for async functions
- Use `waitFor()` for component state updates
- Use `act()` to wrap state updates in React tests

### 4. **Test Isolation**
- Each test is independent
- `beforeEach()` clears mocks between tests
- No shared state between tests

## Test Coverage

### Current Coverage

- ✅ **Pure Functions**: Grade calculations (100% coverage)
  - Letter grade calculation with various score ranges
  - GPA calculation with different grade combinations
  - Edge cases (empty arrays, zero credits, all grade types)

- ✅ **Server Actions**: Grade and Exam actions
  - Grade entry and retrieval
  - Exam creation and listing
  - Total percentage calculations

- ✅ **React Components**: Sidebar and CourseListEnroled
  - Role-based navigation rendering
  - Component state management
  - User interaction handling

### Test Statistics

- **Total Test Suites**: 5
- **Total Tests**: 50+
- **Coverage Areas**: Pure Functions, Server Actions, React Components

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Running Specific Tests

```bash
# Run a specific test file
npm test gradeCalculations.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="calculateGPA"
```

## Best Practices Followed

1. **Test Naming**: Descriptive test names that explain what is being tested
2. **Test Organization**: Grouped related tests using `describe()` blocks
3. **Mock Management**: Properly set up and clear mocks between tests
4. **Assertions**: Clear and specific expectations
5. **Test Independence**: Each test can run in isolation
6. **Simple Tests**: Each test verifies one specific behavior

## Test Examples

### Pure Function Test Example

```typescript
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
})
```

### Component Test Example

```typescript
test('displays enrolled courses', async () => {
  await act(async () => {
    render(<CourseListEnroled />)
  })

  await waitFor(() => {
    expect(screen.getByText('CS101')).toBeInTheDocument()
    expect(screen.getByText('Introduction to Programming')).toBeInTheDocument()
  })
})
```

## Common Issues and Solutions

### Issue 1: Mongoose Chain Methods
**Problem**: `Exam.find().sort().lean()` not working in mocks

**Solution**: Mock the chain properly:
```typescript
(Exam.find as jest.Mock).mockReturnValue({
  sort: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(mockData),
  }),
})
```

### Issue 2: React State Updates
**Problem**: `act(...)` warnings in component tests

**Solution**: Wrap async operations in `act()`:
```typescript
await act(async () => {
  render(<Component />)
})
```

### Issue 3: Multiple Elements
**Problem**: `getByText()` finds multiple elements

**Solution**: Use more specific queries or `getAllByText()`:
```typescript
const elements = screen.getAllByText('Computer Engineering')
expect(elements.length).toBeGreaterThan(0)
```

## Architecture Decision: Pure Functions

We extracted pure calculation functions (`calculateLetterGrade`, `calculateGPA`) into a separate file (`lib/gradeCalculations.ts`) to:

1. **Enable Easy Testing**: Pure functions can be tested without mocking
2. **Improve Performance**: No database dependencies
3. **Better Separation**: Business logic separated from data access
4. **Reusability**: Functions can be used in multiple contexts

## Future Improvements

1. **Integration Tests**: Test complete user flows
2. **E2E Tests**: Test full application workflows
3. **Snapshot Testing**: For UI components
4. **Performance Tests**: Test with large datasets
5. **Accessibility Tests**: Ensure components are accessible

## Conclusion

The unit testing setup provides a solid foundation for maintaining code quality. The tests focus on:

- **Pure business logic** (grade calculations)
- **Critical server actions** (grade and exam management)
- **Key UI components** (navigation and course lists)

The tests are simple, focused, and demonstrate good testing practices suitable for a school project while being extensible for future development.

---

**Note**: These tests are designed to be comprehensive enough to demonstrate testing knowledge while remaining maintainable for a school project context.
