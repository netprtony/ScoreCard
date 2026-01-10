import { PlayerAction, PlayerActionType } from '../types/models';

export interface FormattedAction {
    icon: string;
    text: string;
    details: string;
    score: string;
    color: string;
}

/**
 * Get emoji icon for action type
 */
export const getActionIcon = (actionType: PlayerActionType): string => {
    switch (actionType) {
        case 'giet':
            return '💀';
        case 'heo':
            return '🐷';
        case 'chong':
            return '⚔️';
        case 'dut_ba_tep':
            return '🎯';
        default:
            return '📝';
    }
};

/**
 * Format action description in natural language
 */
export const formatActionDescription = (
    action: PlayerAction,
    actorName: string,
    targetName: string,
    scoreChange: number
): FormattedAction => {
    const icon = getActionIcon(action.actionType);
    let text = '';
    let details = '';
    const score = scoreChange >= 0 ? `+${scoreChange}` : `${scoreChange}`;
    const color = scoreChange >= 0 ? '#4CAF50' : '#F44336';

    switch (action.actionType) {
        case 'giet':
            text = `${targetName} bị giết bởi ${actorName}`;
            if (action.killedPenalties && action.killedPenalties.length > 0) {
                const penalties = action.killedPenalties.map(p => {
                    const typeName = getPenaltyTypeName(p.type);
                    return `${typeName} x${p.count}`;
                }).join(', ');
                details = penalties;
            }
            break;

        case 'heo':
            const heoType = action.heoType === 'den' ? 'đen' : 'đỏ';
            text = `${actorName} chặt heo ${heoType} ${targetName}`;
            details = `${action.heoCount} con`;
            break;

        case 'chong':
            text = `${actorName} chồng ${targetName}`;
            if (action.chongTypes && action.chongTypes.length > 0) {
                const types = action.chongTypes.map((type, idx) => {
                    const typeName = getChongTypeName(type);
                    const count = action.chongCounts?.[idx] || 1;
                    return count > 1 ? `${typeName} x${count}` : typeName;
                }).join(', ');
                details = types;
            }
            break;

        case 'dut_ba_tep':
            text = `${actorName} đút 3 tép ${targetName}`;
            break;

        default:
            text = `${actorName} - ${action.actionType}`;
    }

    return { icon, text, details, score, color };
};

/**
 * Get penalty type display name
 */
const getPenaltyTypeName = (type: string): string => {
    switch (type) {
        case 'heo_den':
            return 'Heo đen';
        case 'heo_do':
            return 'Heo đỏ';
        case 'ba_tep':
            return '3 Tép';
        case 'ba_doi_thong':
            return '3 đôi thông';
        case 'tu_quy':
            return 'Tứ quý';
        default:
            return type;
    }
};

/**
 * Get chồng type display name
 */
const getChongTypeName = (type: string): string => {
    switch (type) {
        case 'heo_den':
            return 'Heo đen';
        case 'heo_do':
            return 'Heo đỏ';
        case 'ba_doi_thong':
            return '3 đôi thông';
        case 'tu_quy':
            return 'Tứ quý';
        default:
            return type;
    }
};

/**
 * Format Tới Trắng action
 */
export const formatToiTrangAction = (
    playerName: string,
    score: number
): FormattedAction => {
    return {
        icon: '⭐',
        text: `${playerName} Tới Trắng`,
        details: '',
        score: `+${score}`,
        color: '#FFC107',
    };
};
