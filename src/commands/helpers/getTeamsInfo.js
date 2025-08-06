const dbconnection = require('../../database/dbconnection');

module.exports = {
    getTeamPoints: async function (id) {
        try {
            const rows = await dbconnection.query(`SELECT points FROM teams WHERE id = ?`, id);
            return rows[points];
        } catch (error) {
            console.error('Error fetching teams from database:', error);
            throw error;
        }
    },

    getTeamById: async function (id) {
        try {
            const rows = await dbconnection.query(`SELECT * FROM teams WHERE id = ?`, id);
            return rows;
        } catch (error) {
            console.error('Error fetching teams from database:', error);
            throw error;
        }
    },

    getTeamRoleSlot: async function (id, role) {
        try {
            const rows = await dbconnection.query(`SELECT * FROM teams WHERE id = ?`, id);
            return rows[role.toLowerCase()];
        } catch (error) {
            console.error('Error fetching teams from database:', error);
            throw error;
        }
    },

    countEmptyRoles: async function (teamId) {
        try {
            const rows = await dbconnection.query(`SELECT top, jungle, mid, bot, supp FROM teams WHERE id = ?`, teamId);
            if (!rows || rows.length === 0) return 5;
            const team = rows[0];
            const roles = ['top', 'jungle', 'mid', 'bot', 'support'];
            let emptyCount = 0;
            for (const role of roles) {
                if (!team[role]) emptyCount++;
            }
            return emptyCount;
        } catch (error) {
            console.error('Error counting empty roles:', error);
            throw error;
        }
    },

    updateTeamPoints: async function (teamId, points) {
        try {
            await dbconnection.query(`UPDATE teams SET points = points - ? WHERE id = ?`, [points, teamId]);
        } catch (error) {
            console.error('Error updating team points:', error);
            throw error;
        }
    }

}
