const {validateSongFile} = require('./index');

const files = [
  './example/json/goswaminam-sudhirakhyam.json'
];

files.forEach(file => {
  const r = validateSongbookFile(file);
  console.log('\nFile:', file.split('/').pop());
  console.log('Valid:', r.valid);
  if (!r.valid) {
    r.errors.forEach(e => console.log('  ', e.path, ':', e.message));
  }
});
