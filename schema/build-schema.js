#!/usr/bin/env node

/**
 * Convert song.source.js to song.ajv-build.json
 */

const fs = require('fs');
const path = require('path');

function convertType(typeValue) {
  // Handle array of multiple types (oneOf)
  if (Array.isArray(typeValue) && typeValue.length > 1) {
    const options = typeValue.map(t => {
      if (Array.isArray(t)) {
        // [Number] means array of numbers
        return {
          type: 'array',
          description: 'Multiple page numbers',
          items: { type: getSimpleType(t[0]) },
          minItems: 1
        };
      }
      const result = { type: getSimpleType(t) };
      // Add specific descriptions
      if (t === Number) {
        result.description = 'Single page number';
      } else if (t === String) {
        result.description = "Page number as string (e.g., '11/2')";
      }
      return result;
    });
    return { oneOf: options };
  }
  
  // Handle array type [String], [Number], etc.
  if (Array.isArray(typeValue) && typeValue.length === 1) {
    const itemType = typeValue[0];
    // Check if it's a schema object (not a primitive type constructor)
    if (typeof itemType === 'object' && itemType !== null && !itemType.name) {
      // Array of schema objects: type: [SchemaObject]
      return {
        type: 'array',
        items: convertObjectSchema(itemType)
      };
    }
    // Simple array: [String], [Number]
    return {
      type: 'array',
      items: { type: getSimpleType(itemType) }
    };
  }
  
  // Handle schema object reference
  if (typeof typeValue === 'object' && typeValue !== null && !typeValue.name) {
    return convertObjectSchema(typeValue);
  }
  
  // Simple type
  return { type: getSimpleType(typeValue) };
}

function getSimpleType(type) {
  const typeMap = {
    String: 'string',
    Number: 'number',
    Boolean: 'boolean',
    Object: 'object',
    Array: 'array'
  };
  
  const typeName = type?.name || type;
  return typeMap[typeName] || 'string';
}

function convertObjectSchema(schema) {
  const result = {
    type: 'object',
    properties: {}
  };
  
  const required = [];
  
  for (const [key, fieldDef] of Object.entries(schema)) {
    if (fieldDef.required) {
      required.push(key);
    }
    
    const propSchema = {};
    
    // Handle type
    if (fieldDef.type) {
      const typeResult = convertType(fieldDef.type);
      Object.assign(propSchema, typeResult);
    }
    
    // Add description
    if (fieldDef.description) {
      propSchema.description = fieldDef.description;
    }
    
    // Add enum
    if (fieldDef.enum) {
      propSchema.enum = fieldDef.enum;
    }
    
    // Add minItems for arrays
    if (fieldDef.minItems && propSchema.type === 'array') {
      propSchema.minItems = fieldDef.minItems;
    }
    
    result.properties[key] = propSchema;
  }
  
  if (required.length > 0) {
    result.required = required;
  }
  
  result.additionalProperties = false;
  
  return result;
}

function convertSourceToJsonSchema(sourceSchema) {
  const jsonSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://example.com/songbook.schema.json',
    title: 'Song',
    description: 'Schema for song JSON format',
    type: 'object',
    required: [],
    properties: {}
  };
  
  // Process fields
  for (const [fieldName, fieldDef] of Object.entries(sourceSchema)) {
    // Skip custom_rules - handle separately
    if (fieldName === 'custom_rules') {
      continue;
    }
    
    // Check if field is required at root level
    if (fieldDef.required) {
      jsonSchema.required.push(fieldName);
    }
    
    // Convert the field
    const propSchema = {};
    
    if (fieldDef.type) {
      const typeResult = convertType(fieldDef.type);
      Object.assign(propSchema, typeResult);
    }
    
    // Add description
    if (fieldDef.description) {
      propSchema.description = fieldDef.description;
    }
    
    // Add minItems for arrays
    if (fieldDef.minItems && propSchema.type === 'array') {
      propSchema.minItems = fieldDef.minItems;
    }
    
    jsonSchema.properties[fieldName] = propSchema;
  }
  
  // Handle custom_rules
  if (sourceSchema.custom_rules) {
    // Merge custom_rules into root level
    Object.assign(jsonSchema, sourceSchema.custom_rules);
  }
  
  jsonSchema.additionalProperties = false;
  
  return jsonSchema;
}

// Main execution
function main() {
  const sourcePath = path.join(__dirname, 'song.source.js');
  const outputPath = path.join(__dirname, 'song.ajv-build.json');
  
  console.log('📖 Reading source schema from:', sourcePath);
  
  // Clear require cache to get fresh version
  delete require.cache[require.resolve(sourcePath)];
  
  // Load the source schema
  const sourceSchema = require(sourcePath);
  
  console.log('🔄 Converting to JSON Schema...');
  
  // Convert to JSON Schema
  const jsonSchema = convertSourceToJsonSchema(sourceSchema);
  
  // Write to file
  fs.writeFileSync(
    outputPath,
    JSON.stringify(jsonSchema, null, 2),
    'utf8'
  );
  
  console.log('✅ JSON Schema generated:', outputPath);
  console.log('\n📊 Schema summary:');
  console.log(`   - Required fields: ${jsonSchema.required.length}`);
  console.log(`   - Total properties: ${Object.keys(jsonSchema.properties).length}`);
  console.log(`   - Custom rules: ${jsonSchema.anyOf ? 'anyOf validation present' : 'none'}`);
}

if (require.main === module) {
  main();
}

module.exports = { convertSourceToJsonSchema };
