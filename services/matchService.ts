import { Match, Round, ScoringConfig } from '../types/models';
import { executeQuery, executeUpdate, getDatabase } from './database';
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

// Pause a match (set to 'paused')
export const pauseMatch = (matchId: string): void => {
    executeUpdate(
        'UPDATE matches SET status = ? WHERE id = ?',
        ['paused', matchId]
    );
};

// Resume a match (set to 'active', pause any other active match)
export const resumeMatch = (matchId: string): void => {
    // First, pause any currently active match
    executeUpdate(
        'UPDATE matches SET status = ? WHERE status = ?',
        ['paused', 'active']
    );

    // Then set the target match to active
    executeUpdate(
        'UPDATE matches SET status = ? WHERE id = ?',
        ['active', matchId]
    );
};

// Get all ongoing matches (active + paused)
export const getOngoingMatches = (): Match[] => {
    const rows = executeQuery<any>(
        'SELECT * FROM matches WHERE status IN (?, ?) ORDER BY created_at DESC',
        ['active', 'paused']
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

// Get only completed matches (for history)
export const getCompletedMatches = (): Match[] => {
    const rows = executeQuery<any>(
        'SELECT * FROM matches WHERE status = ? ORDER BY completed_at DESC',
        ['completed']
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

/**
 * Update scores for a specific round
 */
export const updateRoundScores = async (
    matchId: string,
    roundId: string,
    newScores: { [playerId: string]: number }
): Promise<void> => {
    const db = await getDatabase();

    try {
        // Update round scores in database
        await db.runAsync(
            'UPDATE rounds SET round_scores = ? WHERE id = ?',
            [JSON.stringify(newScores), roundId]
        );

        // Recalculate total scores for the match
        const rounds = await db.getAllAsync<any>(
            'SELECT * FROM rounds WHERE match_id = ? ORDER BY round_number ASC',
            [matchId]
        );

        const totalScores: { [playerId: string]: number } = {};

        rounds.forEach((round: any) => {
            const roundScores = JSON.parse(round.round_scores);
            Object.entries(roundScores).forEach(([playerId, score]) => {
                totalScores[playerId] = (totalScores[playerId] || 0) + (score as number);
            });
        });

        // Update match total scores
        await db.runAsync(
            'UPDATE matches SET total_scores = ? WHERE id = ?',
            [JSON.stringify(totalScores), matchId]
        );
    } catch (error) {
        console.error('Error updating round scores:', error);
        throw error;
    }
};

/**
 * Delete a round from a match
 */
export const deleteRound = async (matchId: string, roundId: string): Promise<void> => {
    const db = await getDatabase();

    try {
        // Delete the round
        await db.runAsync('DELETE FROM rounds WHERE id = ?', [roundId]);

        // Get remaining rounds
        const rounds = await db.getAllAsync<any>(
            'SELECT * FROM rounds WHERE match_id = ? ORDER BY round_number ASC',
            [matchId]
        );

        // Renumber rounds
        for (let i = 0; i < rounds.length; i++) {
            await db.runAsync(
                'UPDATE rounds SET round_number = ? WHERE id = ?',
                [i + 1, rounds[i].id]
            );
        }

        // Recalculate total scores
        const totalScores: { [playerId: string]: number } = {};

        rounds.forEach((round: any) => {
            const roundScores = JSON.parse(round.round_scores);
            Object.entries(roundScores).forEach(([playerId, score]) => {
                totalScores[playerId] = (totalScores[playerId] || 0) + (score as number);
            });
        });

        // Update match total scores
        await db.runAsync(
            'UPDATE matches SET total_scores = ? WHERE id = ?',
            [JSON.stringify(totalScores), matchId]
        );
    } catch (error) {
        console.error('Error deleting round:', error);
        throw error;
    }
};
