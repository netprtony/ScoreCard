import { ScoringConfig } from '../types/models';
import { executeQuery, executeUpdate } from './database';

export const getAllConfigs = (): ScoringConfig[] => {
    const rows = executeQuery<any>(
        'SELECT * FROM scoring_configs ORDER BY is_default DESC, created_at DESC'
    );

    return rows.map(row => ({
        id: row.id,
        name: row.name,
        baseRatioFirst: row.base_ratio_first,
        baseRatioSecond: row.base_ratio_second,
        toiTrangMultiplier: row.toi_trang_multiplier,
        killMultiplier: row.kill_multiplier,
        penaltyHeoDen: row.penalty_heo_den,
        penaltyHeoDo: row.penalty_heo_do,
        penaltyBaTep: row.penalty_ba_tep,
        penaltyBaDoiThong: row.penalty_ba_doi_thong,
        penaltyTuQuy: row.penalty_tu_quy,
        chatHeoBlack: row.chat_heo_black,
        chatHeoRed: row.chat_heo_red,
        chongHeoMultiplier: row.chong_heo_multiplier,
        dutBaTep: row.dut_ba_tep,
        enableToiTrang: row.enable_toi_trang === 1,
        enableKill: row.enable_kill === 1,
        enablePenalties: row.enable_penalties === 1,
        enableChatHeo: row.enable_chat_heo === 1,
        enableDutBaTep: row.enable_dut_ba_tep === 1,
        isDefault: row.is_default === 1,
        createdAt: row.created_at
    }));
};

