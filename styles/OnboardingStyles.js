import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center'
  },
  illustration: {
    height: SIZES.width * 0.8,
    width: SIZES.width * 0.8,
    position: "absolute",
    bottom: 360
  },
  ornament: {
    position: "absolute",
    bottom: 430,
    zIndex: -99
  },
  titleContainer: {
    marginVertical: 18,
    alignItems: 'center',
  },
  title: {
    ...FONTS.h3,
    color: COLORS.black,
    textAlign: "center",
  },
  subTitle: {
    ...FONTS.h3,
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: 8,
  },
  description: {
    ...FONTS.body3,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 16
  },
  dotsContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: COLORS.white,
    padding: 22,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    height: 360,
  },
  nextButton: {
    width: SIZES.width - 44,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    marginTop: 22
  },
  skipButton: {
    width: SIZES.width - 44,
    marginBottom: SIZES.padding,
    backgroundColor: 'transparent',
    borderColor: COLORS.primary
  },
});

export default styles;