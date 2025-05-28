import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SHADOWS } from './theme';
import { scale, normalize } from './dimensions';

export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  
  // Text styles
  heading1: {
    ...FONTS.h1,
    color: COLORS.text,
  },
  heading2: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  heading3: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  body: {
    ...FONTS.body1,
    color: COLORS.text,
  },
  bodySecondary: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  caption: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textBold: {
    fontWeight: 'bold',
  },
  textSemiBold: {
    fontWeight: '600',
  },
  
  // Spacing
  mt1: { marginTop: scale(8) },
  mt2: { marginTop: scale(16) },
  mt3: { marginTop: scale(24) },
  mt4: { marginTop: scale(32) },
  mb1: { marginBottom: scale(8) },
  mb2: { marginBottom: scale(16) },
  mb3: { marginBottom: scale(24) },
  mb4: { marginBottom: scale(32) },
  ml1: { marginLeft: scale(8) },
  ml2: { marginLeft: scale(16) },
  ml3: { marginLeft: scale(24) },
  ml4: { marginLeft: scale(32) },
  mr1: { marginRight: scale(8) },
  mr2: { marginRight: scale(16) },
  mr3: { marginRight: scale(24) },
  mr4: { marginRight: scale(32) },
  mx1: { marginHorizontal: scale(8) },
  mx2: { marginHorizontal: scale(16) },
  mx3: { marginHorizontal: scale(24) },
  mx4: { marginHorizontal: scale(32) },
  my1: { marginVertical: scale(8) },
  my2: { marginVertical: scale(16) },
  my3: { marginVertical: scale(24) },
  my4: { marginVertical: scale(32) },
  
  pt1: { paddingTop: scale(8) },
  pt2: { paddingTop: scale(16) },
  pt3: { paddingTop: scale(24) },
  pt4: { paddingTop: scale(32) },
  pb1: { paddingBottom: scale(8) },
  pb2: { paddingBottom: scale(16) },
  pb3: { paddingBottom: scale(24) },
  pb4: { paddingBottom: scale(32) },
  pl1: { paddingLeft: scale(8) },
  pl2: { paddingLeft: scale(16) },
  pl3: { paddingLeft: scale(24) },
  pl4: { paddingLeft: scale(32) },
  pr1: { paddingRight: scale(8) },
  pr2: { paddingRight: scale(16) },
  pr3: { paddingRight: scale(24) },
  pr4: { paddingRight: scale(32) },
  px1: { paddingHorizontal: scale(8) },
  px2: { paddingHorizontal: scale(16) },
  px3: { paddingHorizontal: scale(24) },
  px4: { paddingHorizontal: scale(32) },
  py1: { paddingVertical: scale(8) },
  py2: { paddingVertical: scale(16) },
  py3: { paddingVertical: scale(24) },
  py4: { paddingVertical: scale(32) },
  
  // Card styles
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: scale(8),
    padding: scale(16),
    ...SHADOWS.small,
  },
  cardMedium: {
    backgroundColor: COLORS.surface,
    borderRadius: scale(12),
    padding: scale(20),
    ...SHADOWS.medium,
  },
  cardLarge: {
    backgroundColor: COLORS.surface,
    borderRadius: scale(16),
    padding: scale(24),
    ...SHADOWS.large,
  },
  
  // Input styles
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    fontSize: normalize(16),
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  
  // Button base styles
  button: {
    borderRadius: scale(8),
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(44),
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.small,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  
  // List styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  
  // Utility styles
  shadow: SHADOWS.small,
  shadowMedium: SHADOWS.medium,
  shadowLarge: SHADOWS.large,
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: scale(8),
  },
  dividerThick: {
    height: scale(8),
    backgroundColor: COLORS.background,
    marginVertical: scale(16),
  },
  
  // Status styles
  statusSuccess: {
    backgroundColor: COLORS.success,
    borderRadius: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },
  statusError: {
    backgroundColor: COLORS.error,
    borderRadius: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },
  statusWarning: {
    backgroundColor: COLORS.warning,
    borderRadius: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },
  statusInfo: {
    backgroundColor: COLORS.info,
    borderRadius: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },
});

export default globalStyles; 