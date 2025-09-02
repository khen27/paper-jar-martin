# Glass Styling Inventory

## Overview
This document catalogs all glass morphism effects and styling patterns used throughout the OtázoJar app.

## Component-Based Glass Usage

### 1. GlassCard Component
**File:** `components/GlassCard.js`
**Type:** Reusable Component
**Usage:** Main glass morphism primitive
**Details:**
- Uses `BlurView` from expo-blur for iOS
- Fallback View with elevation for Android
- Centralized glass styling with platform-specific implementations
- Colors: `rgba(255,255,255,0.10)` (iOS), `rgba(255,255,255,0.12)` (Android)
- Border: `rgba(255,255,255,0.25)`
- Shadow: `shadowOpacity: 0.15, shadowRadius: 8, elevation: 8`

## Inline Glass Styling Patterns

### 2. LanguageScreen.js
**File:** `screens/LanguageScreen.js`
**Type:** Inline Styles
**Patterns Found:**
- `backButtonGlass` (lines 175-186): Back button glass effect
- `selectedIndicator` (lines 263-278): Selection checkmark glass styling
- `cardGradient` (lines 233-239): LinearGradient overlay for selected cards
- Uses GlassCard component for main language cards

### 3. GameScreen.js
**File:** `screens/GameScreen.js`
**Type:** Inline Styles
**Patterns Found:**
- `backButtonGlass` (lines 586-598): Back button glass effect
- `gameModeDisplay` (lines 604-618): Game mode display glass styling
- `questionBoxGradient` (lines 462-467): Question box glass overlay
- Multiple `rgba(255, 255, 255, 0.2)` patterns throughout

### 4. FavoritesScreen.js
**File:** `screens/FavoritesScreen.js`
**Type:** Inline Styles
**Patterns Found:**
- `backButtonGlass` (lines 267-279): Back button glass effect
- `favoriteItemGlass` (lines 299-312): Favorite item glass styling
- `removeButtonGlass` (lines 337-354): Remove button glass effect
- `emptyMessageGlass` (lines 370-384): Empty state glass styling
- Multiple LinearGradient overlays with glass colors

### 5. AdBanner.js
**File:** `components/AdBanner.js`
**Type:** Inline Styles
**Patterns Found:**
- `bottomAdContent` (lines 135-149): Main ad banner glass styling
- `sponsoredWrapper` (lines 157-164): Sponsored label glass effect
- `bottomAdCTAWrapper` (lines 186-198): CTA button glass styling
- `glassOverlay` (lines 208-213): Additional glass overlay

### 6. HomeScreen.js
**File:** `screens/HomeScreen.js`
**Type:** Inline Styles
**Patterns Found:**
- References to glass.png asset for jar icon
- Various glass styling patterns (detailed analysis needed)

### 7. UpgradeScreen.js
**File:** `screens/UpgradeScreen.js`
**Type:** Inline Styles
**Patterns Found:**
- Multiple glass styling patterns (detailed analysis needed)

## Common Glass Styling Patterns

### Color Patterns
- `rgba(255, 255, 255, 0.1)` - Light glass surface
- `rgba(255, 255, 255, 0.15)` - Medium glass surface
- `rgba(255, 255, 255, 0.2)` - Raised glass surface
- `rgba(255, 255, 255, 0.25)` - Pressed glass surface
- `rgba(255, 255, 255, 0.3)` - Border color

### Shadow Patterns
- `shadowOpacity: 0.15, shadowRadius: 8` - Light shadow
- `shadowOpacity: 0.2, shadowRadius: 12` - Medium shadow
- `shadowOpacity: 0.3, shadowRadius: 16` - Heavy shadow
- `elevation: 8` - Android elevation

### Border Patterns
- `borderWidth: 1` or `StyleSheet.hairlineWidth`
- `borderColor: 'rgba(255, 255, 255, 0.25)'` or `0.3`

### Blur Patterns
- `backdropFilter: 'blur(10px)'` - Light blur
- `backdropFilter: 'blur(20px)'` - Medium blur
- `BlurView intensity={22}` - iOS BlurView

## Duplication Analysis

### Most Repeated Patterns
1. **Back Button Glass** - Found in 4+ screens with identical styling
2. **Card Glass Effects** - Similar patterns across multiple components
3. **Button Glass Effects** - CTA buttons with glass styling
4. **Overlay Gradients** - LinearGradient overlays for glass effects

### Inconsistencies Found
1. **Color Variations** - Slight differences in rgba values across files
2. **Shadow Variations** - Different shadowRadius and shadowOpacity values
3. **Border Variations** - Some use hairlineWidth, others use 1
4. **Blur Variations** - Different blur intensities and implementations

## Recommendations

### High Priority
1. **Consolidate Back Button Glass** - Create reusable component
2. **Standardize Glass Colors** - Create color tokens
3. **Unify Shadow System** - Create shadow tokens
4. **Create Glass Button Component** - For CTA buttons

### Medium Priority
1. **Standardize Border System** - Create border tokens
2. **Create Glass Overlay Component** - For LinearGradient overlays
3. **Unify Blur System** - Create blur intensity tokens

### Low Priority
1. **Create Glass Indicator Component** - For selection indicators
2. **Standardize Glass Spacing** - Create spacing tokens
3. **Create Glass Typography** - For text on glass surfaces

## Files Requiring Migration
1. `screens/LanguageScreen.js` - High priority (pilot candidate)
2. `screens/GameScreen.js` - Medium priority
3. `screens/FavoritesScreen.js` - Medium priority
4. `components/AdBanner.js` - Low priority
5. `screens/HomeScreen.js` - Low priority
6. `screens/UpgradeScreen.js` - Low priority

## Migration Complexity
- **Low Complexity:** LanguageScreen (already uses GlassCard component)
- **Medium Complexity:** GameScreen, FavoritesScreen (multiple patterns)
- **High Complexity:** HomeScreen, UpgradeScreen (extensive glass usage)

---
*Generated on: $(date)*
*Total Files Scanned: 7*
*Total Glass Patterns Found: 25+*
