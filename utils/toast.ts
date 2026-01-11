import { showMessage } from 'react-native-flash-message';
import { Vibration } from 'react-native';

/**
 * Show success toast notification
 */
export const showSuccess = (message: string, description?: string) => {
    showMessage({
        message,
        description,
        type: 'success',
        icon: 'success',
        duration: 2500,
    });
};

/**
 * Show error toast notification
 */
export const showError = (message: string, description?: string) => {
    Vibration.vibrate(500);
    showMessage({
        message,
        description,
        type: 'danger',
        icon: 'danger',
        duration: 3000,
    });
};

/**
 * Show warning toast notification
 */
export const showWarning = (message: string, description?: string) => {
    Vibration.vibrate(100);
    showMessage({
        message,
        description,
        type: 'warning',
        icon: 'warning',
        duration: 3000,
    });
};

/**
 * Show info toast notification
 */
export const showInfo = (message: string, description?: string) => {
    showMessage({
        message,
        description,
        type: 'info',
        icon: 'info',
        duration: 2500,
    });
};
