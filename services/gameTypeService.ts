import { GameType } from '../types/models';
import { executeQuery } from './database';

export const getAllGameTypes = (): GameType[] => {
    const rows = executeQuery<any>(
        'SELECT * FROM game_types ORDER BY is_active DESC, name ASC'
    );

    return rows.map(row => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        isActive: row.is_active === 1,
        description: row.description
    }));
};

export const getActiveGameTypes = (): GameType[] => {
    const rows = executeQuery<any>(
        'SELECT * FROM game_types WHERE is_active = 1 ORDER BY name ASC'
    );

    return rows.map(row => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        isActive: true,
        description: row.description
    }));
};

export const getGameTypeById = (id: string): GameType | null => {
    const rows = executeQuery<any>(
        'SELECT * FROM game_types WHERE id = ?',
        [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        isActive: row.is_active === 1,
        description: row.description
    };
};
