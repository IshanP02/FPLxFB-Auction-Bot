require('dotenv').config();
const conversions = require('./helpers/roleConversions');
const validation = require('./helpers/validateProposalOrBid');
const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const dbconnection = require('../../database/dbconnection');

module.exports = {

    callback: async (interaction) => {

        const playerName = interaction.options.getString('player');
        const startingBid = interaction.options.getInteger('starting_bid');
        const userId = interaction.member.id;
        const user = await client.users.fetch(interaction.member.id);
        const roles = interaction.member.roles.cache.map(role => role.id);

        const teamName = conversions.convertRoleIdToName(roles);

        const teamId = await conversions.getTeamIdFromName(teamName);

        validProposal = await validation.validateProposalOrBid(playerName, teamId, startingBid);

        if (!validProposal.valid) {
            await interaction.reply({ content: `Invalid proposal: ${validProposal.reason}`, ephemeral: true });
            return;
        }

        const proposalEmbed = new EmbedBuilder()
            .setTitle('New proposal!')
            .setDescription(`${user.username}`)
            .setColor('Green')
            .addFields({
                name: 'Player',
                value: `${playerName}`,
                inline: true,
            })
            .addFields({
                name: 'Team',
                value: `${teamName}`,
                inline: true,
            });

        const auctionChan = client.channels.cache.find(channel => channel.id === process.env.AUCTION_CHAN_ID);

        await auctionChan.send({ embeds: [proposalEmbed] });
        

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