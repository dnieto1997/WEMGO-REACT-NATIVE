import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export const COLORS = {
    primary: '#11C9BD',
    secondary: '#11C9BD',
    tertiary: "#6C4DDA",
    blue: "#02AACF",
    white: "#FFFFFE",
    purple: "#6C4DDA",
    secondaryWhite: '#F9F9FF',
    tertiaryWhite: '#fafafa',
    black: "#273147",
    secondaryBlack: "#020614",
    gray: "#ECF0F4",
    secondaryGray: '#808080',
    gray4: "#A0A5BA",
    gray5: "#676767",
    gray6: "#EDEDED",
    red: "#FF3E3D",
    green: "#00BE00",
    tansparentPrimary: "rgba(17, 201, 189, .15)",
    transparentSecondary: "rgba(108,77,218, .15)",
    transparentRed: "rgba(255,62,61, .15)",
};

export const SIZES = {
    // Global SIZES
    base: 8,
    font: 14,
    radius: 30,
    padding: 8,
    padding2: 12,
    padding3: 16,

    // FONTS Sizes
    largeTitle: 50,
    h1: 36,
    h2: 22,
    h3: 16,
    h4: 14,
    body1: 30,
    body2: 20,
    body3: 16,
    body4: 14,

    // App Dimensions
    width,
    height,
};

export const FONTS = {
    largeTitle: { fontFamily: 'Roboto Black', fontSize: SIZES.largeTitle, lineHeight: 55, color: "black" },
    h1: { fontFamily: 'Roboto Bold', fontSize: SIZES.h1, lineHeight: 36, color: "black" },
    h2: { fontFamily: 'Roboto Bold', fontSize: SIZES.h2, lineHeight: 30, color: "black" },
    h3: { fontFamily: 'Roboto Bold', fontSize: SIZES.h3, lineHeight: 22, color: "black" },
    h4: { fontFamily: 'Roboto Bold', fontSize: SIZES.h4, lineHeight: 20 },
    body1: { fontFamily: 'Roboto Regular', fontSize: SIZES.body1, lineHeight: 36, color: "black" },
    body2: { fontFamily: 'Roboto Regular', fontSize: SIZES.body2, lineHeight: 30, color: "black" },
    body3: { fontFamily: 'Roboto Regular', fontSize: SIZES.body3, lineHeight: 22, color: "black" },
    body4: { fontFamily: 'Roboto Regular', fontSize: SIZES.body4, lineHeight: 20, color: "black" },
    body5: { fontFamily: 'Poppins-Bold', fontSize: SIZES.body4, lineHeight: 20, color: "black" },
};



const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;