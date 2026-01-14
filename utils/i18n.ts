import { I18n } from 'i18n-js';

const translations = {
    vi: {
        continue_match: 'Tiếp tục trận',
        custom_system_penalty_rules: 'Tùy chỉnh hệ số và luật phạt',
        rule_config: 'Cấu Hình Luật Chơi',
        edit_config: 'Sửa Cấu Hình',
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

        // Game Selection
        selectGame: 'Chọn Trò Chơi',
        selectGameType: 'Chọn loại game bạn muốn chơi',
        comingSoon: 'Sắp ra mắt',

        // Player Selection
        selectPlayersForMatch: 'Chọn người chơi cho trận đấu',
        selectedPlayers: 'Đã chọn',
        noPlayersAvailable: 'Chưa có người chơi nào',
        addPlayersFirst: 'Thêm người chơi trong tab Người chơi trước',

        // Active Match
        addRound: 'Thêm ván',
        viewDetails: 'Xem chi tiết',
        noRoundsYet: 'Chưa có ván nào',
        startFirstRound: 'Nhấn + để bắt đầu ván đầu tiên',

        // Match History
        noMatchHistory: 'Chưa có lịch sử trận đấu',
        playMatchesToSeeHistory: 'Chơi một vài trận để xem lịch sử',
        rounds: 'ván',

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
        toiTrangMultiplier: 'Hệ số tới trắng',
        killMultiplier: 'Hệ số giết',
        penaltyValues: 'Giá trị phạt',
        enableRules: 'Bật/Tắt luật',
        defaultConfig: 'Cấu hình mặc định',
        createConfig: 'Tạo cấu hình',
        editConfig: 'Sửa cấu hình',
        deleteConfig: 'Xóa cấu hình',
        penalties: 'Phạt Thối/Chồng',

        // Statistics
        totalMatches: 'Tổng số trận',
        totalScore: 'Tổng điểm',
        winCount: 'Số lần thắng',
        killCount: 'Số lần giết',
        roundTotal: 'Tổng điểm vòng',
        sortByScore: 'Điểm cao nhất',
        sortByWins: 'Nhiều thắng nhất',
        sortByMatches: 'Nhiều trận nhất',
        winRate: 'thắng',
        noStatsYet: 'Chưa có dữ liệu thống kê',
        playToSeeStats: 'Chơi một vài trận để xem thống kê',

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

        // SplashScreen
        splashTagline: 'Tính điểm nhanh – Công bằng – Offline',

        // WelcomeScreen
        welcomeTitle: 'Chào mừng đến với\nKoya Score',
        quickScoring: 'Tính điểm nhanh',
        lightAds: 'Có quảng cáo nhẹ',
        noDataCollection: 'Không thu thập dữ liệu',
        yourPrivacy: 'Quyền riêng tư của bạn',
        privacyRespect: 'Chúng tôi tôn trọng quyền riêng tư của bạn.',
        localDataOnly: 'App chỉ lưu dữ liệu trên thiết bị của bạn. Không có thông tin nào được gửi đến máy chủ bên ngoài.',
        localStorageInfo: 'Tất cả dữ liệu điểm số và lịch sử đều được lưu trữ cục bộ trên thiết bị của bạn',
        wifiAdInfo: 'Hãy bật wifi để có thể giảm bớt quảng cáo',
        continue: 'Tiếp tục',
        getStarted: 'Bắt đầu',

        // TermsPrivacyScreen
        termsAndPrivacy: 'Điều khoản & Quyền riêng tư',
        termsOfService: 'Điều khoản dịch vụ',
        viewTerms: 'Xem điều khoản',
        viewPrivacy: 'Xem chính sách',
        acceptTerms: 'Tôi đồng ý với điều khoản sử dụng và chính sách quyền riêng tư',
        mustAcceptTerms: 'Bạn phải đồng ý với điều khoản để tiếp tục',
        termsContent1: 'Bằng cách sử dụng ứng dụng này, bạn đồng ý với các điều khoản sau:',
        termsPoint1: 'Ứng dụng được cung cấp "như hiện tại" mà không có bất kỳ bảo đảm nào',
        termsPoint2: 'Bạn chịu trách nhiệm về việc sử dụng ứng dụng',
        termsPoint3: 'Chúng tôi có quyền cập nhật ứng dụng bất cứ lúc nào',
        termsPoint4: 'Bạn không được sử dụng ứng dụng cho mục đích bất hợp pháp',
        privacyContent1: 'Chúng tôi cam kết bảo vệ quyền riêng tư của bạn:',
        privacyPoint1: 'Tất cả dữ liệu được lưu trữ cục bộ trên thiết bị',
        privacyPoint2: 'Không thu thập thông tin cá nhân',
        privacyPoint3: 'Không chia sẻ dữ liệu với bên thứ ba',
        privacyPoint4: 'Bạn có toàn quyền kiểm soát dữ liệu của mình',

        // RoundDetailsScreen
        roundDetails: 'Chi tiết ván',
        round: 'Ván',
        totalScoreChange: 'Tổng thay đổi điểm',
        actions: 'Hành động',
        noActions: 'Không có hành động nào',
        scoreBreakdown: 'Chi tiết điểm',
        editRound: 'Sửa ván',
        deleteRound: 'Xóa ván',
        confirmDeleteRound: 'Bạn có chắc muốn xóa ván này?',
        roundDeleted: 'Đã xóa ván',
        roundUpdated: 'Đã cập nhật ván',
        first: 'Nhất',
        second: 'Nhì',
        third: 'Ba',
        fourth: 'Tư',
        start_match: 'Bắt đầu trận đấu',
        no_match_found: 'Chưa có trận đấu nào đang diễn ra',
        start_match_new: 'Bắt đầu trận đấu mới',
        match_happening: 'Trận Đấu Đang Diễn Ra',
        paused_matches: 'Tạm dừng trận đấu',
        score_table: 'Bảng Điểm',
        no_rounds: 'Chưa có ván nào. Nhấn + để bắt đầu!',
        end_match: 'Kết Thúc',
        new_round: 'Nhập Ván Mới',

    },
    en: {
        penalties: 'Penalties',
        new_round: 'New Round',
        end_match: 'End Match',
        no_rounds: 'No rounds. Press + to start!',
        score_table: 'Score Table',
        paused_matches: 'Paused matches',
        match_happening: 'Match is happening',
        start_match_new: 'Start new match',
        no_match_found: 'No match found',
        start_match: 'Start match',
        continue_match: 'Continue match',
        custom_system_penalty_rules: 'Custom system and penalty rules',
        rule_config: 'Rule Config',
        edit_config: 'Edit Config',
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
        sortByScore: 'Highest Score',
        sortByWins: 'Most Wins',
        sortByMatches: 'Most Matches',
        winRate: 'win rate',
        noStatsYet: 'No statistics yet',
        playToSeeStats: 'Play some matches to see statistics',

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

        // SplashScreen
        splashTagline: 'Quick Scoring – Fair – Offline',

        // WelcomeScreen
        welcomeTitle: 'Welcome to\nKoya Score',
        quickScoring: 'Quick Scoring',
        lightAds: 'Light Ads',
        noDataCollection: 'No Data Collection',
        yourPrivacy: 'Your Privacy',
        privacyRespect: 'We respect your privacy.',
        localDataOnly: 'The app only stores data on your device. No information is sent to external servers.',
        localStorageInfo: 'All score and history data is stored locally on your device',
        wifiAdInfo: 'Turn on wifi to reduce ads',
        continue: 'Continue',
        getStarted: 'Get Started',

        // TermsPrivacyScreen
        termsAndPrivacy: 'Terms & Privacy',
        termsOfService: 'Terms of Service',
        viewTerms: 'View Terms',
        viewPrivacy: 'View Privacy',
        acceptTerms: 'I agree to the terms of use and privacy policy',
        mustAcceptTerms: 'You must accept the terms to continue',
        termsContent1: 'By using this app, you agree to the following terms:',
        termsPoint1: 'The app is provided "as is" without any warranties',
        termsPoint2: 'You are responsible for your use of the app',
        termsPoint3: 'We reserve the right to update the app at any time',
        termsPoint4: 'You may not use the app for illegal purposes',
        privacyContent1: 'We are committed to protecting your privacy:',
        privacyPoint1: 'All data is stored locally on your device',
        privacyPoint2: 'No personal information is collected',
        privacyPoint3: 'No data is shared with third parties',
        privacyPoint4: 'You have full control over your data',

        // RoundDetailsScreen
        roundDetails: 'Round Details',
        round: 'Round',
        totalScoreChange: 'Total Score Change',
        actions: 'Actions',
        noActions: 'No actions',
        scoreBreakdown: 'Score Breakdown',
        editRound: 'Edit Round',
        deleteRound: 'Delete Round',
        confirmDeleteRound: 'Are you sure you want to delete this round?',
        roundDeleted: 'Round deleted',
        roundUpdated: 'Round updated',
        first: 'First',
        second: 'Second',
        third: 'Third',
        fourth: 'Fourth',
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
