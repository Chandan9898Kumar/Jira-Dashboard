#!/usr/bin/env node

/**
 * Test Runner Script
 * 
 * This script runs all tests with 100% coverage requirements.
 * It ensures industry-standard testing practices are followed.
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

const runCommand = (command, description) => {
  console.log(`\n🔄 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() })
    console.log(`✅ ${description} completed successfully`)
  } catch (error) {
    console.error(`❌ ${description} failed`)
    process.exit(1)
  }
}

const main = () => {
  console.log('🚀 Starting comprehensive test suite...')
  
  // Check if test files exist
  const testFiles = [
    'src/utils.test.ts',
    'src/schema/types.test.ts',
    'src/hooks/useTasks.test.ts',
    'src/hooks/useDragAndDrop.test.ts',
    'src/App.test.tsx',
    'src/main.test.tsx',
    'src/pages/Board.test.tsx',
    'src/pages/BoardColumn.test.tsx',
    'src/pages/TaskCard.test.tsx',
    'src/pages/TopBar.test.tsx',
    'src/pages/Sidebar.test.tsx',
    'src/pages/TaskModal.test.tsx',
    'src/pages/NotFound.test.tsx'
  ]

  console.log('\n📋 Checking test files...')
  testFiles.forEach(file => {
    if (existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - Missing`)
    }
  })

  // Run type checking
  runCommand('npm run type-check', 'Type checking')

  // Run linting
  runCommand('npm run lint', 'Linting')

  // Run tests with coverage
  runCommand('npm run test:coverage', 'Running tests with coverage')

  console.log('\n🎉 All tests completed successfully!')
  console.log('📊 Coverage report generated in coverage/ directory')
  console.log('🔍 Open coverage/index.html to view detailed coverage report')
}

main()