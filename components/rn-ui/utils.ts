/**
 * Utility functions for React Native UI components
 */

/**
 * Combines multiple class names/styles (similar to cn() in web)
 * For React Native, we merge style objects
 */
export function mergeStyles(...styles: any[]) {
    return styles.filter(Boolean).flat();
}

/**
 * Conditional style helper
 */
export function conditionalStyle(condition: boolean, trueStyle: any, falseStyle?: any) {
    return condition ? trueStyle : falseStyle;
}
