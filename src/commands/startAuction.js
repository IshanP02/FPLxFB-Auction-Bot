require('dotenv').config();
const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const dbconnection = require('../../database/dbconnection');

module.exports = {

    callback: async (interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        // - tracking who's turn it is to propose a player
        //If I do that, all this class has to do is call that method to start the draft and trigger everything else
        // - prompt the first team to propose a player

    },

    name: 'startAuction',
    description: 'Begin the auction draft'
}