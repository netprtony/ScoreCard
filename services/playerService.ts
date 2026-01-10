import { Player } from '../types/models';
import { executeQuery, executeUpdate } from './database';

export const getAllPlayers = (): Player[] => {
    const rows = executeQuery<any>(
        'SELECT * FROM players ORDER BY name ASC'
    );

    return rows.map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
        createdAt: row.created_at
    }));
};

export const getPlayerById = (id: string): Player | null => {
    const rows = executeQuery<any>(
        'SELECT * FROM players WHERE id = ?',
        [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
        id: row.id,
        name: row.name,
        color: row.color,
        createdAt: row.created_at
    };
};

export const createPlayer = (name: string, color?: string): Player => {
    const player: Player = {
        id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        color,
        createdAt: Date.now()
    };

    executeUpdate(
        'INSERT INTO players (id, name, color, created_at) VALUES (?, ?, ?, ?)',
        [player.id, player.name, player.color || null, player.createdAt]
    );

    return player;
};

export const updatePlayer = (id: string, name: string, color?: string): void => {
    executeUpdate(
        'UPDATE players SET name = ?, color = ? WHERE id = ?',
        [name, color || null, id]
    );
};

export const deletePlayer = (id: string): void => {
    executeUpdate('DELETE FROM players WHERE id = ?', [id]);
};

export const getPlayerCount = (): number => {
    const rows = executeQuery<{ count: number }>(
        'SELECT COUNT(*) as count FROM players'
    );
    return rows[0]?.count || 0;
};
