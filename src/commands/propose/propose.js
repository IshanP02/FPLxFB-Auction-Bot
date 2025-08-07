require('dotenv').config();
const conversions = require('../../helpers/roleConversions');
const validation = require('../../helpers/validateProposalOrBid');
const liveauction = require('../../helpers/handleLiveBidding');
const { ApplicationCommandOptionType } = require('discord.js');
const dbconnection = require('../../database/dbconnection');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {

    callback: async (client, interaction) => {

        const allowedChannelId = process.env.AUCTION_CHAN_ID;
        if (interaction.channel.id !== allowedChannelId) {
            return interaction.reply({
                content: `🚫 This command can only be used in <#${allowedChannelId}>.`,
                ephemeral: true
            });
        }

        const playerName = interaction.options.getString('player');
        const startingBid = interaction.options.getInteger('starting_bid');
        const roles = interaction.member.roles.cache.map(role => role.id);
        const teamId = conversions.getTeamRole(roles);

        validProposal = await validation.validateProposalOrBid(playerName, teamId, startingBid, "proposal");

        if (Number.isInteger(startingBid) === false) {
            validProposal = { valid: false, reason: 'Starting bid must be an integer.' };
            return interaction.reply({ content: '🚫 Starting bid must be an integer.', ephemeral: true });
        }

        if (!validProposal.valid) {
            await interaction.reply({ content: `Invalid proposal: ${validProposal.reason}`, ephemeral: true });
            return;
        }

        await dbconnection.query(
            'INSERT INTO currentproposal (player_name, team_id, current_bid, status) VALUES (?, ?, ?, ?)',
            [playerName, teamId, startingBid, 'open']
        );

        await interaction.reply({ content: `✅ Proposal accepted: ${playerName} with starting bid of ${startingBid} points. Bidding will start shortly!` });

        await wait(30000);

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