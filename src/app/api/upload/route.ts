import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { uploadImage, uploadMultipleImages } from '@/lib/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload - Upload image
export async function POST(request: Request) {
  try {
    console.log('Starting upload process...');
    const formData = await request.formData();
    const files = formData.getAll('files');

    console.log(`Received ${files.length} files`);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Convert files to base64 strings
    const base64Files = await Promise.all(
      files.map(async (file: any) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
        console.log(`Converted file type: ${file.type}`);
        return base64;
      })
    );

    console.log('Starting Cloudinary upload...');
    // Upload to Cloudinary
    const urls = await uploadMultipleImages(base64Files);
    console.log('Upload successful, URLs:', urls);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Detailed error in upload route:', error);
    return NextResponse.json(
      { error: 'Failed to upload files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Delete image
export async function DELETE(request: Request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'No public ID provided' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 