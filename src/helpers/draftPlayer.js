const teamInfo = require('./getTeamsInfo');
const dbconnection = require('../database/dbconnection');

async function draftPlayer(playerName, teamId, points) {
    try {

        const [playerRows] = await dbconnection.query(
            'SELECT role FROM undraftedplayers WHERE player_name = ?',
            [playerName]
        );
        
        await dbconnection.query(
            'INSERT INTO draftedplayers (player_name, role, points) VALUES (?, ?, ?)',
            [playerName, playerRows[0].role, points]
        );

        await dbconnection.query(
            'DELETE FROM undraftedplayers WHERE player_name = ?',
            [playerName]
        );

        await teamInfo.updateTeamPoints(teamId, points);

        return true;
    } catch (error) {
        console.error('Error drafting player:', error);
        return false;
    }
}

module.exports = { draftPlayer };