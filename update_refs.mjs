import fs from 'fs/promises';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

async function processDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Process js, jsx, ts, tsx, css files
      if (['.js', '.jsx', '.ts', '.tsx', '.css'].includes(ext)) {
        await processFile(fullPath);
      }
    }
  }
}

async function processFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let hasChanges = false;
    
    // Use regex to find image paths that need changing
    // We look for patterns like .png, .jpg, .jpeg usually at the end of a string or URL
    const regex = /(\.png|\.jpg|\.jpeg)(?=['"`\s\?\)\]])/gi;
    
    const newContent = content.replace(regex, (match) => {
      hasChanges = true;
      return '.webp';
    });

    if (hasChanges) {
      await fs.writeFile(filePath, newContent, 'utf8');
      console.log(`Updated references in: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
  }
}

async function main() {
  console.log('Starting reference updates...');
  await processDirectory(srcDir);
  console.log('Reference updates complete!');
}

main().catch(console.error);
