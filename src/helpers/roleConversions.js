const dbconnection = require('../database/dbconnection');

function convertRoleIdToName(roleIds) {

    const roleMapping = {
        '1393288661935591434': 'FB',
        '1391486538432643212': 'MSL',
        '1393291633268621494': 'TTM',
        '1393291693444435978': 'MKY',
        '1393291706404704307': 'Silversong',
        '1393291709546500169': 'TFF',
        '1393291717226139649': 'Legacy',
        '1393291721949057226': 'DoG',
        '1393291724259856384': 'XSV',
        '1393291719771951246': 'DNE',       
    };
    for (const roleId of roleIds) {
        if (roleMapping[roleId]) {
            return roleMapping[roleId];
        }
    }
    return 'Unknown Role';
}

async function getTeamIdFromName(teamName) {
    try {
        const rows = await dbconnection.query(`SELECT disc_role_id FROM teams WHERE team_name = ?`, [teamName]);
        if (rows.length > 0) {
            return rows[0].id;
        }
    } catch (error) {
        console.error('Error fetching team ID:', error);
    }
    return null;
}

module.exports = { convertRoleIdToName, getTeamIdFromName };