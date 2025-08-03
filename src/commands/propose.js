require('dotenv').config();
const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const dbconnection = require('../../database/dbconnection');

module.exports = {

    callback: async (interaction) => {

    },

    name: 'propose',
    description: 'Propose a new player to be auctioned',
    options: [
        {
            name: 'player',
            description: 'The player to be auctioned',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'starting_bid',
            description: 'The starting bid for the auction',
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ]
}