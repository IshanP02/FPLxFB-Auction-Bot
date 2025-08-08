const dbconnection = require('../database/dbconnection');

module.exports = {
    getTeamPoints: async function (id) {
        try {
            const rows = await dbconnection.query(`SELECT points FROM teams WHERE disc_role_id = ?`, id);
            return rows[0][0].points;
        } catch (error) {
            console.error('Error fetching teams from database:', error);
            throw error;
        }
    },

    getTeamById: async function (id) {
        try {
            const rows = await dbconnection.query(`SELECT * FROM teams WHERE disc_role_id = ?`, id);
            return rows;
        } catch (error) {
            console.error('Error fetching teams from database:', error);
            throw error;
        }
    },

    getTeamRoleSlot: async function (id, role) {
        try {
            const [rows] = await dbconnection.query(`SELECT * FROM teams WHERE disc_role_id = ?`, id);
            if (role === 'top') { return rows[0].top; }
            if (role === 'jungle') { return rows[0].jungle; }
            if (role === 'mid') { return rows[0].mid; }
            if (role === 'bot') { return rows[0].bot; }
            if (role === 'support') { return rows[0].support; }
        } catch (error) {
            console.error('Error fetching teams from database:', error);
            throw error;
        }
    },

    countEmptyRoles: async function (teamId) {
        try {
            const rows = await dbconnection.query(`SELECT top, jungle, mid, bot, support FROM teams WHERE disc_role_id = ?`, teamId);
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
            await dbconnection.query(`UPDATE teams SET points = points - ? WHERE disc_role_id = ?`, [points, teamId]);
        } catch (error) {
            console.error('Error updating team points:', error);
            throw error;
        }
    },

    getRoleFromName: async function (playerName) {
        try {
            const rows = await dbconnection.query(`SELECT role FROM undraftedplayers WHERE player_name = ?`, [playerName]);
            if (rows.length > 0) {
                return rows[0][0].role;
            }
        } catch (error) {
            console.error('Error fetching role from player name:', error);
        }
        return null;
    }

}
