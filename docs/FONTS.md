# Font Usage Guide - Roboto Slab

This app now uses **Roboto Slab** as the primary font family throughout the application.

## Available Fonts

The following font weights are available:

- `RobotoSlab-Thin` (100)
- `RobotoSlab-ExtraLight` (200)
- `RobotoSlab-Light` (300)
- `RobotoSlab-Regular` (400) - Default
- `RobotoSlab-Medium` (500)
- `RobotoSlab-SemiBold` (600)
- `RobotoSlab-Bold` (700)
- `RobotoSlab-ExtraBold` (800)
- `RobotoSlab-Black` (900)

Additionally, there's a variable font `RobotoSlab-VariableFont_wght.ttf` that supports all weights.

## How to Use

### Method 1: Using Font Constants

```typescript
import { Fonts } from '../constants/fonts';

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.normal,  // or Fonts.bold, Fonts.medium, etc.
  },
});
```

### Method 2: Using Typography Styles

For consistent text styling across the app, use the predefined typography styles:

```typescript
import { Typography } from '../constants/typography';

const MyComponent = () => (
  <Text style={Typography.h1}>Heading 1</Text>
  <Text style={Typography.body1}>Body text</Text>
  <Text style={Typography.caption}>Caption text</Text>
);
```

Available typography styles:
- **Headers**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- **Body**: `body1`, `body2`
- **Subtitles**: `subtitle1`, `subtitle2`
- **Special**: `caption`, `overline`, `button`
- **Weights**: `light`, `regular`, `medium`, `semiBold`, `bold`, `extraBold`, `black`

### Method 3: Combining Typography Styles

```typescript
import { Typography, combineTypography } from '../constants/typography';

const styles = StyleSheet.create({
  customText: combineTypography(Typography.h2, Typography.bold),
});
```

## Font Loading

Fonts are automatically loaded in `App.tsx` using the `useFonts` hook from `expo-font`. The app will show a loading screen until all fonts are loaded.

## Navigation Theme

The navigation theme has been updated to use Roboto Slab fonts:
- Regular text: `RobotoSlab-Regular`
- Medium text: `RobotoSlab-Medium`
- Bold text: `RobotoSlab-Bold`
- Heavy text: `RobotoSlab-Black`

## Best Practices

1. **Use Typography constants** for consistent styling across the app
2. **Avoid hardcoding font families** - always use the `Fonts` or `Typography` constants
3. **Match fontWeight with fontFamily** - ensure the fontWeight matches the font file (e.g., use `fontWeight: '700'` with `Fonts.bold`)
4. **Test on both platforms** - fonts may render slightly differently on iOS and Android

## Examples

### Simple Text
```typescript
<Text style={{ fontFamily: Fonts.normal }}>
  Normal text
</Text>
```

### Styled Header
```typescript
<Text style={[Typography.h1, { color: theme.text }]}>
  My Header
</Text>
```

### Custom Combination
```typescript
<Text style={[
  Typography.body1,
  { fontFamily: Fonts.semiBold, color: theme.primary }
]}>
  Important text
</Text>
```
