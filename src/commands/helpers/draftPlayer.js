const teamInfo = require('./getTeamsInfo');

async function draftPlayer(playerName, teamId, points) {
    try {

        //Get player role from undraftedplayers table
        const [playerRows] = await dbconnection.query(
            'SELECT role FROM undraftedplayers WHERE player_name = ?',
            [playerName]
        );
        
        // Add player to draftedplayers table
        await dbconnection.query(
            'INSERT INTO draftedplayers (player_name, role, points) VALUES (?, ?, ?)',
            [playerName, playerRows[0].role, points]
        );

        // Remove player from undraftedplayers table
        await dbconnection.query(
            'DELETE FROM undraftedplayers WHERE player_name = ?',
            [playerName]
        );

        // Update team points
        await teamInfo.updateTeamPoints(teamId, points);

        return true;
    } catch (error) {
        console.error('Error drafting player:', error);
        return false;
    }
}

module.exports = { draftPlayer };