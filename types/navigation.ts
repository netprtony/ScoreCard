import { GameType, Match, Round } from './models';

// Define the parameter list for the Match Stack
export type MatchStackParamList = {
    ActiveMatch: undefined;
    GameSelection: undefined;
    PlayerSelection: { gameType: GameType };
    ConfigSetup: { gameType: GameType; playerIds: string[] };
    RoundInput: { matchId: string };
    RoundDetails: {
        match: Match;
        round: Round;
        onUpdateRound: (roundId: string, scores: { [playerId: string]: number }) => void;
        onDeleteRound: (roundId: string) => void;
    };
};

// Define the parameter list for the Root Tab Navigator
export type RootTabParamList = {
    Players: undefined;
    Matches: undefined;
    History: undefined;
    Statistics: undefined;
    Settings: undefined;
};
