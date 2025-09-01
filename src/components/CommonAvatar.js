import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { COLORS } from '../constants/theme';
import { getImageUri } from '../config/appConfig';

const CommonAvatar = ({ 
  source, 
  size = 40, 
  name = '', 
  style = {}, 
  textStyle = {},
  onError = null,
  onLoad = null,
  resizeMode = 'cover'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Reset error state when source changes
  React.useEffect(() => {
    setImageError(false);
    setImageLoading(false);
  }, [source]);

  // Helper function to get avatar URI using appConfig
  const getAvatarUri = (imagePath) => {
    if (!imagePath) return null;
    
    console.log('CommonAvatar - getAvatarUri input:', imagePath);
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('CommonAvatar - Full URL detected:', imagePath);
      return imagePath;
    }
    
    // For relative paths, use getImageUri but handle the default avatar case
    const uri = getImageUri(imagePath, 'avatar');
    console.log('CommonAvatar - getImageUri result:', uri);
    
    // If getImageUri returned the default avatar, return null instead
    // so we can show initials instead of default avatar
    if (uri === 'https://randomuser.me/api/portraits/men/1.jpg') {
      console.log('CommonAvatar - Default avatar detected, returning null');
      return null;
    }
    
    console.log('CommonAvatar - Final avatar URI:', uri);
    return uri;
  };

  // Get the URI from source
  const getUri = () => {
    if (typeof source === 'string') {
      return getAvatarUri(source);
    }
    if (source?.uri) {
      return getAvatarUri(source.uri);
    }
    return null;
  };

  const uri = getUri();
  const hasValidImage = uri && !imageError;

  // Get initials from name
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleImageError = (error) => {
    console.log('Avatar image error:', error.nativeEvent);
    console.log('Avatar image error details:', {
      uri: uri,
      error: error.nativeEvent.error,
      responseCode: error.nativeEvent.responseCode
    });
    setImageError(true);
    if (onError) onError(error);
  };

  const handleImageLoad = () => {
    console.log('Avatar image loaded successfully');
    setImageLoading(false);
    if (onLoad) onLoad();
  };

  const handleImageLoadStart = () => {
    console.log('Avatar image loading started');
    setImageLoading(true);
  };

  // If no valid image or image failed to load, show initials
  if (!hasValidImage) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: COLORS.primary,
            justifyContent: 'center',
            alignItems: 'center',
          },
          style
        ]}
      >
        <Text
          style={[
            {
              color: 'white',
              fontSize: size * 0.4,
              fontWeight: 'bold',
            },
            textStyle
          ]}
        >
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  // Show image
  return (
    <Image
      source={{ uri }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style
      ]}
      resizeMode={resizeMode}
      onLoadStart={handleImageLoadStart}
      onLoadEnd={handleImageLoad}
      onError={handleImageError}
    />
  );
};

export default CommonAvatar;
