const dbconnection = require('../../database/dbconnection');

module.exports = {
    getTeamPoints: async function (id, position) {
        try {
            const rows = await dbconnection.query(`SELECT points, ? FROM teams WHERE id = ?`, position, id);
            return rows;
        } catch (error) {
            console.error('Error fetching teams from database:', error);
            throw error;
        }
    }
}
