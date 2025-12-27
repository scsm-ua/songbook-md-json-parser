const fs = require('fs');
const path = require('path');

function processFiles({ inputDir, outputDir, inExt, outExt, processContent }) {
    // Ensure directory exists.
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.readdir(inputDir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
    
        const filteredFiles = files.filter(file => path.extname(file) === inExt);
        
        console.log(`Found ${filteredFiles.length} files to process`);
    
        filteredFiles.forEach(file => {
            const filePath = path.join(inputDir, file);
            const fileName = path.basename(file, inExt);
            const outputPath = path.join(outputDir, `${fileName}${outExt}`);
    
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                
                const out = processContent(content);
                
                fs.writeFileSync(outputPath, out, 'utf8');
                
                console.log(`✓ Processed: ${file} -> ${fileName}${outExt}`);
                
            } catch (error) {
                console.error(`✗ Error processing ${file}:`, error.message);
            }
        });
    
        console.log('\nProcessing complete!');
    });
}

module.exports = { processFiles };

