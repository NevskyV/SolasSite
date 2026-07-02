/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface M3Palette {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
}

export const M3_PRESETS: M3Palette[] = [
  // Preset 1: Orchid/Lavender (Standard Cozy Material You Purple)
  {
    primary: '#D0BCFF',
    onPrimary: '#381E72',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#EADDFF',
    secondary: '#CCC2DC',
    onSecondary: '#332D41',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',
    tertiary: '#EFB8C8',
    onTertiary: '#492532',
    tertiaryContainer: '#633B48',
    onTertiaryContainer: '#FFD8E4',
    background: '#141218',
    onBackground: '#E6E1E5',
    surface: '#1D1B20',
    onSurface: '#E6E1E5',
  },
  // Preset 2: Emerald/Mint (Tech Fresh)
  {
    primary: '#86E3CE',
    onPrimary: '#00382E',
    primaryContainer: '#005143',
    onPrimaryContainer: '#A3FFEB',
    secondary: '#B4E1D5',
    onSecondary: '#1F342E',
    secondaryContainer: '#354B45',
    onSecondaryContainer: '#D0FDEC',
    tertiary: '#9ED5FF',
    onTertiary: '#003354',
    tertiaryContainer: '#004A77',
    onTertiaryContainer: '#CBE5FF',
    background: '#0F1311',
    onBackground: '#E1E3E0',
    surface: '#171B19',
    onSurface: '#E1E3E0',
  },
  // Preset 3: Warm Peach/Terracotta (Sunset Autumn)
  {
    primary: '#FFB894',
    onPrimary: '#4F1F00',
    primaryContainer: '#702F00',
    onPrimaryContainer: '#FFDBCC',
    secondary: '#E6BEAC',
    onSecondary: '#442A1D',
    secondaryContainer: '#5C3F32',
    onSecondaryContainer: '#FFDBCF',
    tertiary: '#E2C48E',
    onTertiary: '#402D05',
    tertiaryContainer: '#59431A',
    onTertiaryContainer: '#FFE1BE',
    background: '#15110F',
    onBackground: '#EBE0DC',
    surface: '#1F1916',
    onSurface: '#EBE0DC',
  },
  // Preset 4: Ocean Breeze/Azure (Clean Professional)
  {
    primary: '#ADC6FF',
    onPrimary: '#002E6A',
    primaryContainer: '#004494',
    onPrimaryContainer: '#D8E2FF',
    secondary: '#C1C6D9',
    onSecondary: '#2B303E',
    secondaryContainer: '#414656',
    onSecondaryContainer: '#DDE2F6',
    tertiary: '#9EF5CF',
    onTertiary: '#003828',
    tertiaryContainer: '#00523C',
    onTertiaryContainer: '#BBF9DC',
    background: '#101217',
    onBackground: '#E2E2E9',
    surface: '#191A20',
    onSurface: '#E2E2E9',
  },
  // Preset 5: Sakura Pink / Amber Gold (Sweet Flower)
  {
    primary: '#FFB1C8',
    onPrimary: '#5E112D',
    primaryContainer: '#7D2943',
    onPrimaryContainer: '#FFD9E1',
    secondary: '#E5BDC4',
    onSecondary: '#43292F',
    secondaryContainer: '#5C3F45',
    onSecondaryContainer: '#FFD9DF',
    tertiary: '#E5C185',
    onTertiary: '#412D00',
    tertiaryContainer: '#5C430D',
    onTertiaryContainer: '#FFE0A8',
    background: '#161012',
    onBackground: '#ECE0E1',
    surface: '#20181A',
    onSurface: '#ECE0E1',
  },
  // Preset 6: Cosmic Orchid / Plum
  {
    primary: '#E9B3FF',
    onPrimary: '#4B007B',
    primaryContainer: '#6A00AA',
    onPrimaryContainer: '#F7D8FF',
    secondary: '#DBC0E5',
    onSecondary: '#3E2B48',
    secondaryContainer: '#55415F',
    onSecondaryContainer: '#F8D8FF',
    tertiary: '#FFB3A7',
    onTertiary: '#5C150E',
    tertiaryContainer: '#7C2A22',
    onTertiaryContainer: '#FFDAD5',
    background: '#141016',
    onBackground: '#E8E0E8',
    surface: '#1E1920',
    onSurface: '#E8E0E8',
  }
];

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { 
    h: Math.round(h * 360), 
    s: Math.round(s * 100), 
    l: Math.round(l * 100) 
  };
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Extracts the computed AccentColor from the browser and generates a dynamic Material You palette.
 * Falls back to a randomly picked high-harmony preset if not supported/present.
 */
