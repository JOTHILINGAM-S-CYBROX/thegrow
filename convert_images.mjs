import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.join(process.cwd(), 'public');

async function processDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        console.log(`Processing: ${fullPath}`);
        
        try {
          // Convert to WebP
          const webpPath = fullPath.substring(0, fullPath.lastIndexOf('.')) + '.webp';
          
          await sharp(fullPath)
            .webp({ quality: 80 })
            .toFile(webpPath);
            
          console.log(`Successfully converted to WebP: ${webpPath}`);
          
          // Delete original file
          await fs.unlink(fullPath);
          console.log(`Deleted original: ${fullPath}`);
        } catch (error) {
          console.error(`Failed to process ${fullPath}:`, error);
        }
      }
    }
  }
}

async function main() {
  console.log('Starting image conversion process...');
  await processDirectory(publicDir);
  console.log('Image conversion complete!');
}

main().catch(console.error);
