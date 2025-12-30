const fs = require('fs');
const path = require('path');

function processFiles({ inputDir, outputDir, inExt, outExt, processContent }) {
    // Ensure directory exists.
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    try {
        const files = fs.readdirSync(inputDir);
        const filteredFiles = files.filter(file => path.extname(file) === inExt);
        
        console.log(`Found ${filteredFiles.length} files to process`);
    
        filteredFiles.forEach(file => {
            const filePath = path.join(inputDir, file);
            const fileName = path.basename(file, inExt);
            const outputPath = path.join(outputDir, `${fileName}${outExt}`);
    
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                
                const out = processContent(content, { fileName });
                
                fs.writeFileSync(outputPath, out, 'utf8');
                
                // console.log(`✓ Processed: ${file} -> ${fileName}${outExt}`);
                
            } catch (error) {
                console.error(`✗ Error processing ${file}:`, error.message);
            }
        });
    
        console.log('Processing complete!');
    } catch (err) {
        console.error('Error reading directory:', err);
        throw err;
    }
}

module.exports = { processFiles };

