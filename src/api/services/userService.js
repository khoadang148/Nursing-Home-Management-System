import apiClient from '../config/axiosConfig';

const userService = {
  /**
   * Cập nhật avatar cho user
   * @param {string} userId
   * @param {string} imageUri - Đường dẫn ảnh local
   * @returns {Promise}
   */
  updateAvatar: async (userId, imageUri) => {
    try {
      const formData = new FormData();
      // Lấy tên file từ uri
      const fileName = imageUri.split('/').pop();
      const fileType = fileName.split('.').pop();
      formData.append('avatar', {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`,
      });
      const response = await apiClient.patch(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật avatar thành công',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật avatar thất bại',
      };
    }
  },
};

export default userService; 