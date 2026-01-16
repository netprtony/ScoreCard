/**
 * Design System for ScoreCard App
 * Based on globals.css color scheme and design tokens
 */

export const DesignSystem = {
    // Colors - Light Mode
    light: {
        background: '#ffffff',
        foreground: '#030213',
        card: '#ffffff',
        cardForeground: '#030213',
        primary: '#030213',
        primaryForeground: '#ffffff',
        secondary: '#f3f3f5',
        secondaryForeground: '#030213',
        muted: '#ececf0',
        mutedForeground: '#717182',
        accent: '#e9ebef',
        accentForeground: '#030213',
        destructive: '#d4183d',
        destructiveForeground: '#ffffff',
        border: 'rgba(0, 0, 0, 0.1)',
        input: '#f3f3f5',
        inputBorder: 'rgba(0, 0, 0, 0.1)',
        ring: '#b3b3b3',
    },

    // Colors - Dark Mode
    dark: {
        background: '#1a1a1a',
        foreground: '#f5f5f5',
        card: '#1a1a1a',
        cardForeground: '#f5f5f5',
        primary: '#f5f5f5',
        primaryForeground: '#2a2a2a',
        secondary: '#3a3a3a',
        secondaryForeground: '#f5f5f5',
        muted: '#3a3a3a',
        mutedForeground: '#b3b3b3',
        accent: '#3a3a3a',
        accentForeground: '#f5f5f5',
        destructive: '#8b2635',
        destructiveForeground: '#e89aa8',
        border: '#3a3a3a',
        input: '#3a3a3a',
        inputBorder: '#3a3a3a',
        ring: '#666666',
    },

    // Typography
    typography: {
        fontSizes: {
            xs: 12,
            sm: 14,
            base: 16,
            lg: 18,
            xl: 20,
            '2xl': 24,
            '3xl': 30,
            '4xl': 36,
        },
        fontWeights: {
            normal: '400' as const,
            medium: '500' as const,
            semibold: '600' as const,
            bold: '700' as const,
        },
        lineHeights: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75,
        },
    },

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        base: 16,
        lg: 20,
        xl: 24,
        '2xl': 32,
        '3xl': 48,
        '4xl': 64,
    },

    // Border Radius
    radius: {
        sm: 6,
        md: 8,
        lg: 10,
        xl: 12,
        '2xl': 16,
        full: 9999,
    },

    // Shadows
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
        },
        xl: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
        },
    },

    // Component Sizes
    components: {
        button: {
            heights: {
                sm: 32,
                md: 40,
                lg: 48,
            },
            paddingHorizontal: {
                sm: 12,
                md: 16,
                lg: 24,
            },
        },
        input: {
            height: 44,
            paddingHorizontal: 12,
        },
        card: {
            padding: 16,
            gap: 12,
        },
    },
} as const;

export type ColorScheme = typeof DesignSystem.light;
