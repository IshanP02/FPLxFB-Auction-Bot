const fs = require('fs');
const path = require('path');
const dbconnection = require('../database/dbconnection');
const filePath = path.join(__dirname, 'players.txt');

async function importPlayers() {
    try {
        const [rows] = await dbconnection.query('SELECT COUNT(*) AS count FROM undraftedplayers');

        if (rows[0].count > 0) {
            console.log('Players table is not empty. Skipping data import.');
            return;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const lines = fileContent.split('\n').filter(line => line.trim() !== '');

        const query = `
        INSERT INTO undraftedplayers (player_name, role)
        VALUES (?, ?)
        `;

        const connection = await dbconnection.getConnection();
        await connection.beginTransaction();

        for (const line of lines) {
            let [name, role] = line.split(',');

            await connection.query(query, [name.trim(), role.trim()]);
        }

        await connection.commit();

        console.log('All Players data has been imported successfully.');
    } catch (err) {
        console.error('Error importing Players data:', err.message);
    }
}

importPlayers();