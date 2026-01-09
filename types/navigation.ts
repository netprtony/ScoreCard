import { GameType } from './models';

// Define the parameter list for the Match Stack
export type MatchStackParamList = {
    ActiveMatch: undefined;
    GameSelection: undefined;
    PlayerSelection: { gameType: GameType };
    ConfigSetup: { gameType: GameType; playerIds: string[] };
    RoundInput: { matchId: string };
};

// Define the parameter list for the Root Tab Navigator
export type RootTabParamList = {
    Players: undefined;
    Matches: undefined;
    History: undefined;
    Statistics: undefined;
    Settings: undefined;
};
