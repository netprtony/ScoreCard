import * as SQLite from 'expo-sqlite';
import { initDatabase } from './database';

let db: SQLite.SQLiteDatabase | null = null;

// Clear all data and reset database (for testing)
export const clearDatabase = (): void => {
    if (!db) {
        throw new Error('Database not initialized');
    }

    try {
        // Drop all tables
        db.execSync('DROP TABLE IF EXISTS players');
        db.execSync('DROP TABLE IF EXISTS matches');
        db.execSync('DROP TABLE IF EXISTS rounds');
        db.execSync('DROP TABLE IF EXISTS player_actions');
        db.execSync('DROP TABLE IF EXISTS game_types');
        db.execSync('DROP TABLE IF EXISTS scoring_configs');
        db.execSync('DROP TABLE IF EXISTS app_settings');

        console.log('Database cleared successfully');

        // Reinitialize database
        initDatabase();
    } catch (error) {
        console.error('Error clearing database:', error);
        throw error;
    }
};

export const executeQuery = <T>(query: string, params: any[] = []): T[] => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db.getAllSync(query, params) as T[];
};

export const executeUpdate = (query: string, params: any[] = []): void => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    db.runSync(query, params);
};
