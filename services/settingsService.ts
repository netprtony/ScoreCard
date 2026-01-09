import { AppSettings } from '../types/models';
import { executeQuery, executeUpdate } from './database';

export const getSettings = (): AppSettings => {
    const rows = executeQuery<any>(
        'SELECT * FROM app_settings WHERE id = 1'
    );

    if (rows.length === 0) {
        // Return default settings
        return {
            theme: 'system',
            language: 'vi',
            keepScreenAwake: false,
            backgroundImage: undefined
        };
    }

    const row = rows[0];
    return {
        theme: row.theme,
        language: row.language,
        keepScreenAwake: row.keep_screen_awake === 1,
        backgroundImage: row.background_image
    };
};

export const updateSettings = (settings: Partial<AppSettings>): void => {
    const current = getSettings();
    const updated = { ...current, ...settings };

    executeUpdate(
        `UPDATE app_settings SET
      theme = ?,
      language = ?,
      keep_screen_awake = ?,
      background_image = ?
    WHERE id = 1`,
        [
            updated.theme,
            updated.language,
            updated.keepScreenAwake ? 1 : 0,
            updated.backgroundImage || null
        ]
    );
};
