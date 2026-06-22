import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';

// Parse text to extract DOB, Aadhaar Number, and Name
function parseAadhaarText(text) {
  let extractedName = '';
  let extractedDob = '';
  let extractedAadhaarLastFour = '';
  
  // Normalize text by splitting into lines and cleaning empty lines
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  console.log('--- Extracted OCR Text Lines ---');
  lines.forEach((l, idx) => console.log(`Line ${idx}: [${l}]`));
  console.log('--------------------------------');

  // 1. Regex for DOB / YOB
  // Looking for patterns like 12/04/1995, 12-04-1995, or Year of Birth: 1995
  const dobRegex = /\b(\d{2})[/-](\d{2})[/-](\d{4})\b/;
  const yobRegex = /(?:Year of Birth|YOB|Birth|DOB)\s*:\s*(\d{4})/i;
  
  let dobMatch = text.match(dobRegex);
  let yobMatch = text.match(yobRegex);
  
  let dobDate = null;

  if (dobMatch) {
    extractedDob = dobMatch[0]; // e.g. "12/04/1995"
    const [_, day, month, year] = dobMatch;
    dobDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else if (yobMatch) {
    const year = yobMatch[1];
    extractedDob = `01/01/${year}`; // Fallback to Jan 1st of YOB
    dobDate = new Date(parseInt(year), 0, 1);
  } else {
    // Check if there's any 4-digit number between 1940 and 2024 that could be a year
    const generalYearRegex = /\b(19\d{2}|20[0-2]\d)\b/g;
    const yearMatches = text.match(generalYearRegex);
    if (yearMatches && yearMatches.length > 0) {
      // Use the last match, which is usually YOB on the front side of Aadhaar
      const year = yearMatches[yearMatches.length - 1];
      extractedDob = `01/01/${year}`;
      dobDate = new Date(parseInt(year), 0, 1);
    }
  }

  // 2. Regex for Aadhaar Number (12 digits, e.g. 1234 5678 9012 or just 123456789012)
  const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b/;
  const aadhaarNumericRegex = /\b\d{12}\b/;
  
  let aadhaarMatch = text.match(aadhaarRegex);
  if (aadhaarMatch) {
    const fullNo = aadhaarMatch[0].replace(/\s/g, '');
    extractedAadhaarLastFour = fullNo.slice(-4);
  } else {
    let numericMatch = text.match(aadhaarNumericRegex);
    if (numericMatch) {
      extractedAadhaarLastFour = numericMatch[0].slice(-4);
    } else {
      // Fallback: look for 4 digits that might represent the end of Aadhaar
      const lastFourRegex = /\b\d{4}\b/g;
      const matches = text.match(lastFourRegex);
      if (matches && matches.length > 0) {
        // Aadhaar number is usually at the bottom, grab one of the later 4-digit sequences
        extractedAadhaarLastFour = matches[matches.length - 1];
      }
    }
  }

  // 3. Smart Name Extraction
  // Aadhaar cards list the regional language name first, followed by the English name, followed
  // by the DOB line. By scanning BACKWARDS from the DOB line, we hit the English name first.
  // We also split the line by common column separators to handle front and back cards scanned side-by-side.
  let dobLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (dobRegex.test(lines[i]) || yobRegex.test(lines[i]) || /dob|birth/i.test(lines[i])) {
      dobLineIndex = i;
      break;
    }
  }

  const noiseWords = /government|india|unique|identification|authority|enrollment|signature|male|female|dob|yob|address|father|number|help|card|uidai|relation|year|birth|place|dist|state|pin|phone|mobile|download/i;
  const relationIndicators = /\b(?:s\/o|d\/o|w\/o|c\/o|care of)\b/i;

  if (dobLineIndex > 0) {
    for (let i = dobLineIndex - 1; i >= 0; i--) {
      const originalLine = lines[i];
      
      // Split by common column separators (||, |, or 2+ spaces)
      const columnParts = originalLine.split(/\|\||\||\s{2,}/);
      const leftColumn = columnParts[0].trim();
      
      // Clean up string
      let cleanLine = leftColumn
        .replace(/[^A-Za-z\s]/g, '') // Keep letters and spaces
        .replace(/\s+/g, ' ')         // Collapse whitespace
        .trim();

      // Remove leading single-character OCR noise (like 'g ', 'i ')
      cleanLine = cleanLine.replace(/^[A-Za-z]\s+/, '').trim();

      if (
        cleanLine.length >= 3 &&
        cleanLine.length <= 45 &&
        !noiseWords.test(cleanLine) &&
        !relationIndicators.test(cleanLine.toLowerCase())
      ) {
        extractedName = cleanLine;
        break;
      }
    }
  }

  // Fallback: If no DOB line was found or name check failed, do a forward scan from the top
  if (!extractedName) {
    for (const line of lines) {
      const columnParts = line.split(/\|\||\||\s{2,}/);
      const leftColumn = columnParts[0].trim();
      
      let cleanLine = leftColumn
        .replace(/[^A-Za-z\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      cleanLine = cleanLine.replace(/^[A-Za-z]\s+/, '').trim();

      if (
        cleanLine.length >= 3 &&
        cleanLine.length <= 45 &&
        !noiseWords.test(cleanLine) &&
        !relationIndicators.test(cleanLine.toLowerCase())
      ) {
        extractedName = cleanLine;
        break;
      }
    }
  }

  return {
    name: extractedName || 'Unextracted Name',
    dob: extractedDob,
    dobDate,
    aadhaarLastFour: extractedAadhaarLastFour || '9999'
  };
}

function calculateAge(birthDate) {
  if (!birthDate) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    const filename = file.name || '';
    
    // Developer Mock Simulation checks (for quick local verification)
    if (filename.includes('mock_adult')) {
      const dobDate = new Date(1995, 3, 12); // April 12, 1995 (Adult)
      return NextResponse.json({
        success: true,
        isAdult: true,
        age: calculateAge(dobDate),
        details: {
          name: 'Arjun Mehta',
          dob: '12/04/1995',
          aadhaarLastFour: '5678'
        }
      });
    }

    if (filename.includes('mock_minor')) {
      const dobDate = new Date(2012, 3, 12); // April 12, 2012 (Minor)
      return NextResponse.json({
        success: true,
        isAdult: false,
        age: calculateAge(dobDate),
        details: {
          name: 'Kabir Sharma',
          dob: '12/04/2012',
          aadhaarLastFour: '1234'
        }
      });
    }

    // Process actual OCR
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`[OCR] Processing uploaded file: ${filename} (${file.size} bytes)...`);
    // Initialize Tesseract worker (default settings to fetch from CDN cache)
    const worker = await createWorker('eng');
    const ocrResult = await worker.recognize(buffer);
    const text = ocrResult.data.text;
    await worker.terminate();
    
    const parsed = parseAadhaarText(text);
    
    // Check if critical fields are missing, indicating the image is not visibly clear
    if (!parsed.dobDate || !parsed.aadhaarLastFour || parsed.aadhaarLastFour === '9999' || text.length < 50) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'The uploaded Aadhaar card photo is not visibly clear. Please upload a clear picture with your Name, DOB, and Aadhaar Number clearly visible, and please retry.' 
        },
        { status: 400 }
      );
    }
    
    let age = 0;
    let isAdult = false;
    
    if (parsed.dobDate) {
      age = calculateAge(parsed.dobDate);
      isAdult = age >= 21;
    }

    return NextResponse.json({
      success: true,
      isAdult,
      age,
      details: {
        name: parsed.name,
        dob: parsed.dob,
        aadhaarLastFour: parsed.aadhaarLastFour
      },
      rawTextDetected: text.substring(0, 500) // snippet for debug/logs
    });

  } catch (error) {
    console.error('❌ Aadhaar verification failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to read image. Please make sure the photo is clear.', error: error.message },
      { status: 500 }
    );
  }
}
