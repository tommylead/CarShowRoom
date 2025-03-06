import { v2 as cloudinary } from 'cloudinary';

// Cấu hình Cloudinary với thông tin từ biến môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (file: string): Promise<string> => {
  try {
    console.log('Uploading single image to Cloudinary...');
    const result = await cloudinary.uploader.upload(file, {
      folder: 'car-showroom',
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    console.log('Upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Detailed error uploading to Cloudinary:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (files: string[]): Promise<string[]> => {
  try {
    console.log(`Starting upload of ${files.length} images...`);
    const uploadPromises = files.map(file => uploadImage(file));
    const urls = await Promise.all(uploadPromises);
    console.log('All uploads completed successfully');
    return urls;
  } catch (error) {
    console.error('Error in uploadMultipleImages:', error);
    throw error;
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    console.log(`Deleting image with publicId: ${publicId}`);
    await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export default cloudinary; 