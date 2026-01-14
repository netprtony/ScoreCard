import { StyleSheet, TextStyle } from 'react-native';
import { Fonts } from './fonts';

/**
 * Global typography styles using Roboto Slab font family
 * These can be used throughout the app for consistent text styling
 */

export const Typography = StyleSheet.create({
    // Headers
    h1: {
        fontFamily: Fonts.bold,
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
    } as TextStyle,

    h2: {
        fontFamily: Fonts.semiBold,
        fontSize: 28,
        fontWeight: '600',
        lineHeight: 36,
    } as TextStyle,

    h3: {
        fontFamily: Fonts.semiBold,
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
    } as TextStyle,

    h4: {
        fontFamily: Fonts.medium,
        fontSize: 20,
        fontWeight: '500',
        lineHeight: 28,
    } as TextStyle,

    h5: {
        fontFamily: Fonts.medium,
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 24,
    } as TextStyle,

    h6: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
    } as TextStyle,

    // Body text
    body1: {
        fontFamily: Fonts.normal,
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    } as TextStyle,

    body2: {
        fontFamily: Fonts.normal,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    } as TextStyle,

    // Special text styles
    subtitle1: {
        fontFamily: Fonts.medium,
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
    } as TextStyle,

    subtitle2: {
        fontFamily: Fonts.medium,
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    } as TextStyle,

    caption: {
        fontFamily: Fonts.normal,
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
    } as TextStyle,

    overline: {
        fontFamily: Fonts.medium,
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 16,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    } as TextStyle,

    // Button text
    button: {
        fontFamily: Fonts.semiBold,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    } as TextStyle,

    // Special weights
    light: {
        fontFamily: Fonts.light,
        fontWeight: '300',
    } as TextStyle,

    regular: {
        fontFamily: Fonts.normal,
        fontWeight: '400',
    } as TextStyle,

    medium: {
        fontFamily: Fonts.medium,
        fontWeight: '500',
    } as TextStyle,

    semiBold: {
        fontFamily: Fonts.semiBold,
        fontWeight: '600',
    } as TextStyle,

    bold: {
        fontFamily: Fonts.bold,
        fontWeight: '700',
    } as TextStyle,

    extraBold: {
        fontFamily: Fonts.extraBold,
        fontWeight: '800',
    } as TextStyle,

    black: {
        fontFamily: Fonts.black,
        fontWeight: '900',
    } as TextStyle,
});

/**
 * Helper function to combine typography styles
 * Usage: const textStyle = combineTypography(Typography.h1, Typography.bold);
 */
export const combineTypography = (...styles: TextStyle[]): TextStyle => {
    return Object.assign({}, ...styles);
};
