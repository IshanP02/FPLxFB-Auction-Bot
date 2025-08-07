require('dotenv').config();
const conversions = require('./helpers/roleConversions');
const validation = require('./helpers/validateProposalOrBid');
const liveauction = require('./helpers/handleLiveBidding');
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

        await dbconnection.query(
            'INSERT INTO currentproposal (player_name, team_id, current_bid, status) VALUES (?, ?, ?, ?)',
            [playerName, teamId, startingBid, 'open']
        );

        liveauction.liveAuctionHandler(client);      

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