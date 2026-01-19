import React, { createContext, useState, useContext, useCallback } from 'react';

interface NavigationVisibilityContextType {
    isTabBarVisible: boolean;
    setTabBarVisible: (visible: boolean) => void;
    isGestureEnabled: boolean;
    setGestureEnabled: (enabled: boolean) => void;
}

const NavigationVisibilityContext = createContext<NavigationVisibilityContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTabBarVisible, setIsTabBarVisible] = useState(true);
    const [isGestureEnabled, setIsGestureEnabled] = useState(true);

    const setTabBarVisible = useCallback((visible: boolean) => {
        setIsTabBarVisible(visible);
    }, []);

    const setGestureEnabled = useCallback((enabled: boolean) => {
        setIsGestureEnabled(enabled);
    }, []);

    return (
        <NavigationVisibilityContext.Provider
            value={{
                isTabBarVisible,
                setTabBarVisible,
                isGestureEnabled,
                setGestureEnabled,
            }}
        >
            {children}
        </NavigationVisibilityContext.Provider>
    );
};

export const useNavigationVisibility = (): NavigationVisibilityContextType => {
    const context = useContext(NavigationVisibilityContext);
    if (!context) {
        throw new Error('useNavigationVisibility must be used within NavigationProvider');
    }
    return context;
};
