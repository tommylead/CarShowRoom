import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const { data, folder } = await request.json();
    
    if (!data) {
      return NextResponse.json({ error: 'Không có dữ liệu ảnh' }, { status: 400 });
    }

    // Upload ảnh lên Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(data, { folder }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    // Trả về URL của ảnh đã upload
    return NextResponse.json({ 
      url: (uploadResult as any).secure_url,
      public_id: (uploadResult as any).public_id
    });
  } catch (error) {
    console.error('Lỗi upload ảnh:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi upload ảnh' },
      { status: 500 }
    );
  }
} 