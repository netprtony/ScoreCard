// Player model
export interface Player {
    id: string;
    name: string;
    color?: string; // Custom color for avatar and name (hex format)
    avatar?: string; // Local file path to avatar image
    createdAt: number;
}

// Game type model (NEW)
export interface GameType {
    id: string;
    name: string; // "Tiến Lên", "Phỏm", etc.
    icon: string;
    isActive: boolean;
    description: string;
}

// Penalty types
export type PenaltyType = 'heo_den' | 'heo_do' | 'ba_tep' | 'ba_doi_thong' | 'tu_quy';

// Chặt Heo types
export type ChatHeoType = 'heo_den' | 'heo_do' | 'tu_quy' | 'ba_doi_thong';

// Player Action types (NEW - for tracking all actions)
export type PlayerActionType = 'heo' | 'chong' | 'giet' | 'dut_ba_tep';

// Player Action (NEW - tracks all actions in a round)
export interface PlayerAction {
    id: string;
    roundId: string;
    actionType: PlayerActionType;
    actorId: string; // Who performed the action
    targetId?: string; // Who is affected (for Heo, Chồng, Giết)

    // For Heo
    heoType?: 'den' | 'do';
    heoCount?: number;

    // For Chồng
    chongTypes?: ChatHeoType[]; // Can chồng multiple types
    chongCounts?: { [type in ChatHeoType]?: number };

    // For Giết
    killedPenalties?: {
        type: PenaltyType;
        count: number;
    }[];

    // For Đút 3 Tép
    dutBaTepCount?: number;

    createdAt: number;
}

// Scoring configuration (UPDATED - all values user-configurable)
export interface ScoringConfig {
    id: string;
    name: string;
    baseRatioFirst: number; // Must be > baseRatioSecond
    baseRatioSecond: number;

    // Multipliers
    toiTrangMultiplier: number; // Default: 2
    killMultiplier: number; // Default: 2

    // Penalty values (user input)
    penaltyHeoDen: number;
    penaltyHeoDo: number; // Must be > penaltyHeoDen
    penaltyBaTep: number;
    penaltyBaDoiThong: number;
    penaltyTuQuy: number;

    // Chặt heo (user input)
    chatHeoBlack: number;
    chatHeoRed: number;

    // Đút 3 tép (user input)
    dutBaTep: number;

    // Rule toggles
    enableToiTrang: boolean;
    enableKill: boolean;
    enablePenalties: boolean;
    enableChatHeo: boolean;
    enableDutBaTep: boolean;

    isDefault: boolean;
    createdAt: number;
}

// Chặt Heo Chain (NEW - for linear chains)
export interface ChatHeoChain {
    type: ChatHeoType;
    chain: {
        chopperId: string; // Who did the chopping
        choppedId: string; // Who got chopped
        order: number; // Order in chain (1, 2, 3...)
    }[];
    finalChopperId: string; // Last person in chain gets all points
    finalChoppedId: string; // Second-to-last person loses all points
    totalPoints: number; // Calculated based on chain length
}

// Round model (NEW - represents one game/ván)
export interface Round {
    id: string;
    matchId: string;
    roundNumber: number;

    // Rankings
    rankings: {
        playerId: string;
        rank: 1 | 2 | 3 | 4;
    }[];

    // Special conditions
    toiTrangWinner?: string; // Only ONE player can win Tới Trắng

    // Player Actions (NEW - tracks all actions)
    actions: PlayerAction[];

    // Penalties (Thối) - DEPRECATED, use actions instead
    penalties: {
        playerId: string;
        type: PenaltyType;
        count: number;
    }[];

    // Chặt Heo (with chaining) - DEPRECATED, use actions instead
    chatHeoChains: ChatHeoChain[];

    // Đút 3 Tép - DEPRECATED, use actions instead
    dutBaTepPlayers: string[];

    // Calculated scores for this round
    roundScores: { [playerId: string]: number };

    createdAt: number;
}

