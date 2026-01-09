// Player model
export interface Player {
    id: string;
    name: string;
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
    chongHeoMultiplier: number;

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

    // Penalties (Thối)
    penalties: {
        playerId: string;
        type: PenaltyType;
        count: number;
    }[];

    // Chặt Heo (with chaining)
    chatHeoChains: ChatHeoChain[];

    // Đút 3 Tép
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
    status: 'active' | 'completed';
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
}

// Countdown timer state
export interface TimerState {
    duration: number; // in seconds
    remaining: number;
    isRunning: boolean;
    isEnabled: boolean;
}
