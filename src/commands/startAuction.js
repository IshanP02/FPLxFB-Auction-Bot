require('dotenv').config();
const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const dbconnection = require('../../database/dbconnection');

module.exports = {

    callback: async (interaction) => {

    },

    name: 'startAuction',
    description: 'Begin the auction draft'
}