import { getImageUri, APP_CONFIG } from '../config/appConfig';

const DEFAULT_AVATAR = APP_CONFIG.DEFAULT_AVATAR;

/**
 * Helper function để format avatar URI cho cả link và file upload
 * @param {string} avatar - Avatar path hoặc URI
 * @returns {string} - URI đã được format để hiển thị
 */
export const getAvatarUri = (avatar) => {
  if (!avatar) return DEFAULT_AVATAR;
  
  // Nếu là file URI từ điện thoại (bắt đầu bằng file:// hoặc content://)
  if (avatar.startsWith('file://') || avatar.startsWith('content://')) {
    return avatar;
  }
  
  // Nếu là URL từ server
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // Nếu là path tương đối, sử dụng getImageUri
  return getImageUri(avatar, 'avatar') || DEFAULT_AVATAR;
};

/**
 * Helper function để format image URI cho hình ảnh khác
 * @param {string} imagePath - Image path hoặc URI
 * @returns {string} - URI đã được format để hiển thị
 */
export const getImageUriHelper = (imagePath) => {
  if (!imagePath) return null;
  
  // Nếu là file URI từ điện thoại
  if (imagePath.startsWith('file://') || imagePath.startsWith('content://')) {
    return imagePath;
  }
  
  // Nếu là URL từ server
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Nếu là path tương đối, sử dụng getImageUri
  return getImageUri(imagePath, 'image');
}; 