import { ScoringConfig, PlayerAction, Round, PenaltyType, ChatHeoType } from '../types/models';

interface ScoringResult {
    roundScores: { [playerId: string]: number };
    breakdown: {
        playerId: string;
        baseScore: number;
        heoScore: number;
        chongScore: number;
        gietScore: number;
        dutBaTepScore: number;
        totalScore: number;
    }[];
}

/**
 * Calculate scores for a round based on rankings and actions
 */
export const calculateRoundScores = (
    playerIds: string[],
    rankings: { playerId: string; rank: 1 | 2 | 3 | 4 }[],
    toiTrangWinner: string | undefined,
    actions: PlayerAction[],
    config: ScoringConfig
): ScoringResult => {
    // Initialize scores
    const scores: { [playerId: string]: number } = {};
    const breakdown = playerIds.map(id => ({
        playerId: id,
        baseScore: 0,
        heoScore: 0,
        chongScore: 0,
        gietScore: 0,
        dutBaTepScore: 0,
        totalScore: 0,
    }));

    playerIds.forEach(id => scores[id] = 0);

    // 1. Tới Trắng - overrides everything
    if (toiTrangWinner && config.enableToiTrang) {
        const winnerScore = config.baseRatioFirst * config.toiTrangMultiplier;
        playerIds.forEach(id => {
            const score = id === toiTrangWinner ? winnerScore * 3 : -winnerScore;
            scores[id] = score;
            const player = breakdown.find(p => p.playerId === id);
            if (player) {
                player.baseScore = score;
                player.totalScore = score;
            }
        });
        return { roundScores: scores, breakdown };
    }

    // 2. Base scores from rankings
    const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
    scores[sorted[0].playerId] = config.baseRatioFirst;
    scores[sorted[1].playerId] = config.baseRatioSecond;
    scores[sorted[2].playerId] = -config.baseRatioSecond;
    scores[sorted[3].playerId] = -config.baseRatioFirst;

    breakdown.forEach(player => {
        player.baseScore = scores[player.playerId];
    });

    // 3. Process Heo actions
    if (config.enablePenalties) {
        const heoActions = actions.filter(a => a.actionType === 'heo');
        heoActions.forEach(action => {
            if (!action.targetId || !action.heoType || !action.heoCount) return;

            const points = action.heoType === 'den' ? config.penaltyHeoDen : config.penaltyHeoDo;
            const totalPenalty = points * action.heoCount;

            // Target loses points
            scores[action.targetId] -= totalPenalty;
            const targetPlayer = breakdown.find(p => p.playerId === action.targetId);
            if (targetPlayer) targetPlayer.heoScore -= totalPenalty;

            // Actor gains points (or 3rd place if actor is target)
            const beneficiary = action.actorId;
            scores[beneficiary] += totalPenalty;
            const beneficiaryPlayer = breakdown.find(p => p.playerId === beneficiary);
            if (beneficiaryPlayer) beneficiaryPlayer.heoScore += totalPenalty;
        });
    }

    // 4. Process Chồng actions
    if (config.enableChatHeo) {
        const chongActions = actions.filter(a => a.actionType === 'chong');
        chongActions.forEach(action => {
            if (!action.targetId || !action.chongTypes || !action.chongCounts) return;

            let totalPenalty = 0;
            action.chongTypes.forEach(type => {
                const count = action.chongCounts![type] || 1;
                let points = 0;

                switch (type) {
                    case 'heo_den':
                        points = config.chatHeoBlack;
                        break;
                    case 'heo_do':
                        points = config.chatHeoRed;
                        break;
                    case 'tu_quy':
                        points = config.penaltyTuQuy;
                        break;
                    case 'ba_doi_thong':
                        points = config.penaltyBaDoiThong;
                        break;
                }

                totalPenalty += points * count * config.chongHeoMultiplier;
            });

            // Target loses points
            scores[action.targetId] -= totalPenalty;
            const targetPlayer = breakdown.find(p => p.playerId === action.targetId);
            if (targetPlayer) targetPlayer.chongScore -= totalPenalty;

            // Actor gains points
            scores[action.actorId] += totalPenalty;
            const actorPlayer = breakdown.find(p => p.playerId === action.actorId);
            if (actorPlayer) actorPlayer.chongScore += totalPenalty;
        });
    }

    // 5. Process Giết actions
    if (config.enableKill) {
        const gietActions = actions.filter(a => a.actionType === 'giet');

        if (gietActions.length > 0) {
            // Collect all killed players
            const killedPlayerIds = new Set(gietActions.map(a => a.targetId).filter(Boolean));
            const killCount = killedPlayerIds.size;
            const killer = gietActions[0].actorId; // Assume same killer for all

            // Calculate total kill score
            let totalKillScore = 0;
            const victimScores: { [playerId: string]: number } = {};

            gietActions.forEach(action => {
                if (!action.targetId) return;

                // Base kill score per victim
                const baseKillScore = config.baseRatioFirst * config.killMultiplier;
                let killScore = baseKillScore;

                // Add penalties for this victim
                if (config.enablePenalties && action.killedPenalties) {
                    action.killedPenalties.forEach(penalty => {
                        let points = 0;
                        switch (penalty.type) {
                            case 'heo_den': points = config.penaltyHeoDen; break;
                            case 'heo_do': points = config.penaltyHeoDo; break;
                            case 'ba_tep': points = config.penaltyBaTep; break;
                            case 'ba_doi_thong': points = config.penaltyBaDoiThong; break;
                            case 'tu_quy': points = config.penaltyTuQuy; break;
                        }
                        killScore += points * penalty.count;
                    });
                }

                totalKillScore += killScore;
                victimScores[action.targetId] = (victimScores[action.targetId] || 0) - killScore;
            });

            // Handle Case 2: Double kill (1v2)
            if (killCount === 2) {
                // Find the neutral player (not killer, not victims)
                const neutralPlayer = playerIds.find(id =>
                    id !== killer && !killedPlayerIds.has(id)
                );

                if (neutralPlayer) {
                    // In double kill:
                    // - Killer: Remove base score, only gets kill scores
                    // - Victims: Remove base scores, only lose kill penalties
                    // - Neutral: Set to 0

                    // Remove base score from killer
                    const killerPlayer = breakdown.find(p => p.playerId === killer);
                    if (killerPlayer) {
                        const killerBaseScore = killerPlayer.baseScore;
                        scores[killer] -= killerBaseScore;
                        killerPlayer.baseScore = 0;
                    }

                    // Remove base scores from victims (they're rank 4 but killed)
                    killedPlayerIds.forEach(victimId => {
                        const victimPlayer = breakdown.find(p => p.playerId === victimId);
                        if (victimPlayer) {
                            // Remove the base score that was applied earlier
                            const victimBaseScore = victimPlayer.baseScore;
                            scores[victimId] -= victimBaseScore;
                            victimPlayer.baseScore = 0;
                        }
                    });

                    // Set neutral player to 0
                    const neutralBaseScore = scores[neutralPlayer];
                    scores[neutralPlayer] = 0;

                    const neutralPlayerBreakdown = breakdown.find(p => p.playerId === neutralPlayer);
                    if (neutralPlayerBreakdown) {
                        neutralPlayerBreakdown.baseScore = 0;
                        neutralPlayerBreakdown.totalScore = 0;
                    }

                    // Now apply kill scores
                    scores[killer] += totalKillScore;
                    if (killerPlayer) killerPlayer.gietScore += totalKillScore;

                    // Victims lose their respective kill amounts
                    Object.entries(victimScores).forEach(([victimId, score]) => {
                        scores[victimId] += score;
                        const victimPlayer = breakdown.find(p => p.playerId === victimId);
                        if (victimPlayer) victimPlayer.gietScore += score;
                    });
                }
            } else {
                // Case 1: Single kill (1v1) - normal scoring
                // Killer gains total
                scores[killer] += totalKillScore;
                const killerPlayer = breakdown.find(p => p.playerId === killer);
                if (killerPlayer) killerPlayer.gietScore += totalKillScore;

                // Victims lose their respective amounts
                Object.entries(victimScores).forEach(([victimId, score]) => {
                    scores[victimId] += score;
                    const victimPlayer = breakdown.find(p => p.playerId === victimId);
                    if (victimPlayer) victimPlayer.gietScore += score;
                });
            }
        }
    }

    // 6. Process Đút 3 Tép actions
    if (config.enableDutBaTep) {
        const dutBaTepActions = actions.filter(a => a.actionType === 'dut_ba_tep');
        dutBaTepActions.forEach(action => {
            const count = action.dutBaTepCount || 1;
            const totalPoints = config.dutBaTep * count;

            // Actor loses points
            scores[action.actorId] -= totalPoints;
            const actorPlayer = breakdown.find(p => p.playerId === action.actorId);
            if (actorPlayer) actorPlayer.dutBaTepScore -= totalPoints;

            // Winner (rank 1) gains points
            const winner = sorted[0].playerId;
            scores[winner] += totalPoints;
            const winnerPlayer = breakdown.find(p => p.playerId === winner);
            if (winnerPlayer) winnerPlayer.dutBaTepScore += totalPoints;
        });
    }

    // Update total scores in breakdown
    breakdown.forEach(player => {
        player.totalScore = scores[player.playerId];
    });

    return { roundScores: scores, breakdown };
};

/**
 * Validate that round scores sum to zero
 */
export const validateScores = (scores: { [playerId: string]: number }): boolean => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return Math.abs(total) < 0.01; // Allow small floating point errors
};
