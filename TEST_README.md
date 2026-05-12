# Jira Dashboard - Test Suite

This project includes a comprehensive test suite with 100% code coverage following industry standards.

## Test Structure

### Test Files Created

1. **Utils Tests** (`src/utils.test.ts`)
   - Tests all utility functions: `initials`, `colorFor`, `seedTasks`, `nextTaskKey`, `typeGlyph`
   - Covers edge cases and error handling
   - Tests constants and storage keys

2. **Schema Tests** (`src/schema/types.test.ts`)
   - Validates type definitions and constants
   - Tests `COLUMNS`, `ASSIGNEES`, `PRIORITY_LABEL`
   - Ensures type safety and data integrity

3. **Hook Tests**
   - `src/hooks/useTasks.test.ts` - Complete task management logic
   - `src/hooks/useDragAndDrop.test.ts` - Drag and drop interactions

4. **Component Tests**
   - `src/App.test.tsx` - Routing and lazy loading
   - `src/main.test.tsx` - React root and service worker
   - `src/pages/Board.test.tsx` - Main board component
   - `src/pages/BoardColumn.test.tsx` - Column component
   - `src/pages/TaskCard.test.tsx` - Task card component
   - `src/pages/TopBar.test.tsx` - Filter and search functionality
   - `src/pages/Sidebar.test.tsx` - Navigation component
   - `src/pages/TaskModal.test.tsx` - Task creation/editing modal
   - `src/pages/NotFound.test.tsx` - 404 page with SEO features

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
- 100% coverage thresholds for branches, functions, lines, and statements
- JSdom environment for React component testing
- Proper path aliases matching the main project
- Coverage exclusions for non-testable files

### Test Setup (`src/test/setup.ts`)
- Global test utilities and mocks
- localStorage and crypto mocking
- Service worker mocking
- Console method mocking for clean test output

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Comprehensive Test Suite
```bash
node run-tests.mjs
```

## Coverage Requirements

The test suite enforces 100% coverage across:
- **Branches**: 100% - All conditional paths tested
- **Functions**: 100% - Every function called in tests
- **Lines**: 100% - Every line of code executed
- **Statements**: 100% - Every statement covered

## Test Categories

### Unit Tests
- Individual function testing
- Component isolation testing
- Hook behavior testing

### Integration Tests
- Component interaction testing
- Hook integration with components
- Router integration testing

### Accessibility Tests
- ARIA attributes validation
- Keyboard navigation testing
- Screen reader compatibility

### User Interaction Tests
- Click events and form submissions
- Drag and drop functionality
- Keyboard shortcuts and navigation

## Industry Standards Applied

### Testing Best Practices
1. **Arrange-Act-Assert** pattern
2. **Descriptive test names** explaining what is being tested
3. **Isolated tests** with proper setup/teardown
4. **Mock external dependencies** for reliable tests
5. **Test edge cases** and error conditions

### Accessibility Testing
1. **ARIA compliance** testing
2. **Keyboard navigation** validation
3. **Screen reader** compatibility
4. **Focus management** testing

### Performance Testing
1. **Component rendering** efficiency
2. **Memory leak** prevention
3. **Event handler** optimization

## Mock Strategy

### External Dependencies
- React Router navigation mocked
- localStorage operations mocked
- Service worker registration mocked
- Console methods mocked for clean output

### Component Mocking
- Child components mocked for isolation
- External utilities mocked for predictability
- Browser APIs mocked for consistency

## Coverage Report

After running tests with coverage, open `coverage/index.html` to view:
- Line-by-line coverage details
- Branch coverage visualization
- Function coverage statistics
- Uncovered code highlighting

## Continuous Integration

The test suite is designed to work with CI/CD pipelines:
- Fast execution for quick feedback
- Deterministic results for reliable builds
- Comprehensive coverage for quality assurance
- Clear error reporting for debugging

## Troubleshooting

### Common Issues
1. **Import path errors**: Ensure `@/` alias is configured in both Vite and Vitest configs
2. **Mock conflicts**: Clear mocks between tests using `vi.clearAllMocks()`
3. **Async test issues**: Use proper async/await patterns and `waitFor` utilities
4. **DOM cleanup**: Tests automatically clean up between runs

### Debug Mode
Run tests with debug output:
```bash
npm run test:watch -- --reporter=verbose
```

## Test Maintenance

### Adding New Tests
1. Follow existing naming conventions
2. Include proper setup/teardown
3. Test both happy path and edge cases
4. Maintain 100% coverage requirement

### Updating Tests
1. Update tests when changing functionality
2. Ensure coverage remains at 100%
3. Update mocks when external APIs change
4. Verify accessibility requirements still met