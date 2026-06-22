const { createWorker } = require('tesseract.js');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Starting OCR test...');
  try {
    const worker = await createWorker('eng', 1, {
      langPath: path.join(__dirname, '..'), // points to the workspace root directory containing eng.traineddata
      gzip: false,
      logger: m => console.log('Tesseract log:', m)
    });

    console.log('Worker created successfully!');
    
    // Test on a mock image or a dummy buffer if we don't have an image
    // Let's create a 1x1 blank image buffer or load a file
    const imagePath = path.join(__dirname, '..', 'WhatsApp Image 2026-05-11 at 20.05.46.jpeg');
    if (fs.existsSync(imagePath)) {
      console.log('Running OCR on WhatsApp Image...');
      const { data: { text } } = await worker.recognize(imagePath);
      console.log('Extracted text successfully!');
      console.log('--- Text Output ---');
      console.log(text.substring(0, 300));
      console.log('-------------------');
    } else {
      console.log('Test image not found, but worker was initialized successfully.');
    }

    await worker.terminate();
    console.log('Worker terminated successfully!');
  } catch (error) {
    console.error('Error during OCR execution:', error);
  }
}

run();
