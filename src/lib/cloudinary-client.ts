/**
 * Upload một ảnh lên Cloudinary thông qua API route
 * Phiên bản này sử dụng cho client-side và không phụ thuộc vào thư viện cloudinary
 */
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  try {
    // Chuyển đổi file thành base64
    const base64data = await convertFileToBase64(file);
    
    // Upload lên Cloudinary qua API route
    const uploadResponse = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        data: base64data,
        folder: 'cars',
      }),
    });
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error || 'Lỗi khi upload ảnh');
    }
    
    const data = await uploadResponse.json();
    return data.url;
  } catch (error) {
    console.error('Lỗi upload ảnh:', error);
    throw error;
  }
};

/**
 * Chuyển đổi file thành chuỗi base64
 */
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}; 