import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('tienlen.db');

export const initDatabase = (): void => {
    try {
        // Players table
        db.execSync(
            `CREATE TABLE IF NOT EXISTS players (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );`
        );

        // Game types table (NEW)
        db.execSync(
            `CREATE TABLE IF NOT EXISTS game_types (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                icon TEXT,
                is_active INTEGER NOT NULL,
                description TEXT
            );`
        );

        // Scoring configs table
        db.execSync(
            `CREATE TABLE IF NOT EXISTS scoring_configs (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                base_ratio_first INTEGER NOT NULL,
                base_ratio_second INTEGER NOT NULL,
                toi_trang_multiplier INTEGER NOT NULL,
                kill_multiplier INTEGER NOT NULL,
                penalty_heo_den INTEGER NOT NULL,
                penalty_heo_do INTEGER NOT NULL,
                penalty_ba_tep INTEGER NOT NULL,
                penalty_ba_doi_thong INTEGER NOT NULL,
                penalty_tu_quy INTEGER NOT NULL,
                chat_heo_black INTEGER NOT NULL,
                chat_heo_red INTEGER NOT NULL,
                chong_heo_multiplier INTEGER NOT NULL,
                dut_ba_tep INTEGER NOT NULL,
                enable_toi_trang INTEGER NOT NULL,
                enable_kill INTEGER NOT NULL,
                enable_penalties INTEGER NOT NULL,
                enable_chat_heo INTEGER NOT NULL,
                enable_dut_ba_tep INTEGER NOT NULL,
                is_default INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            );`
        );

        // Matches table (UPDATED for multi-round)
        db.execSync(
            `CREATE TABLE IF NOT EXISTS matches (
                id TEXT PRIMARY KEY,
                game_type TEXT NOT NULL,
                player_ids TEXT NOT NULL,
                player_names TEXT NOT NULL,
                config_snapshot TEXT NOT NULL,
                total_scores TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                completed_at INTEGER,
                FOREIGN KEY (game_type) REFERENCES game_types(id)
            );`
        );

        // Rounds table (NEW)
        db.execSync(
            `CREATE TABLE IF NOT EXISTS rounds (
                id TEXT PRIMARY KEY,
                match_id TEXT NOT NULL,
                round_number INTEGER NOT NULL,
                rankings TEXT NOT NULL,
                toi_trang_winner TEXT,
                actions TEXT,
                penalties TEXT,
                chat_heo_chains TEXT,
                dut_ba_tep_players TEXT,
                round_scores TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
            );`
        );

        // Player Actions table (NEW - for tracking all actions)
        db.execSync(
            `CREATE TABLE IF NOT EXISTS player_actions (
                id TEXT PRIMARY KEY,
                round_id TEXT NOT NULL,
                action_type TEXT NOT NULL,
                actor_id TEXT NOT NULL,
                target_id TEXT,
                heo_type TEXT,
                heo_count INTEGER,
                chong_types TEXT,
                chong_counts TEXT,
                killed_penalties TEXT,
                dut_ba_tep_count INTEGER,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
            );`
        );

        // Legacy match_results table (kept for backward compatibility)
        db.execSync(
            `CREATE TABLE IF NOT EXISTS match_results (
                id TEXT PRIMARY KEY,
                match_id TEXT NOT NULL,
                player_id TEXT NOT NULL,
                player_name TEXT NOT NULL,
                rank INTEGER NOT NULL,
                is_toi_trang INTEGER NOT NULL,
                is_killed INTEGER NOT NULL,
                killed_by TEXT,
                penalties TEXT,
                chat_heo TEXT,
                dut_ba_tep INTEGER NOT NULL,
                score_change INTEGER NOT NULL,
                FOREIGN KEY (match_id) REFERENCES matches(id)
            );`
        );

        // App settings table
        db.execSync(
            `CREATE TABLE IF NOT EXISTS app_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                theme TEXT NOT NULL,
                language TEXT NOT NULL,
                keep_screen_awake INTEGER NOT NULL,
                background_image TEXT,
                has_completed_onboarding INTEGER NOT NULL DEFAULT 0,
                has_accepted_terms INTEGER NOT NULL DEFAULT 0
            );`
        );

        // Migration: Add onboarding columns to app_settings if they don't exist (for existing databases)
        try {
            const columns = db.getAllSync('PRAGMA table_info(app_settings)') as any[];
            const columnNames = columns.map((col: any) => col.name);

            if (!columnNames.includes('has_completed_onboarding')) {
                db.execSync('ALTER TABLE app_settings ADD COLUMN has_completed_onboarding INTEGER NOT NULL DEFAULT 0');
                console.log('Added has_completed_onboarding column');
            }

            if (!columnNames.includes('has_accepted_terms')) {
                db.execSync('ALTER TABLE app_settings ADD COLUMN has_accepted_terms INTEGER NOT NULL DEFAULT 0');
                console.log('Added has_accepted_terms column');
            }
        } catch (error) {
            console.log('Onboarding columns migration:', error);
        }

        // Insert default settings if not exists
        db.runSync(
            `INSERT OR IGNORE INTO app_settings (id, theme, language, keep_screen_awake, has_completed_onboarding, has_accepted_terms)
            VALUES (1, 'system', 'vi', 0, 0, 0);`
        );

        // Insert default game types
        db.runSync(
            `INSERT OR IGNORE INTO game_types (id, name, icon, is_active, description)
            VALUES (?, ?, ?, ?, ?);`,
            ['tien_len', 'Tiến Lên', '🎴', 1, 'Trò chơi bài Tiến Lên truyền thống']
        );

        db.runSync(
            `INSERT OR IGNORE INTO game_types (id, name, icon, is_active, description)
            VALUES (?, ?, ?, ?, ?);`,
            ['poker', 'Poker', '🃏', 0, 'Trò chơi bài Poker truyền thống']
        );

        db.runSync(
            `INSERT OR IGNORE INTO game_types (id, name, icon, is_active, description)
            VALUES (?, ?, ?, ?, ?);`,
            ['sac_te', 'Sắc Tê', '🎲', 0, 'Trò chơi bài Sắc Tê truyền thống']
        );

        // Insert default scoring config if not exists
        db.runSync(
            `INSERT OR IGNORE INTO scoring_configs (
                id, name, base_ratio_first, base_ratio_second,
                toi_trang_multiplier, kill_multiplier,
                penalty_heo_den, penalty_heo_do, penalty_ba_tep,
                penalty_ba_doi_thong, penalty_tu_quy,
                chat_heo_black, chat_heo_red, chong_heo_multiplier,
                dut_ba_tep, enable_toi_trang, enable_kill,
                enable_penalties, enable_chat_heo, enable_dut_ba_tep,
                is_default, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                'default', 'Cấu hình mặc định', 10, 5,
                2, 2,
                5, 10, 5,
                10, 10,
                5, 10, 2,
                5, 1, 1,
                1, 1, 1,
                1, Date.now()
            ]
        );

        // Migration: Add missing columns to matches table if they don't exist
        try {
            // Check if matches table exists and what columns it has
            const matchesTableInfo = db.getAllSync<{ name: string }>('PRAGMA table_info(matches)');
            const matchesColumnNames = matchesTableInfo.map(col => col.name);

            console.log('Current matches table columns:', matchesColumnNames);

            // Add game_type column if missing
            if (!matchesColumnNames.includes('game_type')) {
                console.log('Migrating matches table: adding game_type column');
                db.execSync('ALTER TABLE matches ADD COLUMN game_type TEXT NOT NULL DEFAULT "tien_len"');
            }

            // Add player_ids column if missing
            if (!matchesColumnNames.includes('player_ids')) {
                console.log('Migrating matches table: adding player_ids column');
                db.execSync('ALTER TABLE matches ADD COLUMN player_ids TEXT NOT NULL DEFAULT "[]"');
            }

            // Add player_names column if missing
            if (!matchesColumnNames.includes('player_names')) {
                console.log('Migrating matches table: adding player_names column');
                db.execSync('ALTER TABLE matches ADD COLUMN player_names TEXT NOT NULL DEFAULT "[]"');
            }

            // Add total_scores column if missing
            if (!matchesColumnNames.includes('total_scores')) {
                console.log('Migrating matches table: adding total_scores column');
                db.execSync('ALTER TABLE matches ADD COLUMN total_scores TEXT NOT NULL DEFAULT "{}"');
            }

            // Add status column if missing
            if (!matchesColumnNames.includes('status')) {
                console.log('Migrating matches table: adding status column');
                db.execSync('ALTER TABLE matches ADD COLUMN status TEXT NOT NULL DEFAULT "completed"');
            }

            // Add completed_at column if missing
            if (!matchesColumnNames.includes('completed_at')) {
                console.log('Migrating matches table: adding completed_at column');
                db.execSync('ALTER TABLE matches ADD COLUMN completed_at INTEGER');
            }

            console.log('Matches table migration completed successfully');
        } catch (migrationError) {
            console.error('Matches table migration error:', migrationError);
            // Don't throw - allow app to continue if migration fails
        }

        // Migration: Add missing columns to rounds table if they don't exist
        try {
            // Check if rounds table exists and what columns it has
            const roundsTableInfo = db.getAllSync<{ name: string }>('PRAGMA table_info(rounds)');
            const roundsColumnNames = roundsTableInfo.map(col => col.name);

            console.log('Current rounds table columns:', roundsColumnNames);

            // Add actions column if missing
            if (!roundsColumnNames.includes('actions')) {
                console.log('Migrating rounds table: adding actions column');
                db.execSync('ALTER TABLE rounds ADD COLUMN actions TEXT DEFAULT "[]"');
            }

            console.log('Rounds table migration completed successfully');
        } catch (migrationError) {
            console.error('Rounds table migration error:', migrationError);
            // Don't throw - allow app to continue if migration fails
        }

        // Migration: Add color column to players table if it doesn't exist
        try {
            const playersTableInfo = db.getAllSync<{ name: string }>('PRAGMA table_info(players)');
            const playersColumnNames = playersTableInfo.map(col => col.name);

            console.log('Current players table columns:', playersColumnNames);

            // Add color column if missing
            if (!playersColumnNames.includes('color')) {
                console.log('Migrating players table: adding color column');
                db.execSync('ALTER TABLE players ADD COLUMN color TEXT');
            }

            // Add avatar column if missing
            if (!playersColumnNames.includes('avatar')) {
                console.log('Migrating players table: adding avatar column');
                db.execSync('ALTER TABLE players ADD COLUMN avatar TEXT');
            }

            console.log('Players table migration completed successfully');
        } catch (migrationError) {
            console.error('Players table migration error:', migrationError);
            // Don't throw - allow app to continue if migration fails
        }
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
};

export const executeQuery = <T>(
    query: string,
    params: any[] = []
): T[] => {
    try {
        return db.getAllSync<T>(query, params);
    } catch (error) {
        console.error('Query execution error:', error);
        throw error;
    }
};

export const executeUpdate = (
    query: string,
    params: any[] = []
): void => {
    try {
        db.runSync(query, params);
    } catch (error) {
        console.error('Update execution error:', error);
        throw error;
    }
};

export const getDatabase = async () => {
    return db;
};

// Clear all data and reset database (for testing fresh install)
export const clearDatabase = (): void => {
    try {
        console.log('Clearing database...');

        // Drop all tables
        db.execSync('DROP TABLE IF EXISTS players');
        db.execSync('DROP TABLE IF EXISTS matches');
        db.execSync('DROP TABLE IF EXISTS rounds');
        db.execSync('DROP TABLE IF EXISTS player_actions');
        db.execSync('DROP TABLE IF EXISTS game_types');
        db.execSync('DROP TABLE IF EXISTS scoring_configs');
        db.execSync('DROP TABLE IF EXISTS app_settings');

        console.log('All tables dropped');

        // Reinitialize database
        initDatabase();

        console.log('Database reinitialized - ready for fresh start!');
    } catch (error) {
        console.error('Error clearing database:', error);
        throw error;
    }
};

export default db;
