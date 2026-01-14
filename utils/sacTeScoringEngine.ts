import { SacTeConfig, SacTeRoundOutcome } from '../types/models';

export interface SacTeScoringResult {
    roundScores: { [playerId: string]: number };
    transactions: {
        playerId: string;
        type: string;
        amount: number;
        description: string;
    }[];
}

/**
 * Calculate scores for a Sắc Tê round
 * @param playerIds - Array of player IDs
 * @param outcome - Round outcome from dealer input
 * @param config - Game configuration
 * @param caHeoAccumulated - Virtual pot value before this round
 * @param caHeoRoundsAccumulated - Number of rounds pot has accumulated
 */
export const calculateSacTeRoundScores = (
    playerIds: string[],
    outcome: SacTeRoundOutcome,
    config: SacTeConfig,
    caHeoAccumulated: number,
    caHeoRoundsAccumulated: number
): SacTeScoringResult => {
    const scores: { [playerId: string]: number } = {};
    const transactions: any[] = [];

    // Initialize all scores to 0
    playerIds.forEach(id => {
        scores[id] = 0;
    });

    const numberOfPlayers = playerIds.length;
    const winnerId = outcome.winnerId;
    const isWhiteWin = outcome.isWhiteWin;

    // Case 1: White Win (Tới Trắng)
    if (isWhiteWin) {
        // All other players auto-gục
        const numberOfLosers = numberOfPlayers - 1;
        const basePoints = config.heSoGuc * config.whiteWinMultiplier * numberOfLosers;

        // Winner gets base points
        scores[winnerId] += basePoints;
        transactions.push({
            playerId: winnerId,
            type: 'WHITE_WIN',
            amount: basePoints,
            description: `Tới Trắng: +${basePoints}`,
        });

        // All losers get penalty
        const penalty = -(config.heSoGuc * config.whiteWinMultiplier);
        playerIds.forEach(id => {
            if (id !== winnerId) {
                scores[id] += penalty;
                transactions.push({
                    playerId: id,
                    type: 'WHITE_WIN_PENALTY',
                    amount: penalty,
                    description: `Bị Tới Trắng: ${penalty}`,
                });
            }
        });

        // Cá Nước (Required for White Win)
        if (config.caNuoc.enabled && outcome.caNuocWinnerId) {
            const caNuocWinner = outcome.caNuocWinnerId;
            const caNuocBonus = (numberOfPlayers - 1) * config.caNuoc.heSo;

            scores[caNuocWinner] += caNuocBonus;
            transactions.push({
                playerId: caNuocWinner,
                type: 'CÁ_NƯỚC_WIN',
                amount: caNuocBonus,
                description: `Cá Nước: +${caNuocBonus}`,
            });

            playerIds.forEach(id => {
                if (id !== caNuocWinner) {
                    scores[id] -= config.caNuoc.heSo;
                    transactions.push({
                        playerId: id,
                        type: 'CÁ_NƯỚC_COST',
                        amount: -config.caNuoc.heSo,
                        description: `Cá Nước: -${config.caNuoc.heSo}`,
                    });
                }
            });
        }

        // Cá Heo (Optional)
        if (config.caHeo.enabled && outcome.caHeoWinnerId) {
            const caHeoWinner = outcome.caHeoWinnerId;
            // Formula: Winner = heSo × (caHeoRoundsAccumulated + 1) × (numberOfPlayers - 1)
            //          Each loser = -heSo × (caHeoRoundsAccumulated + 1)
            const rounds = caHeoRoundsAccumulated + 1; // Include current round
            const winnerBonus = config.caHeo.heSo * rounds * (numberOfPlayers - 1);

            scores[caHeoWinner] += winnerBonus;
            transactions.push({
                playerId: caHeoWinner,
                type: 'CÁ_HEO_WIN',
                amount: winnerBonus,
                description: `Cá Heo (${rounds} ván): +${winnerBonus}`,
            });

            // Each loser pays: heSo × rounds
            const loserCost = config.caHeo.heSo * rounds;
            playerIds.forEach(id => {
                if (id !== caHeoWinner) {
                    scores[id] -= loserCost;
                    transactions.push({
                        playerId: id,
                        type: 'CÁ_HEO_COST',
                        amount: -loserCost,
                        description: `Cá Heo (${rounds} ván): -${loserCost}`,
                    });
                }
            });
        }
    } else {
        // Case 2: Normal Win (Chiến Thắng)

        // Calculate loser penalties
        let totalPenalties = 0;
        outcome.playerStatuses.forEach(status => {
            if (status.playerId !== winnerId) {
                let penalty = 0;
                if (status.isGuc) {
                    penalty = config.heSoGuc;
                } else if (status.hasTon) {
                    penalty = config.heSoTon;
                } else {
                    // No status: default penalty (use tồn as base)
                    penalty = config.heSoTon;
                }

                scores[status.playerId] -= penalty;
                totalPenalties += penalty;

                const statusText = status.isGuc ? 'Gục' : status.hasTon ? 'Tồn' : 'Thua';
                transactions.push({
                    playerId: status.playerId,
                    type: status.isGuc ? 'GỤC_PENALTY' : status.hasTon ? 'TỒN_PENALTY' : 'LOSE',
                    amount: -penalty,
                    description: `${statusText}: -${penalty}`,
                });
            }
        });

        // Winner gets sum of all penalties
        scores[winnerId] += totalPenalties;
        transactions.push({
            playerId: winnerId,
            type: 'WIN',
            amount: totalPenalties,
            description: `Chiến Thắng: +${totalPenalties}`,
        });

        // Cá Nước (if dealer marks winner)
        if (config.caNuoc.enabled && outcome.caNuocWinnerId) {
            const caNuocWinner = outcome.caNuocWinnerId;
            const caNuocBonus = (numberOfPlayers - 1) * config.caNuoc.heSo;

            scores[caNuocWinner] += caNuocBonus;
            transactions.push({
                playerId: caNuocWinner,
                type: 'CÁ_NƯỚC_WIN',
                amount: caNuocBonus,
                description: `Cá Nước: +${caNuocBonus}`,
            });

            playerIds.forEach(id => {
                if (id !== caNuocWinner) {
                    scores[id] -= config.caNuoc.heSo;
                    transactions.push({
                        playerId: id,
                        type: 'CÁ_NƯỚC_COST',
                        amount: -config.caNuoc.heSo,
                        description: `Cá Nước: -${config.caNuoc.heSo}`,
                    });
                }
            });
        }

        // Cá Heo (if dealer marks winner)
        if (config.caHeo.enabled && outcome.caHeoWinnerId) {
            const caHeoWinner = outcome.caHeoWinnerId;
            // Formula: Winner = heSo × (caHeoRoundsAccumulated + 1) × (numberOfPlayers - 1)
            //          Each loser = -heSo × (caHeoRoundsAccumulated + 1)
            const rounds = caHeoRoundsAccumulated + 1; // Include current round
            const winnerBonus = config.caHeo.heSo * rounds * (numberOfPlayers - 1);

            scores[caHeoWinner] += winnerBonus;
            transactions.push({
                playerId: caHeoWinner,
                type: 'CÁ_HEO_WIN',
                amount: winnerBonus,
                description: `Cá Heo (${rounds} ván): +${winnerBonus}`,
            });

            // Each loser pays: heSo × rounds
            const loserCost = config.caHeo.heSo * rounds;
            playerIds.forEach(id => {
                if (id !== caHeoWinner) {
                    scores[id] -= loserCost;
                    transactions.push({
                        playerId: id,
                        type: 'CÁ_HEO_COST',
                        amount: -loserCost,
                        description: `Cá Heo (${rounds} ván): -${loserCost}`,
                    });
                }
            });
        }
    }

    return {
        roundScores: scores,
        transactions,
    };
};

/**
 * Validate that scores sum to zero (or close to zero accounting for pot carryover)
 */
export const validateSacTeScores = (scores: { [playerId: string]: number }): boolean => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    // Allow small rounding errors
    return Math.abs(total) < 0.01;
};
