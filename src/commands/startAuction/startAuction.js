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

        // - tracking who's turn it is to propose a player
        //If I do that, all this class has to do is call that method to start the draft and trigger everything else
        // - prompt the first team to propose a player

    },

    name: 'start-auction',
    description: 'Begin the auction draft'
}