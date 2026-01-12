import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Match, Round, ScoringConfig } from '../types/models';
import { 
    getActiveMatch, 
    updateMatchConfig, 
    updateMatchTotalScores, 
    completeMatch,
    pauseMatch as pauseMatchService,
    resumeMatch as resumeMatchService,
    getOngoingMatches
} from '../services/matchService';
import { createRound } from '../services/roundService';

interface MatchContextType {
    activeMatch: Match | null;
    ongoingMatches: Match[];
    refreshMatch: () => void;
    addRound: (round: Omit<Round, 'id' | 'createdAt' | 'matchId'>) => void;
    updateConfig: (config: ScoringConfig) => void;
    updateTotalScores: (scores: { [playerId: string]: number }) => void;
    pauseMatch: () => void;
    resumeMatch: (matchId: string) => void;
    endMatch: () => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeMatch, setActiveMatch] = useState<Match | null>(null);
    const [ongoingMatches, setOngoingMatches] = useState<Match[]>([]);

    const refreshMatch = useCallback(() => {
        try {
            const match = getActiveMatch();
            setActiveMatch(match);
            const ongoing = getOngoingMatches();
            setOngoingMatches(ongoing);
        } catch (error) {
            console.error('Error refreshing match:', error);
        }
    }, []);

    // Auto-refresh every 2 seconds
    useEffect(() => {
        refreshMatch();
        const interval = setInterval(refreshMatch, 2000);
        return () => clearInterval(interval);
    }, [refreshMatch]);

    const addRound = useCallback((roundData: Omit<Round, 'id' | 'createdAt' | 'matchId'>) => {
        if (!activeMatch) return;

        try {
            const newRound = createRound({
                ...roundData,
                matchId: activeMatch.id
            });

            // Update total scores
            const updatedTotalScores = { ...activeMatch.totalScores };
            Object.keys(newRound.roundScores).forEach(playerId => {
                updatedTotalScores[playerId] = (updatedTotalScores[playerId] || 0) + newRound.roundScores[playerId];
            });

            updateMatchTotalScores(activeMatch.id, updatedTotalScores);
            refreshMatch();
        } catch (error) {
            console.error('Error adding round:', error);
        }
    }, [activeMatch, refreshMatch]);

    const updateConfig = useCallback((config: ScoringConfig) => {
        if (!activeMatch) return;

        try {
            updateMatchConfig(activeMatch.id, config);
            refreshMatch();
        } catch (error) {
            console.error('Error updating config:', error);
        }
    }, [activeMatch, refreshMatch]);

    const updateTotalScores = useCallback((scores: { [playerId: string]: number }) => {
        if (!activeMatch) return;

        try {
            updateMatchTotalScores(activeMatch.id, scores);
            refreshMatch();
        } catch (error) {
            console.error('Error updating total scores:', error);
        }
    }, [activeMatch, refreshMatch]);

    const pauseMatch = useCallback(() => {
        if (!activeMatch) return;

        try {
            pauseMatchService(activeMatch.id);
            refreshMatch();
        } catch (error) {
            console.error('Error pausing match:', error);
        }
    }, [activeMatch, refreshMatch]);

    const resumeMatch = useCallback((matchId: string) => {
        try {
            resumeMatchService(matchId);
            refreshMatch();
        } catch (error) {
            console.error('Error resuming match:', error);
        }
    }, [refreshMatch]);

    const endMatch = useCallback(() => {
        if (!activeMatch) return;

        try {
            completeMatch(activeMatch.id);
            setActiveMatch(null);
            refreshMatch();
        } catch (error) {
            console.error('Error ending match:', error);
        }
    }, [activeMatch, refreshMatch]);

    return (
        <MatchContext.Provider
            value={{
                activeMatch,
                ongoingMatches,
                refreshMatch,
                addRound,
                updateConfig,
                updateTotalScores,
                pauseMatch,
                resumeMatch,
                endMatch
            }}
        >
            {children}
        </MatchContext.Provider>
    );
};

export const useMatch = (): MatchContextType => {
    const context = useContext(MatchContext);
    if (!context) {
        throw new Error('useMatch must be used within MatchProvider');
    }
    return context;
};
