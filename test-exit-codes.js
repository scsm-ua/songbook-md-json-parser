#!/usr/bin/env node

/**
 * Test script to verify validation exit codes
 * This tests that the validator properly exits with code 1 on errors
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing validation exit codes...\n');

const tests = [
  {
    name: 'Valid songs (test-fixtures/valid-songs)',
    dir: './test-fixtures/valid-songs',
    type: 'song',
    shouldPass: true
  },
  {
    name: 'Invalid songs (test-fixtures/invalid-songs)',
    dir: './test-fixtures/invalid-songs',
    type: 'song',
    shouldPass: false
  },
  {
    name: 'Valid pages (test-fixtures/valid-pages)',
    dir: './test-fixtures/valid-pages',
    type: 'page',
    shouldPass: true
  },
  {
    name: 'Invalid pages (test-fixtures/invalid-pages)',
    dir: './test-fixtures/invalid-pages',
    type: 'page',
    shouldPass: false
  }
];

let allTestsPassed = true;

for (const test of tests) {
  process.stdout.write(`Testing: ${test.name}... `);
  
  const typeFlag = test.type ? ` --type ${test.type}` : '';
  
  try {
    execSync(`node validate.js ${test.dir}${typeFlag}`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    // If we get here, the command exited with code 0
    if (test.shouldPass) {
      console.log('✅ PASS (exit code 0)');
    } else {
      console.log('❌ FAIL (expected exit code 1, got 0)');
      allTestsPassed = false;
    }
  } catch (error) {
    // Command exited with non-zero code
    if (!test.shouldPass) {
      console.log('✅ PASS (exit code 1)');
    } else {
      console.log('❌ FAIL (expected exit code 0, got 1)');
      console.log('Error output:', error.stdout || error.stderr);
      allTestsPassed = false;
    }
  }
}

console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('✅ All exit code tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some exit code tests failed!');
  process.exit(1);
}
