require('dotenv').config();
const { Client, IntentsBitField, ActivityType } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

require('./database/db');
require('./imports/importEmptyTeams');
require('./imports/importPlayers');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

eventHandler(client);

client.login(process.env.TOKEN);

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online.`);

    client.user.setActivity({
        name: 'FPL Season 1 Auction',
        type: ActivityType.Watching,
    });
});
