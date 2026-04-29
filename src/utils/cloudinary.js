
// Cloudinary credentials for Web
const CLOUDINARY_CLOUD_NAME = 'dc8suuh6h';
const CLOUDINARY_UPLOAD_PRESET = 'Smartbin';

export const uploadToCloudinary = async (fileOrDataUrl) => {
  try {
    const formData = new FormData();
    formData.append('file', fileOrDataUrl);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'smartbin_faceid');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
