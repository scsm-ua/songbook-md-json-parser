const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

// Load the schemas
const schema = require('../schema/song.ajv-build.json');
const pageSchema = require('../schema/page.ajv-build.json');

// Initialize AJV with strict mode and all errors
const ajv = new Ajv({ 
  allErrors: true, 
  verbose: true,
  strict: false 
});
addFormats(ajv);

// Compile the schemas
const validate = ajv.compile(schema);
const validatePageSchema = ajv.compile(pageSchema);

/**
 * Runs a compiled AJV validator against data and normalizes the result
 * @param {Function} validateFn - Compiled AJV validator
 * @param {Object} data - The JSON data to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.throwOnError - If true, throws an error on validation failure
 * @returns {Object} Validation result { valid: boolean, errors: array|null }
 */
function runValidation(validateFn, data, options = {}) {
  const { throwOnError = false } = options;

  const valid = validateFn(data);

  if (!valid) {
    const errors = validateFn.errors;

    if (throwOnError) {
      const errorMessages = errors.map(err => {
        const path = err.instancePath || 'root';
        return `${path}: ${err.message}`;
      }).join('\n');

      throw new Error(`Validation failed:\n${errorMessages}`);
    }

    return {
      valid: false,
      errors: errors.map(err => ({
        path: err.instancePath || 'root',
        message: err.message,
        params: err.params,
        keyword: err.keyword
      }))
    };
  }

  return {
    valid: true,
    errors: null
  };
}

/**
 * Validates a JSON object against the song schema
 * @param {Object} data - The JSON data to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.throwOnError - If true, throws an error on validation failure
 * @returns {Object} Validation result { valid: boolean, errors: array|null }
 */
function validateSong(data, options = {}) {
  return runValidation(validate, data, options);
}

/**
 * Validates a JSON object against the page schema
 * @param {Object} data - The JSON data to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result { valid: boolean, errors: array|null }
 */
function validatePage(data, options = {}) {
  return runValidation(validatePageSchema, data, options);
}

/**
 * Validates a JSON file against the song schema
 * @param {string} filePath - Path to the JSON file
 * @param {Object} options - Validation options
 * @returns {Object} Validation result { valid: boolean, errors: array|null, file: string }
 */
function validateSongFile(filePath, options = {}) {
  try {
    const absolutePath = path.resolve(filePath);
    const content = fs.readFileSync(absolutePath, 'utf8');
    const data = JSON.parse(content);
    
    const result = validateSong(data, options);
    
    return {
      ...result,
      file: filePath
    };
  } catch (error) {
    return {
      valid: false,
      file: filePath,
      errors: [{
        path: 'file',
        message: error.message,
        keyword: 'fileError'
      }]
    };
  }
}

/**
 * Validates a JSON file against the page schema
 * @param {string} filePath - Path to the JSON file
 * @param {Object} options - Validation options
 * @returns {Object} Validation result { valid: boolean, errors: array|null, file: string }
 */
function validatePageFile(filePath, options = {}) {
  try {
    const absolutePath = path.resolve(filePath);
    const content = fs.readFileSync(absolutePath, 'utf8');
    const data = JSON.parse(content);

    const result = validatePage(data, options);

    return {
      ...result,
      file: filePath
    };
  } catch (error) {
    return {
      valid: false,
      file: filePath,
      errors: [{
        path: 'file',
        message: error.message,
        keyword: 'fileError'
      }]
    };
  }
}

/**
 * Validates all JSON files in a directory
 * @param {string} dirPath - Path to the directory containing JSON files
 * @param {Object} options - Validation options
 * @param {boolean} options.recursive - If true, searches subdirectories recursively
 * @param {boolean} options.throwOnError - If true, throws an error on validation failure
 * @param {string} options.pattern - Glob pattern for file matching (default: '*.json')
 * @param {string} options.type - Schema to validate against: 'song' (default) or 'page'
 * @returns {Object} Validation results { totalFiles: number, validFiles: number, invalidFiles: array }
 */
function validateDirectory(dirPath, options = {}) {
  const { recursive = false, throwOnError = false, pattern = '*.json', type = 'song' } = options;

  const fileValidator = type === 'page' ? validatePageFile : validateSongFile;

  const results = {
    totalFiles: 0,
    validFiles: 0,
    invalidFiles: []
  };
  
  function processDirectory(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory() && recursive) {
        processDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        results.totalFiles++;
        
        const result = fileValidator(fullPath, { throwOnError: false });
        
        if (result.valid) {
          results.validFiles++;
        } else {
          results.invalidFiles.push({
            file: fullPath,
            errors: result.errors
          });
        }
      }
    }
  }
  
  try {
    const absolutePath = path.resolve(dirPath);
    processDirectory(absolutePath);
    
    if (throwOnError && results.invalidFiles.length > 0) {
      const errorMessages = results.invalidFiles.map(item => {
        const errorsText = item.errors.map(err => 
          `  - ${err.path}: ${err.message}`
        ).join('\n');
        return `${item.file}:\n${errorsText}`;
      }).join('\n\n');
      
      throw new Error(`Validation failed for ${results.invalidFiles.length} file(s):\n\n${errorMessages}`);
    }
    
    return results;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Directory not found: ${dirPath}`);
    }
    throw error;
  }
}

/**
 * Pretty prints validation results
 * @param {Object} results - Results from validateDirectory
 * @returns {string} Formatted results
 */
function formatValidationResults(results) {
  const lines = [];
  
  lines.push(`\n📊 Validation Results:`);
  lines.push(`   Total files: ${results.totalFiles}`);
  lines.push(`   ✅ Valid: ${results.validFiles}`);
  lines.push(`   ❌ Invalid: ${results.invalidFiles.length}`);
  
  if (results.invalidFiles.length > 0) {
    lines.push(`\n❌ Invalid Files:\n`);
    
    results.invalidFiles.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.file}`);
      item.errors.forEach(err => {
        lines.push(`   • ${err.path}: ${err.message}`);
      });
      lines.push('');
    });
  }
  
  return lines.join('\n');
}

module.exports = {
  validateSong,
  validateSongFile,
  validatePage,
  validatePageFile,
  validateDirectory,
  formatValidationResults,
  schema,
  pageSchema
};
