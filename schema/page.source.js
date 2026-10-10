/**
 * Page Model Schema
 * This is a simplified source schema that can be converted to JSON Schema
 */

/**
 * Meta Schema - Page metadata
 */
const MetaSchema = {
  page: {
    description: 'Page number(s) in the songbook',
    type: [Number, String, [Number]],
    examples: [42, '11/2', [10, 15]]
  },
  title: {
    description: 'Page title',
    type: String,
    required: true
  },
  first_line: {
    description: 'First line of the page (used for the index)',
    type: String
  }
};

/**
 * Main Page Schema
 */
const PageSchema = {
  // Meta object - optional
  meta: {
    description: 'Metadata about the page',
    type: MetaSchema
  },

  // Body - required, arbitrary markdown as a single string
  body: {
    description: 'Page body as markdown',
    type: String,
    required: true
  }
};

module.exports = PageSchema;
