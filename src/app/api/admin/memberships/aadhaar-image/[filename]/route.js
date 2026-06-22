import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    // 1. Verify admin session cookie
    const adminToken = request.cookies.get('adminToken')?.value;
    if (adminToken !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Await params if required in newer Next.js versions (standard practice to await or directly destruct, since this is Next 16 we should destruct or await params. Here, we can await params just in case)
    const resolvedParams = await params;
    const { filename } = resolvedParams;

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required.' },
        { status: 400 }
      );
    }

    // Clean filename to prevent directory traversal attacks (extremely important for security!)
    const sanitizedFilename = path.basename(filename);
    const secureFilePath = path.join(process.cwd(), 'secure-memberships', sanitizedFilename);

    // 2. Check if file exists
    if (!fs.existsSync(secureFilePath)) {
      return NextResponse.json(
        { error: 'File not found.' },
        { status: 404 }
      );
    }

    // 3. Determine Content-Type based on extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.webp' || ext === '.webp') {
      contentType = 'image/jpeg';
    } else if (ext === '.webp') {
      contentType = 'image/png';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    }

    // 4. Read and return the file stream/buffer
    const fileBuffer = await fs.promises.readFile(secureFilePath);
    
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour locally
      },
    });

  } catch (error) {
    console.error('❌ Secure file server error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file.', details: error.message },
      { status: 500 }
    );
  }
}
