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
  alt_first_lines: {
    description: 'Alternative first line(s) of the song',
    type: [String, [String]]
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
    enum: ['no', 'auto']
  },
  translator: {
    description: 'Translator(s) of the song',
    type: [String, [String]]
  },
  version: {
    description: 'Version of the document',
    type: String
  },
  styles: {
    description: 'Optional styling options for the song',
    type: {
      verses: {
        description: 'Styling options for verses',
        type: {
          wide: {
            description: 'When false, disables auto wide layout for long-line verses',
            type: Boolean
          },
          align: {
            description: 'When "left", forces left alignment without left margin for wide verses that are not wide enough for auto detection',
            type: String,
            enum: ['left']
          },
          inline: {
            description: 'Treat verses without numbers as inline translation quotations; hidden in "hide translation" mode',
            type: {
              bold: {
                description: 'When false, inline verses are rendered non bold',
                type: Boolean
              }
            }
          }
        }
      }
    }
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

const AuthorRules = {
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

  // Verses array - required
  verses: {
    description: 'Song verses',
    type: [VerseSchema],
    required: true,
    minItems: 1
  },

  custom_rules: AuthorRules
};

module.exports = SongSchema;
