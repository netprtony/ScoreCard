import { ScoringConfig, MatchPlayerResult } from '../types/models';

/**
 * Calculate base ranking scores
 * First place takes from Last place
 * Second place takes from Third place
 */
function calculateBaseScores(
    results: MatchPlayerResult[],
    config: ScoringConfig
): Map<string, number> {
    const scores = new Map<string, number>();

    // Sort by rank
    const sorted = [...results].sort((a, b) => a.rank - b.rank);
    const [first, second, third, fourth] = sorted;

    // Initialize all scores to 0
    results.forEach(r => scores.set(r.playerId, 0));

    // Check for Tới Trắng (special case)
    if (config.enableToiTrang && first.isToiTrang) {
        // Winner gets baseRatioFirst × toiTrangMultiplier
        const winnerPoints = config.baseRatioFirst * config.toiTrangMultiplier;
        scores.set(first.playerId, winnerPoints);

        // ALL other players lose the same amount
        scores.set(second.playerId, -winnerPoints);
        scores.set(third.playerId, -winnerPoints);
        scores.set(fourth.playerId, -winnerPoints);

        return scores; // No other rules apply for Tới Trắng
    }

    // Normal scoring
    // First vs Fourth
    scores.set(first.playerId, config.baseRatioFirst);
    scores.set(fourth.playerId, -config.baseRatioFirst);

    // Second vs Third
    scores.set(second.playerId, config.baseRatioSecond);
    scores.set(third.playerId, -config.baseRatioSecond);

    return scores;
}

/**
 * Calculate penalty points for a player
 */
function calculatePenalties(
    result: MatchPlayerResult,
    config: ScoringConfig
): number {
    if (!config.enablePenalties) return 0;

    let total = 0;

    for (const penalty of result.penalties) {
        let value = 0;
        switch (penalty.type) {
            case 'heo_den':
                value = config.penaltyHeoDen;
                break;
            case 'heo_do':
                value = config.penaltyHeoDo;
                break;
            case 'ba_tep':
                value = config.penaltyBaTep;
                break;
            case 'ba_doi_thong':
                value = config.penaltyBaDoiThong;
                break;
            case 'tu_quy':
                value = config.penaltyTuQuy;
                break;
        }
        total += value * penalty.count;
    }

    return total;
}

/**
 * Apply penalty rules
 * Default: penalties go to third place
 * Special: if killed, penalties go to killer
 */
function applyPenalties(
    results: MatchPlayerResult[],
    config: ScoringConfig,
    scores: Map<string, number>
): void {
    if (!config.enablePenalties) return;

    const sorted = [...results].sort((a, b) => a.rank - b.rank);
    const thirdPlace = sorted[2];

    for (const result of results) {
        const penaltyAmount = calculatePenalties(result, config);

        if (penaltyAmount > 0) {
            // Player loses penalty points
            const currentScore = scores.get(result.playerId) || 0;
            scores.set(result.playerId, currentScore - penaltyAmount);

            // Determine who receives the penalty points
            if (config.enableKill && result.isKilled && result.killedBy) {
                // Killer receives penalty points
                const killerScore = scores.get(result.killedBy) || 0;
                scores.set(result.killedBy, killerScore + penaltyAmount);
            } else {
                // Third place receives penalty points
                const thirdScore = scores.get(thirdPlace.playerId) || 0;
                scores.set(thirdPlace.playerId, thirdScore + penaltyAmount);
            }
        }
    }
}

/**
 * Apply kill (Giết) rules
 * Killed player: base loss × killMultiplier, then add penalties separately
 * Killer receives all lost points
 */
function applyKillRules(
    results: MatchPlayerResult[],
    config: ScoringConfig,
    scores: Map<string, number>
): void {
    if (!config.enableKill) return;

    for (const result of results) {
        if (result.isKilled && result.killedBy) {
            const currentScore = scores.get(result.playerId) || 0;
            const penaltyAmount = calculatePenalties(result, config);

            // Separate base score from penalties
            const baseScore = currentScore + penaltyAmount; // Remove penalties temporarily

            // Apply kill multiplier to base score only
            const killedBaseScore = baseScore * config.killMultiplier;

            // Add penalties back (not multiplied)
            const totalKilledScore = killedBaseScore - penaltyAmount;

            scores.set(result.playerId, totalKilledScore);

            // Killer gains the difference
            const killerScore = scores.get(result.killedBy) || 0;
            const gainedPoints = currentScore - totalKilledScore;
            scores.set(result.killedBy, killerScore + gainedPoints);
        }
    }
}

/**
 * Apply Chặt heo rules
 */
function applyChatHeo(
    results: MatchPlayerResult[],
    config: ScoringConfig,
    scores: Map<string, number>
): void {
    if (!config.enableChatHeo) return;

    for (const result of results) {
        if (result.chatHeo && result.chatHeo.choppedBy) {
            const value = result.chatHeo.type === 'black'
                ? config.chatHeoBlack
                : config.chatHeoRed;

            const totalValue = value * result.chatHeo.count * result.chatHeo.chongMultiplier;

            // This player loses points (was chopped)
            const currentScore = scores.get(result.playerId) || 0;
            scores.set(result.playerId, currentScore - totalValue);

            // Chopper gains points
            const chopperScore = scores.get(result.chatHeo.choppedBy) || 0;
            scores.set(result.chatHeo.choppedBy, chopperScore + totalValue);
        }
    }
}

/**
 * Apply Đút 3 tép rule
 * Penalized player loses points
 * First place gains points
 */
function applyDutBaTep(
    results: MatchPlayerResult[],
    config: ScoringConfig,
    scores: Map<string, number>
): void {
    if (!config.enableDutBaTep) return;

    const sorted = [...results].sort((a, b) => a.rank - b.rank);
    const firstPlace = sorted[0];

    for (const result of results) {
        if (result.dutBaTep) {
            const currentScore = scores.get(result.playerId) || 0;
            scores.set(result.playerId, currentScore - config.dutBaTep);

            const firstScore = scores.get(firstPlace.playerId) || 0;
            scores.set(firstPlace.playerId, firstScore + config.dutBaTep);
        }
    }
}

/**
 * Main scoring calculation function
 * Applies all rules in correct order
 */
export function calculateMatchScores(
    results: MatchPlayerResult[],
    config: ScoringConfig
): Map<string, number> {
    // Initialize scores with base ranking
    const scores = calculateBaseScores(results, config);

    // If Tới Trắng, no other rules apply
    const sorted = [...results].sort((a, b) => a.rank - b.rank);
    if (config.enableToiTrang && sorted[0].isToiTrang) {
        return scores;
    }

    // Apply penalties (must be before kill rules)
    applyPenalties(results, config, scores);

    // Apply kill rules (after penalties)
    applyKillRules(results, config, scores);

    // Apply Chặt heo
    applyChatHeo(results, config, scores);

    // Apply Đút 3 tép
    applyDutBaTep(results, config, scores);

    return scores;
}

/**
 * Validate scoring configuration
 */
export function validateScoringConfig(config: Partial<ScoringConfig>): string[] {
    const errors: string[] = [];

    if (config.baseRatioFirst !== undefined &&
        config.baseRatioSecond !== undefined &&
        config.baseRatioFirst <= config.baseRatioSecond) {
        errors.push('Hệ số 1 phải lớn hơn hệ số 2');
    }

    if (config.penaltyHeoDo !== undefined &&
        config.penaltyHeoDen !== undefined &&
        config.penaltyHeoDo <= config.penaltyHeoDen) {
        errors.push('Phạt heo đỏ phải lớn hơn phạt heo đen');
    }

    return errors;
}