export const getConfigById = (id: string): ScoringConfig | null => {
    const rows = executeQuery<any>(
        'SELECT * FROM scoring_configs WHERE id = ?',
        [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
        id: row.id,
        name: row.name,
        baseRatioFirst: row.base_ratio_first,
        baseRatioSecond: row.base_ratio_second,
        toiTrangMultiplier: row.toi_trang_multiplier,
        killMultiplier: row.kill_multiplier,
        penaltyHeoDen: row.penalty_heo_den,
        penaltyHeoDo: row.penalty_heo_do,
        penaltyBaTep: row.penalty_ba_tep,
        penaltyBaDoiThong: row.penalty_ba_doi_thong,
        penaltyTuQuy: row.penalty_tu_quy,
        chatHeoBlack: row.chat_heo_black,
        chatHeoRed: row.chat_heo_red,
        chongHeoMultiplier: row.chong_heo_multiplier,
        dutBaTep: row.dut_ba_tep,
        enableToiTrang: row.enable_toi_trang === 1,
        enableKill: row.enable_kill === 1,
        enablePenalties: row.enable_penalties === 1,
        enableChatHeo: row.enable_chat_heo === 1,
        enableDutBaTep: row.enable_dut_ba_tep === 1,
        isDefault: row.is_default === 1,
        createdAt: row.created_at
    };
};

export const getDefaultConfig = (): ScoringConfig | null => {
    const rows = executeQuery<any>(
        'SELECT * FROM scoring_configs WHERE is_default = 1 LIMIT 1'
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
        id: row.id,
        name: row.name,
        baseRatioFirst: row.base_ratio_first,
        baseRatioSecond: row.base_ratio_second,
        toiTrangMultiplier: row.toi_trang_multiplier,
        killMultiplier: row.kill_multiplier,
        penaltyHeoDen: row.penalty_heo_den,
        penaltyHeoDo: row.penalty_heo_do,
        penaltyBaTep: row.penalty_ba_tep,
        penaltyBaDoiThong: row.penalty_ba_doi_thong,
        penaltyTuQuy: row.penalty_tu_quy,
        chatHeoBlack: row.chat_heo_black,
        chatHeoRed: row.chat_heo_red,
        chongHeoMultiplier: row.chong_heo_multiplier,
        dutBaTep: row.dut_ba_tep,
        enableToiTrang: row.enable_toi_trang === 1,
        enableKill: row.enable_kill === 1,
        enablePenalties: row.enable_penalties === 1,
        enableChatHeo: row.enable_chat_heo === 1,
        enableDutBaTep: row.enable_dut_ba_tep === 1,
        isDefault: row.is_default === 1,
        createdAt: row.created_at
    };
};

export const createConfig = (config: Omit<ScoringConfig, 'id' | 'createdAt'>): ScoringConfig => {
    const newConfig: ScoringConfig = {
        ...config,
        id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now()
    };

    // If this is set as default, unset other defaults
    if (newConfig.isDefault) {
        executeUpdate('UPDATE scoring_configs SET is_default = 0');
    }

    executeUpdate(
        `INSERT INTO scoring_configs (
      id, name, base_ratio_first, base_ratio_second,
      toi_trang_multiplier, kill_multiplier,
      penalty_heo_den, penalty_heo_do, penalty_ba_tep,
      penalty_ba_doi_thong, penalty_tu_quy,
      chat_heo_black, chat_heo_red, chong_heo_multiplier,
      dut_ba_tep, enable_toi_trang, enable_kill,
      enable_penalties, enable_chat_heo, enable_dut_ba_tep,
      is_default, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            newConfig.id, newConfig.name, newConfig.baseRatioFirst, newConfig.baseRatioSecond,
            newConfig.toiTrangMultiplier, newConfig.killMultiplier,
            newConfig.penaltyHeoDen, newConfig.penaltyHeoDo, newConfig.penaltyBaTep,
            newConfig.penaltyBaDoiThong, newConfig.penaltyTuQuy,
            newConfig.chatHeoBlack, newConfig.chatHeoRed, newConfig.chongHeoMultiplier,
            newConfig.dutBaTep, newConfig.enableToiTrang ? 1 : 0, newConfig.enableKill ? 1 : 0,
            newConfig.enablePenalties ? 1 : 0, newConfig.enableChatHeo ? 1 : 0, newConfig.enableDutBaTep ? 1 : 0,
            newConfig.isDefault ? 1 : 0, newConfig.createdAt
        ]
    );

    return newConfig;
};

export const updateConfig = (config: ScoringConfig): void => {
    // If this is set as default, unset other defaults
    if (config.isDefault) {
        executeUpdate('UPDATE scoring_configs SET is_default = 0 WHERE id != ?', [config.id]);
    }

    executeUpdate(
        `UPDATE scoring_configs SET
      name = ?, base_ratio_first = ?, base_ratio_second = ?,
      toi_trang_multiplier = ?, kill_multiplier = ?,
      penalty_heo_den = ?, penalty_heo_do = ?, penalty_ba_tep = ?,
      penalty_ba_doi_thong = ?, penalty_tu_quy = ?,
      chat_heo_black = ?, chat_heo_red = ?, chong_heo_multiplier = ?,
      dut_ba_tep = ?, enable_toi_trang = ?, enable_kill = ?,
      enable_penalties = ?, enable_chat_heo = ?, enable_dut_ba_tep = ?,
      is_default = ?
    WHERE id = ?`,
        [
            config.name, config.baseRatioFirst, config.baseRatioSecond,
            config.toiTrangMultiplier, config.killMultiplier,
            config.penaltyHeoDen, config.penaltyHeoDo, config.penaltyBaTep,
            config.penaltyBaDoiThong, config.penaltyTuQuy,
            config.chatHeoBlack, config.chatHeoRed, config.chongHeoMultiplier,
            config.dutBaTep, config.enableToiTrang ? 1 : 0, config.enableKill ? 1 : 0,
            config.enablePenalties ? 1 : 0, config.enableChatHeo ? 1 : 0, config.enableDutBaTep ? 1 : 0,
            config.isDefault ? 1 : 0, config.id
        ]
    );
};

export const deleteConfig = (id: string): void => {
    executeUpdate('DELETE FROM scoring_configs WHERE id = ? AND is_default = 0', [id]);
};
