/**
 * Font family constants for the app
 * Using Roboto Slab font family
 */

export const Fonts = {
    // Variable font (supports all weights)
    regular: 'RobotoSlab',

    // Static fonts with specific weights
    thin: 'RobotoSlab-Thin',
    extraLight: 'RobotoSlab-ExtraLight',
    light: 'RobotoSlab-Light',
    normal: 'RobotoSlab-Regular',
    medium: 'RobotoSlab-Medium',
    semiBold: 'RobotoSlab-SemiBold',
    bold: 'RobotoSlab-Bold',
    extraBold: 'RobotoSlab-ExtraBold',
    black: 'RobotoSlab-Black',
} as const;

export type FontFamily = typeof Fonts[keyof typeof Fonts];
