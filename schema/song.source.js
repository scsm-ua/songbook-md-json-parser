/**
 * Song Model Schema
 * This is a simplified source schema that can be converted to JSON Schema
 */

/**
 * Meta Schema - Song metadata
 */
const MetaSchema = {
  page: {
    description: 'Page number(s) in the songbook',
    type: [Number, String, [Number]],
    examples: [42, '11/2', [10, 15]]
  },
  first_line: {
    description: 'First line of the song',
    type: String,
    required: true
  },
  author: {
    description: 'Author of the song (single string in meta)',
    type: String
  },
  'no-author': {
    description: 'Flag indicating no author (value must be 1)',
    type: Number,
    enum: [1]
  },
  translation: {
    description: 'Translation status (only "no" is allowed)',
    type: String,
    enum: ['no']
  },
  'verse parentheses': {
    description: 'Formatting option for verse parentheses',
    type: String,
    enum: ['non bold']
  },
  'inline verse': {
    description: 'Formatting option for inline verses',
    type: String,
    enum: ['non bold']
  }
};

/**
 * Embed Schema - Audio/video embed
 */
const EmbedSchema = {
  title: {
    description: 'Title of the embed',
    type: String,
    required: true
  },
  embed_url: {
    description: 'URL of the embedded content',
    type: String,
    required: true
  },
  iframe_url: {
    description: 'URL for iframe embedding',
    type: String,
    required: true
  },
  embed_code: {
    description: 'HTML embed code',
    type: String,
    required: true
  }
};

/**
 * Verse Schema - Song verse
 */
const VerseSchema = {
  number: {
    description: 'Verse number',
    type: String
  },
  text: {
    description: 'Verse lines',
    type: [String],
    minItems: 1
  },
  word_by_word: {
    description: 'Word-by-word translation for this verse',
    type: [String]
  },
  translation: {
    description: 'Verse translation',
    type: [String]
  },
  subtitle: {
    description: 'Subtitle for this verse or section',
    type: [String]
  }
};

const CustomRules = {
  // Author requirement: must have root-level author OR (meta.author OR meta.no-author)
  anyOf: [
    {
      required: ['author']
    },
    {
      properties: {
        meta: {
          anyOf: [
            {
              required: ['author']
            },
            {
              required: ['no-author']
            }
          ]
        }
      }
    }
  ]
};

/**
 * Main Song Schema
 */
const SongSchema = {
  // Meta object - required
  meta: {
    description: 'Metadata about the song',
    type: MetaSchema,
    required: true
  },

  // Title array - required
  title: {
    description: 'Song title(s)',
    type: [String],
    required: true,
    minItems: 1
  },

  // Optional word_by_word for entire song
  word_by_word: {
    description: 'Word-by-word translation for the entire song',
    type: [String]
  },

  // Author array at root level - optional (but see authorRule in meta)
  author: {
    description: 'Author(s) of the song',
    type: [String]
  },

  // Subtitle array - optional
  subtitle: {
    description: 'Song subtitle(s)',
    type: [String]
  },

  // Embeds array - optional
  embeds: {
    description: 'Audio/video embeds for the song',
    type: [EmbedSchema]
  },

  // Verses array - required
  verses: {
    description: 'Song verses',
    type: [VerseSchema],
    required: true,
    minItems: 1
  },

  custom_rules: CustomRules
};

module.exports = SongSchema;
