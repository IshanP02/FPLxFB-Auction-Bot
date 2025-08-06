/**
 * Adds a player to the draftedplayers table and removes them from the undraftedplayers table.
 * @param {string} playerName - The name of the player to draft.
 * @param {string} role - The role of the player (e.g., 'top', 'jungle').
 * @param {number} points - The points spent to draft the player.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
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

        return true;
    } catch (error) {
        console.error('Error drafting player:', error);
        return false;
    }
}

module.exports = { draftPlayer };