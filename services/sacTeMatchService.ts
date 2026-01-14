import { SacTeMatch, SacTeConfig, SacTeRound, SacTeRoundOutcome } from '../types/models';
import { executeQuery, executeUpdate } from './database';

/**
 * Create a new Sắc Tê match
 */
export const createSacTeMatch = (
    playerIds: string[],
    playerNames: string[],
    config: SacTeConfig
): SacTeMatch => {
    const newMatch: SacTeMatch = {
        id: `sac_te_match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gameType: 'sac_te',
        playerIds,
        playerNames,
        configSnapshot: config,
        rounds: [],
        totalScores: playerIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
        caHeoCurrentPot: 0,
        caHeoRoundsAccumulated: 0,
        status: 'active',
        createdAt: Date.now(),
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
            newMatch.createdAt,
        ]
    );

    return newMatch;
};

/**
 * Add a round to Sắc Tê match
 */
export const addSacTeRound = (
    matchId: string,
    outcome: SacTeRoundOutcome,
    roundScores: { [playerId: string]: number },
    caHeoAccumulated: number,
    caHeoRoundsAccumulated: number
): void => {
    // Get current match to determine round number
    const matchRows = executeQuery<any>('SELECT * FROM matches WHERE id = ?', [matchId]);
    if (matchRows.length === 0) {
        throw new Error('Match not found');
    }

    const match = matchRows[0];
    const config = JSON.parse(match.config_snapshot);
    const currentRounds = executeQuery<any>(
        'SELECT COUNT(*) as count FROM rounds WHERE match_id = ?',
        [matchId]
    );
    const roundNumber = (currentRounds[0]?.count || 0) + 1;

    // Create round
    const roundId = `sac_te_round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    executeUpdate(
        `INSERT INTO rounds (
            id, match_id, round_number,
            rankings, toi_trang_winner, actions,
            penalties, chat_heo_chains, dut_ba_tep_players,
            round_scores, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            roundId,
            matchId,
            roundNumber,
            JSON.stringify(outcome.playerStatuses), // Store as rankings
            outcome.isWhiteWin ? outcome.winnerId : null,
            JSON.stringify({
                outcome,
                caHeoPot: outcome.caHeoWinnerId ? 0 : (caHeoAccumulated + (config.caHeo?.enabled ? (JSON.parse(match.player_ids).length * config.caHeo.heSo) : 0))
            }), // Store full outcome + pot value
            JSON.stringify([]),
            JSON.stringify([]),
            JSON.stringify([]),
            JSON.stringify(roundScores),
            Date.now(),
        ]
    );

    // Update match total scores
    const totalScores = JSON.parse(match.total_scores);
    Object.entries(roundScores).forEach(([playerId, score]) => {
        totalScores[playerId] = (totalScores[playerId] || 0) + score;
    });

    // Update cá heo pot
    let newCaHeoCurrentPot = caHeoAccumulated;
    let newCaHeoRoundsAccumulated = caHeoRoundsAccumulated;

    if (config.caHeo?.enabled) {
        const numberOfPlayers = JSON.parse(match.player_ids).length;
        const currentContribution = numberOfPlayers * config.caHeo.heSo;

        if (outcome.caHeoWinnerId) {
            // Someone won cá heo, reset pot
            newCaHeoCurrentPot = 0;
            newCaHeoRoundsAccumulated = 0;
        } else {
            // No winner, accumulate
            newCaHeoCurrentPot = caHeoAccumulated + currentContribution;
            newCaHeoRoundsAccumulated = caHeoRoundsAccumulated + 1;
        }
    }

    executeUpdate(
        `UPDATE matches SET 
            total_scores = ?,
            config_snapshot = ?
        WHERE id = ?`,
        [
            JSON.stringify(totalScores),
            JSON.stringify({
                ...config,
                _caHeoCurrentPot: newCaHeoCurrentPot,
                _caHeoRoundsAccumulated: newCaHeoRoundsAccumulated,
            }),
            matchId,
        ]
    );
};

/**
 * Get Sắc Tê match by ID with pot tracking
 */
export const getSacTeMatchById = (matchId: string): SacTeMatch | null => {
    const rows = executeQuery<any>('SELECT * FROM matches WHERE id = ?', [matchId]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const config = JSON.parse(row.config_snapshot);

    // Get rounds
    const roundRows = executeQuery<any>(
        'SELECT * FROM rounds WHERE match_id = ? ORDER BY round_number ASC',
        [matchId]
    );

    const rounds: SacTeRound[] = roundRows.map((r: any) => {
        const actions = JSON.parse(r.actions || '{}');
        return {
            id: r.id,
            matchId: r.match_id,
            roundNumber: r.round_number,
            outcome: actions.outcome,
            roundScores: JSON.parse(r.round_scores),
            caHeoAccumulated: 0, // Will be calculated
            caHeoRoundsAccumulated: 0,
            createdAt: r.created_at,
        };
    });

    return {
        id: row.id,
        gameType: 'sac_te',
        playerIds: JSON.parse(row.player_ids),
        playerNames: JSON.parse(row.player_names),
        configSnapshot: config,
        rounds,
        totalScores: JSON.parse(row.total_scores),
        caHeoCurrentPot: config._caHeoCurrentPot || 0,
        caHeoRoundsAccumulated: config._caHeoRoundsAccumulated || 0,
        status: row.status,
        createdAt: row.created_at,
        completedAt: row.completed_at || undefined,
    };
};
