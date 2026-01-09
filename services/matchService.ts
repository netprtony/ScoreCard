import { Match, Round, ScoringConfig } from '../types/models';
import { executeQuery, executeUpdate } from './database';
import { getRoundsByMatchId, deleteRoundsByMatchId } from './roundService';

// Create a new match (multi-round)
export const createMatch = (
    gameType: string,
    playerIds: string[],
    playerNames: string[],
    config: ScoringConfig
): Match => {
    const newMatch: Match = {
        id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gameType,
        playerIds,
        playerNames,
        configSnapshot: config,
        rounds: [],
        totalScores: playerIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
        status: 'active',
        createdAt: Date.now()
    };

    executeUpdate(
        `INSERT INTO matches (
            id, game_type, player_ids, player_names,
            config_snapshot, total_scores, status,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            newMatch.id,
            newMatch.gameType,
            JSON.stringify(newMatch.playerIds),
            JSON.stringify(newMatch.playerNames),
            JSON.stringify(newMatch.configSnapshot),
            JSON.stringify(newMatch.totalScores),
            newMatch.status,
            newMatch.createdAt
        ]
    );

    return newMatch;
};

// Get active match (only one can be active at a time)
export const getActiveMatch = (): Match | null => {
    const rows = executeQuery<any>(
        'SELECT * FROM matches WHERE status = ? ORDER BY created_at DESC LIMIT 1',
        ['active']
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    const rounds = getRoundsByMatchId(row.id);

    return {
        id: row.id,
        gameType: row.game_type,
        playerIds: JSON.parse(row.player_ids),
        playerNames: JSON.parse(row.player_names),
        configSnapshot: JSON.parse(row.config_snapshot),
        rounds,
        totalScores: JSON.parse(row.total_scores),
        status: row.status,
        createdAt: row.created_at,
        completedAt: row.completed_at || undefined
    };
};

// Get match by ID
export const getMatchById = (id: string): Match | null => {
    const rows = executeQuery<any>(
        'SELECT * FROM matches WHERE id = ?',
        [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    const rounds = getRoundsByMatchId(row.id);

    return {
        id: row.id,
        gameType: row.game_type,
        playerIds: JSON.parse(row.player_ids),
        playerNames: JSON.parse(row.player_names),
        configSnapshot: JSON.parse(row.config_snapshot),
        rounds,
        totalScores: JSON.parse(row.total_scores),
        status: row.status,
        createdAt: row.created_at,
        completedAt: row.completed_at || undefined
    };
};

// Get all completed matches
export const getAllMatches = (): Match[] => {
    const rows = executeQuery<any>(
        'SELECT * FROM matches ORDER BY created_at DESC'
    );

    return rows.map(row => {
        const rounds = getRoundsByMatchId(row.id);
        return {
            id: row.id,
            gameType: row.game_type,
            playerIds: JSON.parse(row.player_ids),
            playerNames: JSON.parse(row.player_names),
            configSnapshot: JSON.parse(row.config_snapshot),
            rounds,
            totalScores: JSON.parse(row.total_scores),
            status: row.status,
            createdAt: row.created_at,
            completedAt: row.completed_at || undefined
        };
    });
};

// Update match config (can be done during active match)
export const updateMatchConfig = (matchId: string, config: ScoringConfig): void => {
    executeUpdate(
        'UPDATE matches SET config_snapshot = ? WHERE id = ?',
        [JSON.stringify(config), matchId]
    );
};

// Update match total scores
export const updateMatchTotalScores = (matchId: string, totalScores: { [playerId: string]: number }): void => {
    executeUpdate(
        'UPDATE matches SET total_scores = ? WHERE id = ?',
        [JSON.stringify(totalScores), matchId]
    );
};

// Complete a match
export const completeMatch = (matchId: string): void => {
    executeUpdate(
        'UPDATE matches SET status = ?, completed_at = ? WHERE id = ?',
        ['completed', Date.now(), matchId]
    );
};

// Delete a match and all its rounds
export const deleteMatch = (id: string): void => {
    deleteRoundsByMatchId(id);
    executeUpdate('DELETE FROM matches WHERE id = ?', [id]);
};

// Get matches by player ID
export const getMatchesByPlayerId = (playerId: string): Match[] => {
    const rows = executeQuery<any>(
        `SELECT * FROM matches 
         WHERE player_ids LIKE ? 
         ORDER BY created_at DESC`,
        [`%"${playerId}"%`]
    );

    return rows.map(row => {
        const rounds = getRoundsByMatchId(row.id);
        return {
            id: row.id,
            gameType: row.game_type,
            playerIds: JSON.parse(row.player_ids),
            playerNames: JSON.parse(row.player_names),
            configSnapshot: JSON.parse(row.config_snapshot),
            rounds,
            totalScores: JSON.parse(row.total_scores),
            status: row.status,
            createdAt: row.created_at,
            completedAt: row.completed_at || undefined
        };
    });
};
