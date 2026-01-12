import { I18n } from 'i18n-js';

const translations = {
    vi: {
        // Common
        type: 'Loại',
        calculateAndSave: 'Tính điểm và lưu',
        // Navigation
        players: 'Người chơi',
        matches: 'Trận đấu',
        history: 'Lịch sử',
        statistics: 'Thống kê',
        settings: 'Cài đặt',

        // Player Management
        playerList: 'Danh sách người chơi',
        addPlayer: 'Thêm người chơi',
        editPlayer: 'Sửa người chơi',
        deletePlayer: 'Xóa người chơi',
        playerName: 'Tên người chơi',
        playerCount: 'Số người chơi',
        minPlayers: 'Tối thiểu 2 người chơi',
        maxPlayers: 'Tối đa 10 người chơi',

        // Match Management
        newMatch: 'Trận đấu mới',
        activeMatch: 'Trận đấu đang diễn ra',
        selectPlayers: 'Chọn người chơi',
        selectConfig: 'Chọn cấu hình',
        startMatch: 'Bắt đầu',
        endMatch: 'Kết thúc trận',
        restartMatch: 'Chơi lại',
        matchResults: 'Kết quả trận đấu',
        enterResults: 'Nhập kết quả',
        rank: 'Hạng',
        scoreChange: 'Thay đổi điểm',

        // Scoring Rules
        toiTrang: 'Tới trắng',
        killed: 'Người bị giết',
        killedBy: 'Giết bởi',
        kill: 'Giết',
        penalty: 'Phạt ai đó',
        heoDen: 'Heo đen',
        heoDo: 'Heo đỏ',
        heo: 'Heo',
        baTep: '3 tép',
        baDoiThong: '3 đôi thông',
        tuQuy: 'Tứ quý',
        // Snake case versions (matching PenaltyType)
        heo_den: 'Heo đen',
        heo_do: 'Heo đỏ',
        ba_tep: '3 tép',
        ba_doi_thong: '3 đôi thông',
        tu_quy: 'Tứ quý',
        chatHeo: 'Chặt heo',
        dutBaTep: 'Đút 3 tép',
        chongHeo: 'Chồng heo',

        // Configuration
        configuration: 'Cấu hình',
        configName: 'Tên cấu hình',
        baseRatio: 'Hệ số cơ bản',
        ratio1: 'Hệ tới nhất',
        ratio2: 'Hệ tới hai',
        multipliers: 'Hệ số nhân',
        toiTrangMultiplier: 'Hệ tới trắng',
        killMultiplier: 'Hệ số giết',
        penaltyValues: 'Giá trị phạt',
        enableRules: 'Bật/Tắt luật',
        defaultConfig: 'Cấu hình mặc định',
        createConfig: 'Tạo cấu hình',
        editConfig: 'Sửa cấu hình',
        deleteConfig: 'Xóa cấu hình',

        // Statistics
        totalMatches: 'Tổng số trận',
        totalScore: 'Tổng điểm',
        winCount: 'Số lần thắng',
        killCount: 'Số lần giết',
        roundTotal: 'Tổng điểm vòng',

        // Settings
        theme: 'Giao diện',
        light: 'Sáng',
        dark: 'Tối',
        system: 'Hệ thống',
        language: 'Ngôn ngữ',
        vietnamese: 'Tiếng Việt',
        english: 'English',
        keepScreenOn: 'Giữ màn hình sáng',
        backgroundImage: 'Hình nền',
        selectBackground: 'Chọn hình nền',
        about: 'Giới thiệu',
        contact: 'Liên hệ',
        privacyPolicy: 'Chính sách quyền riêng tư',
        termsOfUse: 'Điều khoản sử dụng',
        // Timer
        timer: 'Đồng hồ',
        countdown: 'Đếm ngược',
        duration: 'Thời gian',
        start: 'Bắt đầu',
        pause: 'Tạm dừng',
        resume: 'Tiếp tục',
        reset: 'Đặt lại',
        timeUp: 'Hết giờ!',

        // Common
        save: 'Lưu',
        cancel: 'Hủy',
        delete: 'Xóa',
        edit: 'Sửa',
        confirm: 'Xác nhận',
        back: 'Quay lại',
        next: 'Tiếp theo',
        done: 'Hoàn thành',
        close: 'Đóng',
        yes: 'Có',
        no: 'Không',

        // Errors
        errorRatio: 'Hệ số 1 phải lớn hơn hệ số 2',
        errorHeoDo: 'Phạt heo đỏ phải lớn hơn phạt heo đen',
        errorPlayerCount: 'Cần chọn đúng 4 người chơi',
        errorPlayerName: 'Vui lòng nhập tên người chơi',
        errorRequired: 'Trường này là bắt buộc',

        // Confirmation
        confirmDelete: 'Bạn có chắc muốn xóa?',
        confirmRestart: 'Bạn có muốn chơi lại với cùng người chơi?',
        confirmEnd: 'Bạn có muốn kết thúc trận đấu?',

        // About
        appName: 'Tiến Lên Score',
        appDescription: 'Ứng dụng tính điểm cho các loại bài phổ biến',
        version: 'Phiên bản',
        developer: 'Phát triển bởi',

        // Privacy
        privacyTitle: 'Chính sách quyền riêng tư',
        privacyContent: 'Ứng dụng này lưu trữ tất cả dữ liệu cục bộ trên thiết bị của bạn. Không có dữ liệu nào được gửi đến máy chủ bên ngoài.',

        // RoundInputScreen
        roundInput: 'Nhập Ván',
        noMatch: 'Không có trận đấu nào',
        selectPenaltyType: 'Chọn Loại Phạt',
        chatHeoOption: 'Chặt Heo',
        chongOption: 'Chồng/Thúi',
        threeTepOption: '3 Tép',
        selectHeoType: 'Loại heo:',
        blackHeo: 'Đen',
        redHeo: 'Đỏ',
        heoCount: 'Số con:',
        selectTarget: 'Người bị phạt:',
        selectChongType: 'Loại chồng:',
        victimPlayer: 'Người bị giết:',
        additionalPenalties: 'Phạt thêm (nếu có):',
        rankAlreadySelected: 'Hạng đã được chọn',
        onlyRank1CanToiTrang: 'Chỉ người về nhất mới có thể Tới Trắng',
        selectVictim: 'Vui lòng chọn người bị phạt',
        selectChongAndTarget: 'Vui lòng chọn loại chồng và người bị phạt',
        selectKillVictim: 'Vui lòng chọn người bị giết',
        addedPenalty: 'Đã thêm phạt',
        success: 'Thành công',
        error: 'Lỗi',
        warning: 'Cảnh báo',
        selectRankForAll: 'Vui lòng chọn hạng cho tất cả người chơi',
        toiTrangMustBeRank1: 'Người Tới Trắng phải về nhất',
        scoreSumNotZero: 'Tổng điểm không bằng 0',
        stillWantToSave: 'Vẫn muốn lưu?',
        roundSaved: 'Đã lưu ván',
        tapToViewDetails: 'Nhấn để xem chi tiết',
    },
    en: {
        // Common
        type: 'Type',
        calculateAndSave: 'Calculate and Save',
        // Navigation
        players: 'Players',
        matches: 'Matches',
        history: 'History',
        statistics: 'Statistics',
        settings: 'Settings',

        // Player Management
        playerList: 'Player List',
        addPlayer: 'Add Player',
        editPlayer: 'Edit Player',
        deletePlayer: 'Delete Player',
        playerName: 'Player Name',
        playerCount: 'Player Count',
        minPlayers: 'Minimum 2 players',
        maxPlayers: 'Maximum 10 players',

        // Match Management
        newMatch: 'New Match',
        activeMatch: 'Active Match',
        selectPlayers: 'Select Players',
        selectConfig: 'Select Configuration',
        startMatch: 'Start',
        endMatch: 'End Match',
        restartMatch: 'Restart',
        matchResults: 'Match Results',
        enterResults: 'Enter Results',
        rank: 'Rank',
        scoreChange: 'Score Change',

        // Scoring Rules
        toiTrang: 'Instant Win',
        killed: 'Killed',
        killedBy: 'Killed by',
        kill: 'Kill',
        penalty: 'Penalty someone',
        heoDen: 'Black Pig',
        heoDo: 'Red Pig',
        baTep: 'Three of Clubs',
        baDoiThong: 'Three of Pair',
        tuQuy: 'Four of a Kind',
        // Snake case versions (matching PenaltyType)
        heo_den: 'Black Pig',
        heo_do: 'Red Pig',
        heo: 'Pig',
        ba_tep: 'Three of Clubs',
        ba_doi_thong: 'Three of Pair',
        tu_quy: 'Four of a Kind',
        chatHeo: 'Kill Pig',
        dutBaTep: 'Kill Three of Clubs',
        chongHeo: 'Stack',

        // Configuration
        configuration: 'Configuration',
        configName: 'Config Name',
        baseRatio: 'Base Ratio',
        ratio1: 'Ratio 1',
        ratio2: 'Ratio 2',
        multipliers: 'Multipliers',
        toiTrangMultiplier: 'Instant Win Multiplier',
        killMultiplier: 'Kill Multiplier',
        penaltyValues: 'Penalty Values',
        enableRules: 'Enable/Disable Rules',
        defaultConfig: 'Default Configuration',
        createConfig: 'Create Configuration',
        editConfig: 'Edit Configuration',
        deleteConfig: 'Delete Configuration',

        // Statistics
        totalMatches: 'Total Matches',
        totalScore: 'Total Score',
        winCount: 'Win Count',
        killCount: 'Kill Count',
        roundTotal: 'Round Total',

        // Settings
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        language: 'Language',
        vietnamese: 'Tiếng Việt',
        english: 'English',
        keepScreenOn: 'Keep Screen On',
        backgroundImage: 'Background Image',
        selectBackground: 'Select Background',
        about: 'About',
        contact: 'Contact',
        privacyPolicy: 'Privacy Policy',
        termsOfUse: 'Terms of Use',
        // Timer
        timer: 'Timer',
        countdown: 'Countdown',
        duration: 'Duration',
        start: 'Start',
        pause: 'Pause',
        resume: 'Resume',
        reset: 'Reset',
        timeUp: 'Time\'s up!',

        // Common
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        done: 'Done',
        close: 'Close',
        yes: 'Yes',
        no: 'No',

        // Errors
        errorRatio: 'Ratio 1 must be greater than Ratio 2',
        errorHeoDo: 'Red pig penalty must be greater than black pig',
        errorPlayerCount: 'Must select exactly 4 players',
        errorPlayerName: 'Please enter player name',
        errorRequired: 'This field is required',

        // Confirmation
        confirmDelete: 'Are you sure you want to delete?',
        confirmRestart: 'Do you want to restart with the same players?',
        confirmEnd: 'Do you want to end the match?',

        // About
        appName: 'Tiến Lên Score',
        appDescription: 'Score tracking app design by AnhKhangSayHi',
        version: 'Version',
        developer: 'Developed by',

        // Privacy
        privacyTitle: 'Privacy Policy',
        privacyContent: 'This app stores all data locally on your device. No data is sent to external servers.',

        // RoundInputScreen
        roundInput: 'Round Input',
        noMatch: 'No active match',
        selectPenaltyType: 'Select Penalty Type',
        chatHeoOption: 'Kill Pig',
        chongOption: 'Stack/Penalty',
        threeTepOption: 'Three Clubs',
        selectHeoType: 'Pig type:',
        blackHeo: 'Black',
        redHeo: 'Red',
        heoCount: 'Count:',
        selectTarget: 'Target player:',
        selectChongType: 'Stack type:',
        victimPlayer: 'Victim:',
        additionalPenalties: 'Additional penalties:',
        rankAlreadySelected: 'Rank already selected',
        onlyRank1CanToiTrang: 'Only rank 1 can Instant Win',
        selectVictim: 'Please select target player',
        selectChongAndTarget: 'Please select stack type and target',
        selectKillVictim: 'Please select victim',
        addedPenalty: 'Penalty added',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        selectRankForAll: 'Please select rank for all players',
        toiTrangMustBeRank1: 'Instant Win player must be rank 1',
        scoreSumNotZero: 'Score sum is not zero',
        stillWantToSave: 'Still want to save?',
        roundSaved: 'Round saved',
        tapToViewDetails: 'Tap to view details',
    }
};

const i18n = new I18n(translations);
i18n.defaultLocale = 'vi';
i18n.locale = 'vi';
i18n.enableFallback = true;

// Language switching functions
export const setLocale = (locale: 'vi' | 'en') => {
    i18n.locale = locale;
};

export const getLocale = (): string => {
    return i18n.locale;
};

export const toggleLocale = () => {
    i18n.locale = i18n.locale === 'vi' ? 'en' : 'vi';
    return i18n.locale;
};

export default i18n;
