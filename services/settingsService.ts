import { AppSettings } from '../types/models';
import { executeQuery, executeUpdate } from './database';

export const getSettings = (): AppSettings => {
    try {
        const rows = executeQuery<any>(
            'SELECT * FROM app_settings WHERE id = 1'
        );

        if (rows.length === 0) {
            // Return default settings
            return {
                theme: 'system',
                language: 'vi',
                keepScreenAwake: false,
                backgroundImage: undefined,
                hasCompletedOnboarding: false,
                hasAcceptedTerms: false
            };
        }

        const row = rows[0];
        return {
            theme: row.theme,
            language: row.language,
            keepScreenAwake: row.keep_screen_awake === 1,
            backgroundImage: row.background_image,
            hasCompletedOnboarding: row.has_completed_onboarding === 1 || false,
            hasAcceptedTerms: row.has_accepted_terms === 1 || false
        };
    } catch (error) {
        console.log('Error reading settings, using defaults:', error);
        // Return default settings if there's any error (e.g., missing columns)
        return {
            theme: 'system',
            language: 'vi',
            keepScreenAwake: false,
            backgroundImage: undefined,
            hasCompletedOnboarding: false,
            hasAcceptedTerms: false
        };
    }
};

export const updateSettings = (settings: Partial<AppSettings>): void => {
    const current = getSettings();
    const updated = { ...current, ...settings };

    executeUpdate(
        `UPDATE app_settings SET
      theme = ?,
      language = ?,
      keep_screen_awake = ?,
      background_image = ?,
      has_completed_onboarding = ?,
      has_accepted_terms = ?
    WHERE id = 1`,
        [
            updated.theme,
            updated.language,
            updated.keepScreenAwake ? 1 : 0,
            updated.backgroundImage || null,
            updated.hasCompletedOnboarding ? 1 : 0,
            updated.hasAcceptedTerms ? 1 : 0
        ]
    );
};
