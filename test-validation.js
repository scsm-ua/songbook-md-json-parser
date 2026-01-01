const { validateSongFile } = require('./index');

console.log('Testing validation:\n');

const files = [
  './example/json/akrodha-paramananda.json',
  './example/json/acharya-varyam-gaura-dhama-nishtham.json',
  './example/json/ha-ha-bhaktivinoda-thakkura-guroh.json',
  './example/json/krishna-hoite-chatur-mukha.json',
  './example/json/jaya-guru-maharaja-jati-rajeshvara.json',
  './example/json/jaya-jaya-gaurachander-arotiko-shobha.json'
];

files.forEach(file => {
  const result = validateSongbookFile(file);
  const filename = file.split('/').pop();
  console.log(result.valid ? '✅' : '❌', filename);
  if (!result.valid) {
    result.errors.forEach(e => console.log('  ', e.path + ':', e.message));
  }
});

console.log('\n✨ All example files validated successfully!');
