const teamInfo = require('./getTeamsInfo');

async function draftPlayer(playerName, role, points) {
    try {
        // Add player to draftedplayers table
        await dbconnection.query(
            'INSERT INTO draftedplayers (player_name, role, points) VALUES (?, ?, ?)',
            [playerName, role, points]
        );

        // Remove player from undraftedplayers table
        await dbconnection.query(
            'DELETE FROM undraftedplayers WHERE player_name = ?',
            [playerName]
        );

        // Update team points
        await teamInfo.updateTeamPoints(role, points);

        return true;
    } catch (error) {
        console.error('Error drafting player:', error);
        return false;
    }
}

module.exports = { draftPlayer };