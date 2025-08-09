const fs = require('fs');
const path = require('path');
const dbconnection = require('../database/dbconnection');
const filePath = path.join(__dirname, 'emptyTeams.txt');

async function importTeams() {
    try {
        const [rows] = await dbconnection.query('SELECT COUNT(*) AS count FROM teams');
        
        if (rows[0].count > 0) {
            console.log('Teams table is not empty. Skipping data import.');
            return;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const lines = fileContent.split('\n').filter(line => line.trim() !== '');

        const query = `
        INSERT INTO teams (team_name, disc_role_id, top, jungle, mid, bot, support, points)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const connection = await dbconnection.getConnection();
        await connection.beginTransaction();

        for (const line of lines) {
            let [name, role_id, top, jungle, mid, bot, supp, points] = line.split(',');

            await connection.query(query, [name.trim(), role_id.trim(), top.trim(), jungle.trim(), mid.trim(), bot.trim(), supp.trim(), points.trim()]);
        }

        await connection.commit();

        console.log('All Teams data has been imported successfully.');
    } catch (err) {
        console.error('Error importing Teams data:', err.message);
    }
}

importTeams();