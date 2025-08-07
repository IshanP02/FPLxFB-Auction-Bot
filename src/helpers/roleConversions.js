const dbconnection = require('../database/dbconnection');

function convertRoleIdToName(roleIds) {

    const roleMapping = {
        '1393288661935591434': 'Final Boss Esports',
        '1391486538432643212': 'MetaShift',
        '1393291633268621494': 'To The Moon',
        '1393291693444435978': 'Literal Monkeys',
        '1393291706404704307': 'Silversong',
        '1393291709546500169': 'The Fierce Force',
        '1393291717226139649': 'Legacy Esports',
        '1393291721949057226': 'Dorado Gaming',
        '1393291724259856384': 'XSV',
        '1393291719771951246': 'Definitely Not Esports',
        '1393291712272797706': 'Iridescent Dawn',
        '1393291714822799522': 'Divine Ascension',

    };
    for (const roleId of roleIds) {
        if (roleMapping[roleId]) {
            return roleMapping[roleId];
        }
    }
    return 'Unknown Role';
}

function getTeamRole(roleIds) {

    const validRoleIds = [
        '1393288661935591434',
        '1391486538432643212',
        '1393291633268621494',
        '1393291693444435978',
        '1393291706404704307',
        '1393291709546500169',
        '1393291717226139649',
        '1393291721949057226',
        '1393291724259856384',
        '1393291719771951246',
        '1393291712272797706',
        '1393291714822799522',
    ];

    for (const roleId of roleIds) {
        if (validRoleIds.includes(roleId)) {
            return roleId;
        }
    }
    return null;

}

function convertSingleRoleIdToName(roleId) {

    const roleMapping = {
        '1393288661935591434': 'Final Boss Esports',
        '1391486538432643212': 'MetaShift',
        '1393291633268621494': 'To The Moon',
        '1393291693444435978': 'Literal Monkeys',
        '1393291706404704307': 'Silversong',
        '1393291709546500169': 'The Fierce Force',
        '1393291717226139649': 'Legacy Esports',
        '1393291721949057226': 'Dorado Gaming',
        '1393291724259856384': 'XSV',
        '1393291719771951246': 'Definitely Not Esports',
        '1393291712272797706': 'Iridescent Dawn',
        '1393291714822799522': 'Divine Ascension',

    };
    if (roleMapping[roleId]) {
        return roleMapping[roleId];
    }
    return 'Unknown Role';
}

async function getTeamIdFromName(teamName) {
    try {
        const rows = await dbconnection.query(`SELECT disc_role_id FROM teams WHERE team_name = ?`, [teamName]);
        if (rows.length > 0) {
            return rows[0][0].disc_role_id;
        }
    } catch (error) {
        console.error('Error fetching team ID:', error);
    }
    return null;
}

module.exports = { convertRoleIdToName, getTeamIdFromName, convertSingleRoleIdToName, getTeamRole };