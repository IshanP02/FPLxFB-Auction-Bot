require('dotenv').config();
const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const dbconnection = require('../../database/dbconnection');
const liveauction = require('../../helpers/handleLiveBidding');


module.exports = {

    callback: async (client, interaction) => {

        const allowedChannelId = process.env.AUCTION_CHAN_ID;
        if (interaction.channel.id !== allowedChannelId) {
            return interaction.reply({
                content: `🚫 This command can only be used in <#${allowedChannelId}>.`,
                ephemeral: true
            });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'You can\'t do that', ephemeral: true });

        await interaction.reply({ content: 'Auction draft started! Teams can now propose players using /propose', ephemeral: true });

        liveauction.promptNextTeam(client);

    },

    name: 'start-auction',
    description: 'Begin the auction draft'
}