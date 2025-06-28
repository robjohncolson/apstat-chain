import * as fs from 'fs';
import * as path from 'path';

// Define the paths
const QUESTIONS_IMAGES_DIR = path.join(process.cwd(), 'apps/ui/public/questions');
const QUESTIONS_JSON_PATH = path.join(process.cwd(), 'packages/data/src/questions_export.json');

interface Question {
  id: number;
  questionImage: string;
  year: number;
  source: string;
  linkedLessonIds: string[];
}

function sanitizeFilename(filename: string): string {
  // Replace all spaces with underscores
  return filename.replace(/\s+/g, '_');
}

function main() {
  console.log('🚀 Starting filename sanitization process...');
  console.log(`📁 Images directory: ${QUESTIONS_IMAGES_DIR}`);
  console.log(`📄 JSON file: ${QUESTIONS_JSON_PATH}`);
  
  // Read and parse the JSON data
  console.log('\n📖 Reading questions_export.json...');
  const jsonData = JSON.parse(fs.readFileSync(QUESTIONS_JSON_PATH, 'utf8'));
  const questions: Question[] = jsonData;
  
  console.log(`✅ Found ${questions.length} questions to process\n`);
  
  let renamedCount = 0;
  let skippedCount = 0;
  
  // Iterate through each question
  for (const question of questions) {
    const currentImagePath = question.questionImage;
    
    // Extract the filename from the path (e.g., "/questions/unit1/filename.png" -> "filename.png")
    const pathParts = currentImagePath.split('/');
    const originalFilename = pathParts[pathParts.length - 1];
    
    // Create sanitized filename
    const sanitizedFilename = sanitizeFilename(originalFilename);
    
    // Check if sanitization is needed
    if (originalFilename === sanitizedFilename) {
      console.log(`⏭️  Skipping: ${originalFilename} (already sanitized)`);
      skippedCount++;
      continue;
    }
    
    // Build full file paths
    const unitDir = pathParts[pathParts.length - 2]; // e.g., "unit1"
    const oldFilePath = path.join(QUESTIONS_IMAGES_DIR, unitDir, originalFilename);
    const newFilePath = path.join(QUESTIONS_IMAGES_DIR, unitDir, sanitizedFilename);
    
    try {
      // Check if the original file exists
      if (!fs.existsSync(oldFilePath)) {
        console.log(`⚠️  File not found: ${oldFilePath}`);
        continue;
      }
      
      // Check if the target filename already exists
      if (fs.existsSync(newFilePath)) {
        console.log(`⚠️  Target file already exists: ${newFilePath}`);
        continue;
      }
      
      // Rename the physical file
      fs.renameSync(oldFilePath, newFilePath);
      console.log(`✅ Renamed: ${originalFilename} → ${sanitizedFilename}`);
      
      // Update the JSON object
      pathParts[pathParts.length - 1] = sanitizedFilename;
      question.questionImage = pathParts.join('/');
      
      renamedCount++;
      
    } catch (error) {
      console.error(`❌ Error renaming ${originalFilename}:`, error);
    }
  }
  
  // Write the updated JSON data back to file
  console.log(`\n💾 Writing updated JSON data back to file...`);
  fs.writeFileSync(QUESTIONS_JSON_PATH, JSON.stringify(questions, null, 2), 'utf8');
  
  console.log('\n🎉 Filename sanitization complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Files renamed: ${renamedCount}`);
  console.log(`   - Files skipped: ${skippedCount}`);
  console.log(`   - Total processed: ${questions.length}`);
}

// Run the script
main(); 