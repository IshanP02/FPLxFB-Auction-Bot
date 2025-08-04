const dbconnection = require('./dbconnection');

async function setupDatabase() {

    const createTeamsTable = `
    CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_name VARCHAR(255),
        disc_role_id VARCHAR(255),
        top VARCHAR(255),
        jungle VARCHAR(255),
        mid VARCHAR(255),
        bot VARCHAR(255),
        support VARCHAR(255),
        points INT DEFAULT 0
    );
    `;

    const createUndraftedPlayersTable = `
    CREATE TABLE IF NOT EXISTS undraftedplayers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_name VARCHAR(255),
        role VARCHAR(255)
    );
    `;

    const createDraftedPlayersTable = `
    CREATE TABLE IF NOT EXISTS draftedplayers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_name VARCHAR(255),
        role VARCHAR(255),
        points INT
    );
    `;

    const currentProposalTable = `
    CREATE TABLE IF NOT EXISTS currentproposal (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_name VARCHAR(255),
        team_name VARCHAR(255),
        current_bid INT
        status VARCHAR(255) DEFAULT 'sold'
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

        await dbconnection.query(createUndraftedPlayersTable);
        console.log("Table 'undraftedplayers' created or already exists.");

        // await dbconnection.query(`DROP TABLE IF EXISTS undraftedplayers`);
        // console.log("Table 'undraftedplayers' dropped.");

        await dbconnection.query(createDraftedPlayersTable);
        console.log("Table 'draftedplayers' created or already exists.");

        // await dbconnection.query(`DROP TABLE IF EXISTS draftedplayers`);
        // console.log("Table 'draftedplayers' dropped.");

        await dbconnection.query(currentProposalTable);
        console.log("Table 'currentproposal' created or already exists.");

        // await dbconnection.query(`DROP TABLE IF EXISTS currentproposal`);
        // console.log("Table 'currentproposal' dropped.");

        console.log("Database setup complete.");
    } catch (err) {
        console.error("Error setting up database:", err.message);
    }
}

setupDatabase();