const dbconnection = require('./dbconnection');

async function setupDatabase() {

    const createTeamsTable = `
    CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_name VARCHAR(255),
        role_id VARCHAR(255),
        top VARCHAR(255),
        jungle VARCHAR(255),
        mid VARCHAR(255),
        bot VARCHAR(255),
        support VARCHAR(255),
        points INT DEFAULT 0
    );
    `;

    const createPlayersTable = `
    CREATE TABLE IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_name VARCHAR(255),
        role VARCHAR(255)
    );
    `;

    try {
        console.log("Setting up the database...");

        await dbconnection.query(`USE customer_923555_SnS`);
        console.log("Switched to database 'customer_923555_SnS'.");

        await dbconnection.query(createTeamsTable);
        console.log("Table 'teams' created or already exists.");

        // await dbconnection.query(`DROP TABLE IF EXISTS teams`);
        // console.log("Table 'teams' dropped.");

        await dbconnection.query(createPlayersTable);
        console.log("Table 'players' created or already exists.");

        // await dbconnection.query(`DROP TABLE IF EXISTS players`);
        // console.log("Table 'players' dropped.");

        console.log("Database setup complete.");
    } catch (err) {
        console.error("Error setting up database:", err.message);
    }
}

setupDatabase();