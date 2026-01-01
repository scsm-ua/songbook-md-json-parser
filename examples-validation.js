#!/usr/bin/env node

// Example usage of the validation API

const { 
    validateSong, 
    validateSongFile, 
    formatValidationResults 
} = require('./index');

console.log('=== Songbook Validation Examples ===\n');

// Example 1: Validate a JSON object
console.log('1. Validating a JSON object:');
const validSong = {
    meta: { page: 1, first_line: "test song" },
    title: ["Test Song"],
    verses: [
        { number: "1", text: ["line 1", "line 2"] }
    ]
};

const result1 = validateSong(validSong);
const console.log(`   Result: ${result1.valid ? '✅ Valid' : '❌ Invalid'}\n`);

// Example 2: Invalid JSON (missing required field)
console.log('2. Validating invalid JSON (missing verses):');
const invalidSong = {
    meta: { page: 1, first_line: "test" },
    title: ["Test"]
    // missing verses!
};

const result2 = validateSong(invalidSong);
const console.log(`   Result: ${result2.valid ? '✅ Valid' : '❌ Invalid'}`);
if (!result2.valid) {
    result2.errors.forEach(err => {
        console.log(`   Error: ${err.path} - ${err.message}`);
    });
}
console.log();

// Example 3: Validate a file
console.log('3. Validating example file:');
const result3 = validateSongFile('./example/json/akrodha-paramananda.json');
console.log(`   File: ${result3.file}`);
console.log(`   Result: ${result3.valid ? '✅ Valid' : '❌ Invalid'}\n`);

// Example 4: Validate directory
console.log('4. Validating directory:');
const results = validateDirectory('./example/json');
console.log(formatValidationResults(results));

console.log('=== Examples Complete ===');
