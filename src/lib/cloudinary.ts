import { v2 as cloudinary } from 'cloudinary';

// Cấu hình cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Tải hình ảnh lên Cloudinary
 * @param file File đã được chuyển thành dạng base64
 * @param folder Thư mục lưu trữ trên Cloudinary
 * @returns Đường dẫn hình ảnh đã tải lên
 */
export const uploadImage = async (
  file: string,
  folder = 'car-showroom'
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
        { width: 1200, crop: 'limit' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên Cloudinary:', error);
    throw new Error('Không thể tải ảnh lên. Vui lòng thử lại sau.');
  }
};

/**
 * Tải nhiều hình ảnh lên Cloudinary
 * @param files Mảng các file đã được chuyển thành dạng base64
 * @param folder Thư mục lưu trữ trên Cloudinary
 * @returns Mảng đường dẫn hình ảnh đã tải lên
 */
export const uploadMultipleImages = async (
  files: string[],
  folder = 'car-showroom'
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Lỗi khi tải nhiều ảnh lên Cloudinary:', error);
    throw new Error('Không thể tải một số ảnh lên. Vui lòng thử lại sau.');
  }
};

/**
 * Xóa hình ảnh trên Cloudinary
 * @param publicId ID công khai của hình ảnh cần xóa (ví dụ: car-showroom/xyz123)
 * @returns Kết quả xóa hình ảnh
 */
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa ảnh từ Cloudinary:', error);
    return false;
  }
};

export default cloudinary; 