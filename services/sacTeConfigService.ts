import { SacTeConfig } from '../types/models';
import { executeQuery, executeUpdate } from './database';

export const getDefaultSacTeConfig = (): SacTeConfig => {
    const rows = executeQuery<any>(
        'SELECT * FROM sac_te_configs WHERE is_default = 1 LIMIT 1'
    );

    if (rows.length > 0) {
        return mapRowToConfig(rows[0]);
    }

    // Return hardcoded default if not in database
    return {
        id: 'default_sac_te',
        name: 'Cấu hình mặc định',
        caNuoc: {
            enabled: true,
            heSo: 5,
        },
        caHeo: {
            enabled: true,
            heSo: 5,
        },
        heSoGuc: 10,
        heSoTon: 5,
        whiteWinMultiplier: 2,
        minPlayers: 2,
        maxPlayers: 5,
        isDefault: true,
        createdAt: Date.now(),
    };
};

export const getAllSacTeConfigs = (): SacTeConfig[] => {
    const rows = executeQuery<any>('SELECT * FROM sac_te_configs ORDER BY created_at DESC');
    return rows.map(mapRowToConfig);
};

export const getSacTeConfigById = (id: string): SacTeConfig | null => {
    const rows = executeQuery<any>('SELECT * FROM sac_te_configs WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return mapRowToConfig(rows[0]);
};

export const saveSacTeConfig = (config: SacTeConfig): void => {
    executeUpdate(
        `INSERT OR REPLACE INTO sac_te_configs (
            id, name, ca_nuoc_enabled, ca_nuoc_he_so,
            ca_heo_enabled, ca_heo_he_so,
            he_so_guc, he_so_ton, white_win_multiplier,
            min_players, max_players,
            is_default, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            config.id,
            config.name,
            config.caNuoc.enabled ? 1 : 0,
            config.caNuoc.heSo,
            config.caHeo.enabled ? 1 : 0,
            config.caHeo.heSo,
            config.heSoGuc,
            config.heSoTon,
            config.whiteWinMultiplier,
            config.minPlayers,
            config.maxPlayers,
            config.isDefault ? 1 : 0,
            config.createdAt,
        ]
    );
};

export const deleteSacTeConfig = (id: string): void => {
    executeUpdate('DELETE FROM sac_te_configs WHERE id = ? AND is_default = 0', [id]);
};

const mapRowToConfig = (row: any): SacTeConfig => {
    return {
        id: row.id,
        name: row.name,
        caNuoc: {
            enabled: row.ca_nuoc_enabled === 1,
            heSo: row.ca_nuoc_he_so ?? 0,
        },
        caHeo: {
            enabled: row.ca_heo_enabled === 1,
            heSo: row.ca_heo_he_so ?? 0,
        },
        heSoGuc: row.he_so_guc ?? 0,
        heSoTon: row.he_so_ton ?? 0,
        whiteWinMultiplier: row.white_win_multiplier ?? 0,
        minPlayers: row.min_players ?? 2,
        maxPlayers: row.max_players ?? 5,
        isDefault: row.is_default === 1,
        createdAt: row.created_at,
    };
};
