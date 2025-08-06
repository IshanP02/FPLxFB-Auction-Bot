const dbconnection = require('../../database/dbconnection');

/**
 * Validates a player proposal for the auction draft.
 * @param {string} playerName - The name of the proposed player.
 * @param {string} role - The role for the proposed player.
 * @returns {Promise<{valid: boolean, reason?: string}>}
 */
async function validateProposal(playerName) {
    try {
        // Check if player exists and is undrafted
        const [undrafted] = await dbconnection.query(
            'SELECT * FROM undraftedplayers WHERE player_name = ?',
            [playerName]
        );
        if (undrafted.length === 0) {
            return { valid: false, reason: 'Player not found or already drafted.' };
        }

        // Additional validation logic can be added here

        return { valid: true };
    } catch (error) {
        console.error('Error validating proposal:', error);
        return { valid: false, reason: 'Database error.' };
    }
}

module.exports = { validateProposal };