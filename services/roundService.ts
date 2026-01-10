import { Round } from '../types/models';
import { executeQuery, executeUpdate } from './database';

export const createRound = (round: Omit<Round, 'id' | 'createdAt'>): Round => {
    const newRound: Round = {
        ...round,
        id: `round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now()
    };

    executeUpdate(
        `INSERT INTO rounds (
            id, match_id, round_number, rankings,
            toi_trang_winner, actions, penalties, chat_heo_chains,
            dut_ba_tep_players, round_scores, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            newRound.id,
            newRound.matchId,
            newRound.roundNumber,
            JSON.stringify(newRound.rankings),
            newRound.toiTrangWinner || null,
            JSON.stringify(newRound.actions),
            JSON.stringify(newRound.penalties),
            JSON.stringify(newRound.chatHeoChains),
            JSON.stringify(newRound.dutBaTepPlayers),
            JSON.stringify(newRound.roundScores),
            newRound.createdAt
        ]
    );

    return newRound;
};

export const getRoundsByMatchId = (matchId: string): Round[] => {
    const rows = executeQuery<any>(
        'SELECT * FROM rounds WHERE match_id = ? ORDER BY round_number ASC',
        [matchId]
    );

    return rows.map(row => ({
        id: row.id,
        matchId: row.match_id,
        roundNumber: row.round_number,
        rankings: JSON.parse(row.rankings),
        toiTrangWinner: row.toi_trang_winner || undefined,
        actions: JSON.parse(row.actions || '[]'),
        penalties: JSON.parse(row.penalties || '[]'),
        chatHeoChains: JSON.parse(row.chat_heo_chains || '[]'),
        dutBaTepPlayers: JSON.parse(row.dut_ba_tep_players || '[]'),
        roundScores: JSON.parse(row.round_scores),
        createdAt: row.created_at
    }));
};

export const getRoundById = (id: string): Round | null => {
    const rows = executeQuery<any>(
        'SELECT * FROM rounds WHERE id = ?',
        [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
        id: row.id,
        matchId: row.match_id,
        roundNumber: row.round_number,
        rankings: JSON.parse(row.rankings),
        toiTrangWinner: row.toi_trang_winner || undefined,
        actions: JSON.parse(row.actions || '[]'),
        penalties: JSON.parse(row.penalties || '[]'),
        chatHeoChains: JSON.parse(row.chat_heo_chains || '[]'),
        dutBaTepPlayers: JSON.parse(row.dut_ba_tep_players || '[]'),
        roundScores: JSON.parse(row.round_scores),
        createdAt: row.created_at
    };
};

export const deleteRound = (id: string): void => {
    executeUpdate('DELETE FROM rounds WHERE id = ?', [id]);
};

export const deleteRoundsByMatchId = (matchId: string): void => {
    executeUpdate('DELETE FROM rounds WHERE match_id = ?', [matchId]);
};