// Match model (REDESIGNED - container for multiple rounds)
export interface Match {
    id: string;
    gameType: string; // "tien_len", "phom", etc.
    playerIds: string[]; // 4 players
    playerNames: string[]; // Snapshot for history
    configSnapshot: ScoringConfig; // Can be edited during match
    rounds: Round[]; // Multiple rounds
    totalScores: { [playerId: string]: number }; // Cumulative
    status: 'active' | 'paused' | 'completed';
    createdAt: number;
    completedAt?: number;
}

// Legacy MatchPlayerResult (kept for backward compatibility)
export interface MatchPlayerResult {
    playerId: string;
    playerName: string;
    rank: 1 | 2 | 3 | 4;
    isToiTrang: boolean;
    isKilled: boolean;
    killedBy?: string;
    penalties: {
        type: PenaltyType;
        count: number;
    }[];
    chatHeo?: {
        type: 'black' | 'red';
        count: number;
        chongMultiplier: number;
        choppedBy?: string;
    };
    dutBaTep: boolean;
    scoreChange: number;
}

// Player statistics
export interface PlayerStats {
    playerId: string;
    playerName: string;
    playerColor?: string;
    playerAvatar?: string;
    totalMatches: number;
    totalScore: number;
    winCount: number;
    killCount: number;
}

// App settings
export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    language: 'vi' | 'en';
    keepScreenAwake: boolean;
    backgroundImage?: string;
    hasCompletedOnboarding: boolean;
    hasAcceptedTerms: boolean;
}

// Countdown timer state
export interface TimerState {
    duration: number; // in seconds
    remaining: number;
    isRunning: boolean;
    isEnabled: boolean;
}

// ============================================
// SẮC TÊ GAME MODELS
// ============================================

// Sắc Tê Scoring Configuration
export interface SacTeConfig {
    id: string;
    name: string;

    // Betting rules
    caNuoc: {
        enabled: boolean;
        heSo: number;  // Points each player contributes to main pot
    };

    caHeo: {
        enabled: boolean;
        heSo: number;  // Points each player contributes to side pot
    };

    // Scoring multipliers
    heSoGuc: number;              // Penalty for gục players (e.g., 10)
    heSoTon: number;              // Penalty for tồn players (e.g., 5)
    whiteWinMultiplier: number;   // Multiplier for White Win (e.g., 2)

    // Game settings
    minPlayers: number;    // Default: 2
    maxPlayers: number;    // Default: 5

    isDefault: boolean;
    createdAt: number;
}

// Sắc Tê Round Outcome (Dealer Input)
export interface SacTeRoundOutcome {
    // Winner designation
    winnerId: string;
    isWhiteWin: boolean;

    // Player statuses (dealer assigns)
    playerStatuses: {
        playerId: string;
        isGuc: boolean;
        hasTon: boolean;
    }[];

    // Pot winners (dealer designates)
    caNuocWinnerId?: string;  // Usually same as winnerId
    caHeoWinnerId?: string;   // May be null (pot carries over)
}

// Sắc Tê Round (represents one game/ván)
export interface SacTeRound {
    id: string;
    matchId: string;
    roundNumber: number;

    // Round outcome
    outcome: SacTeRoundOutcome;

    // Calculated scores for this round
    roundScores: { [playerId: string]: number };

    // Pot state
    caHeoAccumulated: number;  // Virtual pot value before this round
    caHeoRoundsAccumulated: number;  // Number of rounds pot has accumulated

    createdAt: number;
}

// Sắc Tê Match (container for multiple rounds)
export interface SacTeMatch {
    id: string;
    gameType: 'sac_te';
    playerIds: string[];  // 2-5 players
    playerNames: string[];  // Snapshot for history
    configSnapshot: SacTeConfig;  // Can be edited during match
    rounds: SacTeRound[];  // Multiple rounds
    totalScores: { [playerId: string]: number };  // Cumulative

    // Pot tracking
    caHeoCurrentPot: number;  // Current accumulated pot value
    caHeoRoundsAccumulated: number;  // Rounds without winner

    status: 'active' | 'paused' | 'completed';
    createdAt: number;
    completedAt?: number;
}
