import React from 'react';
import { View, StyleSheet, StatusBar, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants/theme';
import { isIOS } from '../../constants/dimensions';

const Screen = ({
  children,
  style,
  scrollable = false,
  refreshControl,
  backgroundColor = COLORS.background,
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor = COLORS.primary,
  paddingHorizontal = true,
  paddingTop = true,
  paddingBottom = true,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    {
      backgroundColor,
      paddingTop: paddingTop ? insets.top : 0,
      paddingBottom: paddingBottom ? insets.bottom : 0,
      paddingHorizontal: paddingHorizontal ? SIZES.padding : 0,
    },
    style,
  ];

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      refreshControl={refreshControl}
      {...props}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={isIOS ? 'transparent' : statusBarBackgroundColor}
        translucent={isIOS}
      />
      <View style={containerStyle}>
        {content}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default Screen; 