export function initializeTheme(): M3Palette & { source: 'system' | 'preset'; index?: number } {
  if (typeof document === 'undefined') {
    return { ...M3_PRESETS[0], source: 'preset', index: 0 };
  }

  try {
    // 1. Create a dummy element to check if 'AccentColor' works as a system CSS color
    const detector = document.createElement('div');
    detector.style.color = 'AccentColor';
    detector.style.position = 'absolute';
    detector.style.opacity = '0';
    detector.style.pointerEvents = 'none';
    document.body.appendChild(detector);
    
    const computedColorString = window.getComputedStyle(detector).color;
    document.body.removeChild(detector);

    // Parse 'rgb(X, Y, Z)'
    const match = computedColorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    
    // Check if browser actually resolved it to a system-specific color.
    // If it gives transparent, white or black, or standard browser lacks it, MATCH might fail or yield default theme.
    // Also, some browsers defaults might resolve to rgb(0, 0, 0) or rgb(255, 255, 255) under certain fallback modes.
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);

      // Avoid pure grays/black/white as accent colors (usually indicators of failed fallbacks)
      const maxVal = Math.max(r, g, b);
      const minVal = Math.min(r, g, b);
      const chroma = maxVal - minVal;

      if (chroma > 15) {
        // We have a genuine colored system accent! Let's build a stunning dynamic MD3 theme
        const { h, s } = rgbToHsl(r, g, b);

        // Limit saturation to have clean material look
        const adjustedS = Math.max(30, Math.min(s, 75));

        return {
          primary: hslToHex(h, adjustedS, 80),
          onPrimary: hslToHex(h, adjustedS, 20),
          primaryContainer: hslToHex(h, adjustedS - 10, 30),
          onPrimaryContainer: hslToHex(h, adjustedS - 10, 90),
          
          secondary: hslToHex((h + 20) % 360, Math.max(15, adjustedS - 20), 75),
          onSecondary: hslToHex((h + 20) % 360, Math.max(15, adjustedS - 20), 20),
          secondaryContainer: hslToHex((h + 20) % 360, Math.max(15, adjustedS - 20), 30),
          onSecondaryContainer: hslToHex((h + 20) % 360, Math.max(15, adjustedS - 20), 88),
          
          tertiary: hslToHex((h + 120) % 360, Math.min(85, adjustedS + 10), 82),
          onTertiary: hslToHex((h + 120) % 360, Math.min(85, adjustedS + 10), 22),
          tertiaryContainer: hslToHex((h + 120) % 360, Math.min(85, adjustedS + 10), 30),
          onTertiaryContainer: hslToHex((h + 120) % 360, Math.min(85, adjustedS + 10), 92),
          
          background: '#0e0b12',
          onBackground: '#e6e1e6',
          surface: '#1b1720',
          onSurface: '#e6e1e6',
          source: 'system'
        };
      }
    }
  } catch (e) {
    console.warn('System AccentColor detection failed, falling back to preset', e);
  }

  // 2. Fallback: Select a random preset
  // Let's use a simple memory cache via localStorage so the selected theme is stable for this browser session!
  let cachedIndex = 0;
  if (typeof window !== 'undefined' && window.localStorage) {
    const cached = window.localStorage.getItem('m3_accent_theme_idx');
    if (cached !== null) {
      cachedIndex = parseInt(cached, 10);
    } else {
      cachedIndex = Math.floor(Math.random() * M3_PRESETS.length);
      window.localStorage.setItem('m3_accent_theme_idx', cachedIndex.toString());
    }
  } else {
    cachedIndex = Math.floor(Math.random() * M3_PRESETS.length);
  }

  // Clamp key index
  cachedIndex = cachedIndex % M3_PRESETS.length;

  return { 
    ...M3_PRESETS[cachedIndex], 
    source: 'preset', 
    index: cachedIndex 
  };
}

/**
 * Applies the given theme properties to the HTML root container
 */
export function applyThemeProperties(palette: M3Palette) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  root.style.setProperty('--color-m3-primary', palette.primary);
  root.style.setProperty('--color-m3-onPrimary', palette.onPrimary);
  root.style.setProperty('--color-m3-primaryContainer', palette.primaryContainer);
  root.style.setProperty('--color-m3-onPrimaryContainer', palette.onPrimaryContainer);
  
  root.style.setProperty('--color-m3-secondary', palette.secondary);
  root.style.setProperty('--color-m3-onSecondary', palette.onSecondary);
  root.style.setProperty('--color-m3-secondaryContainer', palette.secondaryContainer);
  root.style.setProperty('--color-m3-onSecondaryContainer', palette.onSecondaryContainer);
  
  root.style.setProperty('--color-m3-tertiary', palette.tertiary);
  root.style.setProperty('--color-m3-onTertiary', palette.onTertiary);
  root.style.setProperty('--color-m3-tertiaryContainer', palette.tertiaryContainer);
  root.style.setProperty('--color-m3-onTertiaryContainer', palette.onTertiaryContainer);
}
