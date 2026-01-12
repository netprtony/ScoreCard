import { PlayerStats } from '../types/models';
import { executeQuery } from './database';

export const getAllPlayerStats = (): PlayerStats[] => {
    const rows = executeQuery<any>(
        `SELECT 
      p.id as player_id,
      p.name as player_name,
      p.color as player_color,
      p.avatar as player_avatar,
      COUNT(DISTINCT mr.match_id) as total_matches,
      COALESCE(SUM(mr.score_change), 0) as total_score,
      COALESCE(SUM(CASE WHEN mr.rank = 1 THEN 1 ELSE 0 END), 0) as win_count,
      COALESCE(SUM(CASE WHEN mr.killed_by IS NOT NULL AND mr.is_killed = 1 THEN 1 ELSE 0 END), 0) as kill_count
    FROM players p
    LEFT JOIN match_results mr ON p.id = mr.player_id
    GROUP BY p.id, p.name, p.color, p.avatar
    ORDER BY total_score DESC`
    );

    return rows.map(row => ({
        playerId: row.player_id,
        playerName: row.player_name,
        playerColor: row.player_color,
        playerAvatar: row.player_avatar,
        totalMatches: row.total_matches,
        totalScore: row.total_score,
        winCount: row.win_count,
        killCount: row.kill_count
    }));
};

export const getPlayerStats = (playerId: string): PlayerStats | null => {
    const rows = executeQuery<any>(
        `SELECT 
      p.id as player_id,
      p.name as player_name,
      p.color as player_color,
      p.avatar as player_avatar,
      COUNT(DISTINCT mr.match_id) as total_matches,
      COALESCE(SUM(mr.score_change), 0) as total_score,
      COALESCE(SUM(CASE WHEN mr.rank = 1 THEN 1 ELSE 0 END), 0) as win_count,
      COALESCE(SUM(CASE WHEN mr.killed_by IS NOT NULL AND mr.is_killed = 1 THEN 1 ELSE 0 END), 0) as kill_count
    FROM players p
    LEFT JOIN match_results mr ON p.id = mr.player_id
    WHERE p.id = ?
    GROUP BY p.id, p.name, p.color, p.avatar`,
        [playerId]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
        playerId: row.player_id,
        playerName: row.player_name,
        playerColor: row.player_color,
        playerAvatar: row.player_avatar,
        totalMatches: row.total_matches,
        totalScore: row.total_score,
        winCount: row.win_count,
        killCount: row.kill_count
    };
};

// Get kill count for a specific player (how many times they killed others)
export const getKillCountByPlayer = (playerId: string): number => {
    const rows = executeQuery<any>(
        `SELECT COUNT(*) as kill_count
     FROM match_results
     WHERE killed_by = ?`,
        [playerId]
    );

    return rows[0]?.kill_count || 0;
};
