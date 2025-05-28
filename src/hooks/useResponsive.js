import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { isTablet, isSmallDevice } from '../constants/dimensions';

const useResponsive = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [orientation, setOrientation] = useState(
    dimensions.width > dimensions.height ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    });

    return () => subscription?.remove();
  }, []);

  const isLandscape = orientation === 'landscape';
  const isPortrait = orientation === 'portrait';
  const deviceType = isTablet ? 'tablet' : isSmallDevice ? 'small' : 'normal';

  // Responsive columns for grids
  const getColumns = () => {
    if (isTablet) {
      return isLandscape ? 4 : 3;
    }
    return isLandscape ? 3 : 2;
  };

  // Responsive item width for lists
  const getItemWidth = (padding = 16) => {
    const columns = getColumns();
    const totalPadding = padding * (columns + 1);
    return (dimensions.width - totalPadding) / columns;
  };

  return {
    dimensions,
    orientation,
    isLandscape,
    isPortrait,
    isTablet,
    isSmallDevice,
    deviceType,
    getColumns,
    getItemWidth,
  };
};

export default useResponsive; 