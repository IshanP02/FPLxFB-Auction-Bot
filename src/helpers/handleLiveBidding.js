const validation = require('./validateProposalOrBid');
const dbconnection = require('../../database/dbconnection');
const conversions = require('./roleConversions');
const draft = require('./draftPlayer');
require('dotenv').config();

async function liveAuctionHandler(client) {
    const [currentBid] = await dbconnection.query(
        'SELECT * FROM currentproposal WHERE status = ?',
        ['open']
    );

    if (!currentBid) {
        console.log('No active auction found.');
        return false;
    }

    const auctionChan = client.channels.cache.get(process.env.AUCTION_CHAN_ID);
    if (!auctionChan) {
        console.log('Auction channel not found.');
        return false;
    }

    await auctionChan.send(`💥 **Bidding Started!** 💥\nPlayer: **${currentBid.player_name}**\nCurrent Bid: **${currentBid.current_bid}** by Team ID: **${currentBid.team_id}**`);

    let teamId = currentBid.team_id;
    let bid = currentBid.current_bid;
    let countdownTimeout = null;
    let collectorEnded = false;

    const filter = async response => {
        if (collectorEnded) return false;

        const member = await response.guild.members.fetch(response.author.id);
        const userRoles = member.roles.cache.map(role => role.id);
        const roleName = conversions.convertRoleIdToName(userRoles);
        const incomingTeamId = await conversions.getTeamIdFromName(roleName);

        const isValid = await validation.validateProposalOrBid(currentBid.player_name, incomingTeamId, response.content);
        if (isValid) {
            teamId = incomingTeamId;
        } else {
            response.reply({ content: `Invalid bid: ${isValid.reason}`, ephemeral: true });
            response.message.react('❌');
        }
        return isValid;
    };

    const collector = auctionChan.createMessageCollector({
        filter,
        idle: 5000,
        time: 240000
    });

    const startCountdown = async () => {
        try {
            await auctionChan.send(`⏳ Current bid is **${bid}** by **${conversions.convertRoleIdToName([teamId])}**`);
            countdownTimeout = setTimeout(async () => {
                await auctionChan.send('🔔 **GOING ONCE!**');
                countdownTimeout = setTimeout(async () => {
                    await auctionChan.send('🔔 **GOING TWICE!**');
                    countdownTimeout = setTimeout(async () => {
                        await auctionChan.send('🔔 **SOLD!**');
                        collector.stop('sold');
                    }, 1000);
                }, 1000);
            }, 1000);
        } catch (err) {
            console.error('Error during countdown:', err);
        }
    };

    const cancelCountdown = () => {
        if (countdownTimeout) {
            clearTimeout(countdownTimeout);
            countdownTimeout = null;
            console.log('⏹️ Countdown cancelled due to new bid.');
        }
    };

    collector.on('collect', async message => {
        cancelCountdown();

        bid = parseInt(message.content);
        console.log(`💰 New bid received: ${bid} by ${message.author.username}`);

        message.react('✅');

        await dbconnection.query(
            'UPDATE currentproposal SET current_bid = ?, team_id = ? WHERE status = ?',
            [bid, teamId, 'open']
        );

    });

    collector.on('end', async (collected, reason) => {
        collectorEnded = true;

        if (countdownTimeout) clearTimeout(countdownTimeout);

        if (reason === 'sold') {
            console.log('Auction sold after countdown.');
            await auctionChan.send(`🎉 **Bidding complete!**\nPlayer **${currentBid.player_name}** sold to Team **${teamId}** for **${bid}**!`);
        } else {
            console.log(`Collector ended due to: ${reason}`);
            await auctionChan.send(`⚠️ Bidding ended unexpectedly. Reason: ${reason}`);
        }

        await dbconnection.query(
            'UPDATE currentproposal SET status = ? WHERE status = ?',
            ['closed', 'open']
        );
    });

    collector.on('idle', () => {
        if (!collectorEnded && !countdownTimeout) {
            console.log('No bids received for 5 seconds — starting countdown...');
            startCountdown();
        }
    });

    draft.draftPlayer(currentBid.player_name, teamId, bid);

    return true;
}

async function promptNextTeam(client) {

    const [latestProposal] = await dbconnection.query(
        'SELECT * FROM currentproposal ORDER BY id DESC LIMIT 1'
    );
    const teamId = latestProposal.team_id;

    let round;
    if (latestProposal.id >= 0 && latestProposal.id <= 9) {
        round = 1;
    } else if (latestProposal.id >= 10 && latestProposal.id <= 19) {
        round = 2;
    } else if (latestProposal.id >= 20 && latestProposal.id <= 29) {
        round = 3;
    } else if (latestProposal.id >= 30 && latestProposal.id <= 39) {
        round = 4;
    } else if (latestProposal.id >= 40 && latestProposal.id <= 49) {
        round = 5;
    }

    auctionChan = client.channels.cache.get(process.env.AUCTION_CHAN_ID);
    userIdToPing = 125395426948939776; // temp hardcode
    await auctionChan.send(`It's your turn to propose a player, <@${userIdToPing}>!`);

    return liveAuctionHandler(client);
}

module.exports = { liveAuctionHandler, promptNextTeam };