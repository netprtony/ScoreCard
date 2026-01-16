import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings, updateSettings } from '../services/settingsService';
import { useTheme } from './ThemeContext';

export interface WallpaperConfig {
  id: string;
  type: 'image' | 'default';
  source?: any;
  name?: string;
  themeMode?: 'light' | 'dark';
}

// Wallpaper definitions
interface WallpaperContextType {
  wallpaper: WallpaperConfig;
  setWallpaper: (id: string) => Promise<void>;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export const WALLPAPER_DEFINITIONS: { [key: string]: WallpaperConfig } = {
  'default': { id: 'default', type: 'default', name: 'Mặc định' },
  
  // DARK Wallpapers
  '20250903': { id: '20250903', type: 'image', source: require('../assets/wallpaper/Dark/20250903_iPhone.png'), name: '2025 Concept 2', themeMode: 'dark' },
  '20250905': { id: '20250905', type: 'image', source: require('../assets/wallpaper/Dark/20250905_iPhone.png'), name: '2025 Concept 3', themeMode: 'dark' },
  '20250915': { id: '20250915', type: 'image', source: require('../assets/wallpaper/Dark/20250915_iPhone.png'), name: '2025 Concept 4', themeMode: 'dark' },
  'April03': { id: 'April03', type: 'image', source: require('../assets/wallpaper/Dark/April03_iPhone.png'), name: 'April 03', themeMode: 'dark' },
  'April04': { id: 'April04', type: 'image', source: require('../assets/wallpaper/Dark/April04_iPhone.png'), name: 'April 04', themeMode: 'dark' },
  'April06': { id: 'April06', type: 'image', source: require('../assets/wallpaper/Dark/April06_iPhone.png'), name: 'April 06', themeMode: 'dark' },
  'April08': { id: 'April08', type: 'image', source: require('../assets/wallpaper/Dark/April08_iPhone.png'), name: 'April 08', themeMode: 'dark' },
  'April12': { id: 'April12', type: 'image', source: require('../assets/wallpaper/Dark/April12_iPhone.png'), name: 'April 12', themeMode: 'dark' },
  'April20': { id: 'April20', type: 'image', source: require('../assets/wallpaper/Dark/April20_iPhone.png'), name: 'April 20', themeMode: 'dark' },
  'Circles_1': { id: 'Circles_1', type: 'image', source: require('../assets/wallpaper/Dark/Circles_1_iPhone.png'), name: 'Circles 1', themeMode: 'dark' },
  'Circles_MP': { id: 'Circles_MP', type: 'image', source: require('../assets/wallpaper/Dark/Circles_MP_iPhone.png'), name: 'Circles MP', themeMode: 'dark' },
  'ColdVortex': { id: 'ColdVortex', type: 'image', source: require('../assets/wallpaper/Dark/ColdVortex_iPhone.png'), name: 'Cold Vortex', themeMode: 'dark' },
  'Evenfall': { id: 'Evenfall', type: 'image', source: require('../assets/wallpaper/Dark/Evenfall_iPhone.png'), name: 'Evenfall', themeMode: 'dark' },
  'F01': { id: 'F01', type: 'image', source: require('../assets/wallpaper/Dark/F01_iPhone.png'), name: 'Abstract F01', themeMode: 'dark' },
  'F02': { id: 'F02', type: 'image', source: require('../assets/wallpaper/Dark/F02_iPhone.png'), name: 'Abstract F02', themeMode: 'dark' },
  'F03': { id: 'F03', type: 'image', source: require('../assets/wallpaper/Dark/F03_iPhone.png'), name: 'Abstract F03', themeMode: 'dark' },
  'F04': { id: 'F04', type: 'image', source: require('../assets/wallpaper/Dark/F04_iPhone.png'), name: 'Abstract F04', themeMode: 'dark' },
  'F07': { id: 'F07', type: 'image', source: require('../assets/wallpaper/Dark/F07_iPhone.png'), name: 'Abstract F07', themeMode: 'dark' },
  'Forage': { id: 'Forage', type: 'image', source: require('../assets/wallpaper/Dark/Forage_iPhone.png'), name: 'Forage', themeMode: 'dark' },
  'Mountain01': { id: 'Mountain01', type: 'image', source: require('../assets/wallpaper/Dark/Mountain01_iPhone.png'), name: 'Mountain 01', themeMode: 'dark' },
  'Mountain02': { id: 'Mountain02', type: 'image', source: require('../assets/wallpaper/Dark/Mountain02_iPhone.png'), name: 'Mountain 02', themeMode: 'dark' },
  'Mountain06': { id: 'Mountain06', type: 'image', source: require('../assets/wallpaper/Dark/Mountain06_iPhone.png'), name: 'Mountain 06', themeMode: 'dark' },
  'Mountain07': { id: 'Mountain07', type: 'image', source: require('../assets/wallpaper/Dark/Mountain07_iPhone.png'), name: 'Mountain 07', themeMode: 'dark' },
  'Mountain08': { id: 'Mountain08', type: 'image', source: require('../assets/wallpaper/Dark/Mountain08_iPhone.png'), name: 'Mountain 08', themeMode: 'dark' },
  'Sunset': { id: 'Sunset', type: 'image', source: require('../assets/wallpaper/Dark/Sunset_iPhone.png'), name: 'Sunset', themeMode: 'dark' },
  'UM': { id: 'UM', type: 'image', source: require('../assets/wallpaper/Dark/UM_iPhone.png'), name: 'UM', themeMode: 'dark' },
  'VF': { id: 'VF', type: 'image', source: require('../assets/wallpaper/Dark/VF_iPhone+2.png'), name: 'VF', themeMode: 'dark' },

  // LIGHT Wallpapers
  '20250901': { id: '20250901', type: 'image', source: require('../assets/wallpaper/Light/20250901_iPhone.png'), name: '2025 Concept 1', themeMode: 'light' },
  'April10': { id: 'April10', type: 'image', source: require('../assets/wallpaper/Light/April10_iPhone.png'), name: 'April 10', themeMode: 'light' },
  'April14': { id: 'April14', type: 'image', source: require('../assets/wallpaper/Light/April14_iPhone.png'), name: 'April 14', themeMode: 'light' },
  'April18': { id: 'April18', type: 'image', source: require('../assets/wallpaper/Light/April18_iPhone.png'), name: 'April 18', themeMode: 'light' },
  'April26': { id: 'April26', type: 'image', source: require('../assets/wallpaper/Light/April26_iPhone.png'), name: 'April 26', themeMode: 'light' },
  'April28': { id: 'April28', type: 'image', source: require('../assets/wallpaper/Light/April28_iPhone.png'), name: 'April 28', themeMode: 'light' },
  'April30B': { id: 'April30B', type: 'image', source: require('../assets/wallpaper/Light/April30B_iPhone.png'), name: 'April 30B', themeMode: 'light' },
  'Aurora': { id: 'Aurora', type: 'image', source: require('../assets/wallpaper/Light/Aurora_iPhone.png'), name: 'Aurora', themeMode: 'light' },
  'Commander_Dark': { id: 'Commander_Dark', type: 'image', source: require('../assets/wallpaper/Light/Commander_Dark_iPhone.png'), name: 'Commander Dark', themeMode: 'light' },
  'Commander_Mid': { id: 'Commander_Mid', type: 'image', source: require('../assets/wallpaper/Light/Commander_Mid_iPhone.png'), name: 'Commander Mid', themeMode: 'light' },
  'F05': { id: 'F05', type: 'image', source: require('../assets/wallpaper/Light/F05_iPhone.png'), name: 'Abstract F05', themeMode: 'light' },
  'F06': { id: 'F06', type: 'image', source: require('../assets/wallpaper/Light/F06_iPhone.png'), name: 'Abstract F06', themeMode: 'light' },
  'F08': { id: 'F08', type: 'image', source: require('../assets/wallpaper/Light/F08_iPhone.png'), name: 'Abstract F08', themeMode: 'light' },
  'Flow': { id: 'Flow', type: 'image', source: require('../assets/wallpaper/Light/Flow_Wallpaper_iPhone+2.jpg'), name: 'Flow', themeMode: 'light' },
  'Honeycomb': { id: 'Honeycomb', type: 'image', source: require('../assets/wallpaper/Light/Honeycomb_iPhone.png'), name: 'Honeycomb', themeMode: 'light' },
  'Mountain03': { id: 'Mountain03', type: 'image', source: require('../assets/wallpaper/Light/Mountain03_iPhone.png'), name: 'Mountain 03', themeMode: 'light' },
  'Mountain04': { id: 'Mountain04', type: 'image', source: require('../assets/wallpaper/Light/Mountain04_iPhone.png'), name: 'Mountain 04', themeMode: 'light' },
  'Mountain05': { id: 'Mountain05', type: 'image', source: require('../assets/wallpaper/Light/Mountain05_iPhone.png'), name: 'Mountain 05', themeMode: 'light' },
  'SpringLight': { id: 'SpringLight', type: 'image', source: require('../assets/wallpaper/Light/SpringLight_iPhone.png'), name: 'Spring Light', themeMode: 'light' },
  'TangerineFade': { id: 'TangerineFade', type: 'image', source: require('../assets/wallpaper/Light/TangerineFade_iPhone.png'), name: 'Tangerine Fade', themeMode: 'light' },
  'Waterway1': { id: 'Waterway1', type: 'image', source: require('../assets/wallpaper/Light/Waterway1_iPhone.png'), name: 'Waterway', themeMode: 'light' },
};

export const WallpaperProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallpaper, setWallpaperState] = useState<WallpaperConfig>(WALLPAPER_DEFINITIONS['default']);
  const { setThemeMode } = useTheme();

  useEffect(() => {
    loadWallpaper();
  }, []);

  const loadWallpaper = async () => {
    const settings = await getSettings();
    const wallpaperId = settings.backgroundImage || 'default';
    const config = WALLPAPER_DEFINITIONS[wallpaperId] || WALLPAPER_DEFINITIONS['default'];
    setWallpaperState(config);
  };

  const setWallpaper = async (id: string) => {
    const config = WALLPAPER_DEFINITIONS[id] || WALLPAPER_DEFINITIONS['default'];
    setWallpaperState(config);
    
    // Auto switch theme based on wallpaper config
    if (config.themeMode) {
      setThemeMode(config.themeMode);
    }
    
    await updateSettings({ backgroundImage: id });
  };

  return (
    <WallpaperContext.Provider value={{ wallpaper, setWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = (): WallpaperContextType => {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error('useWallpaper must be used within WallpaperProvider');
  }
  return context;
};
