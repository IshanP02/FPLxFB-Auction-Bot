const validation = require('./validateProposalOrBid');
const dbconnection = require('../database/dbconnection');
const conversions = require('./roleConversions');
const teamInfo = require('./getTeamsInfo');
require('dotenv').config();

let collectorEnded;

async function liveAuctionHandler(client) {

    let idleTimer = null;
    let countdownTimeout = null;

    const resetIdleTimer = () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (!collectorEnded && !countdownTimeout) {
                console.log('No bids received for 5 seconds — starting countdown...');
                startCountdown();
            }
        }, 5000); // 8s idle time
    };

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

    await auctionChan.send(`💥 **Bidding Started!** 💥\nPlayer: **${currentBid[0].player_name}**\nCurrent Bid: **${currentBid[0].current_bid}** by Team: **${conversions.convertSingleRoleIdToName(currentBid[0].team_id)}**`);
    resetIdleTimer();

    let teamId = currentBid[0].team_id;
    let bid = currentBid[0].current_bid;
    collectorEnded = false;

    const filter = async response => {
        if (collectorEnded) return false;

        if (response.author.id === '1401620689156309003') {
            return false;
        }

        const member = await response.guild.members.fetch(response.author.id);
        const userRoles = member.roles.cache.map(role => role.id);
        const incomingTeamId = conversions.getTeamRole(userRoles);

        let isValid = false;
        const bidValue = parseInt(response.content, 10);

        if (Number.isInteger(bidValue)) {
            isValid = await validation.validateProposalOrBid(currentBid[0].player_name, incomingTeamId, response.content, "bid");
        } else {
            response.reply({ content: 'Invalid bid: Bid must be an integer.', ephemeral: true });
            // response.message.react('❌');
        }

        if (isValid.valid) {
            teamId = incomingTeamId;
        } else {
            response.reply({ content: `Invalid bid: ${isValid.reason}`, ephemeral: true });
            // response.message.react('❌');
        }

        return isValid.valid;
    };

    const collector = auctionChan.createMessageCollector({
        filter,
        time: 240000
    });

    const startCountdown = async () => {
        if (idleTimer) clearTimeout(idleTimer);
        try {
            await auctionChan.send(`⏳ Current bid is **${bid}** by **${conversions.convertSingleRoleIdToName(teamId)}**`);
            countdownTimeout = setTimeout(async () => {
                await auctionChan.send('🔔 **GOING ONCE!**');
                countdownTimeout = setTimeout(async () => {
                    await auctionChan.send('🔔 **GOING TWICE!**');
                    countdownTimeout = setTimeout(async () => {
                        await auctionChan.send('🔔 **SOLD!**');
                        collector.stop('sold');
                    }, 2000);
                }, 2000);
            }, 2000);
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
        resetIdleTimer();
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
            console.log('Player sold after countdown.');
            draftPlayer(currentBid[0].player_name, teamId, bid, client);
            await auctionChan.send(`🎉 **Bidding complete!**\nPlayer **${currentBid[0].player_name}** sold to Team **${conversions.convertSingleRoleIdToName(teamId)}** for **${bid}**!`);
        } else {
            console.log(`Collector ended due to: ${reason}`);
            await auctionChan.send(`⚠️ Bidding ended unexpectedly. Reason: ${reason}`);
        }

        const [draftedPlayer] = await dbconnection.query(
            'SELECT * FROM draftedplayers WHERE player_name = ?',
            [currentBid[0].player_name]
        );

        if (draftedPlayer && draftedPlayer[0].role) {
            const role = draftedPlayer[0].role;

            const teams = await dbconnection.query('SELECT disc_role_id FROM teams');
            const allTeamIds = teams.map(row => row.id);

            const teamsWithRole = await dbconnection.query(
                'SELECT team_id FROM draftedplayers WHERE role = ?',
                [role]
            );
            const teamsWithRoleSet = new Set(teamsWithRole.map(row => row.team_id));
            const missingTeamIds = allTeamIds.filter(id => !teamsWithRoleSet.has(id));

            if (missingTeamIds.length === 1) {
                const missingTeamId = missingTeamIds[0];
                const [remainingPlayer] = await dbconnection.query(
                    'SELECT player_name FROM undraftedplayers WHERE role = ?',
                    [role]
                );
                const remainingPlayerName = remainingPlayer[0].player_name;
                await draftPlayer(remainingPlayerName, missingTeamId, 1, client);

                await auctionChan.send(
                    `🛠️ Only one team left missing a player for role **${role}**. Player **${remainingPlayerName}** automatically assigned to Team **${conversions.convertRoleIdToName([missingTeamId])}**!`
                );
            }
        }

        await dbconnection.query(
            'UPDATE currentproposal SET status = ? WHERE status = ?',
            ['closed', 'open']
        );
    });

    return true;
}

async function promptNextTeam(client, initialBid) {

    const roleIds = [
        '1391486538432643212',
        '1393291712272797706',
        '1393291717226139649',
        '1393291709546500169',
        '1393291693444435978',
        '1393288661935591434',
        '1393291714822799522',
        '1393291719771951246',
        '1393291706404704307',
        '1393291721949057226',
        '1393291633268621494',
        '1393291724259856384',
    ];

    const auctionChan = client.channels.cache.get(process.env.AUCTION_CHAN_ID);
    let roleIdToPing;

    let index;
    let nextId;
    if (initialBid) {
        nextId = 1
    }
    else {
        const [latestProposal] = await dbconnection.query(
            'SELECT * FROM currentproposal ORDER BY id DESC LIMIT 1'
        );
        nextId = latestProposal[0].id + 1;
    }
    let round = Math.ceil(nextId / roleIds.length);
    if (round % 2 === 1) {
        index = (nextId - 1) % roleIds.length;
    } else {
        index = roleIds.length - 1 - ((nextId - 1) % roleIds.length);
    }
    roleIdToPing = roleIds[index];

    var emptyRoles = await teamInfo.countEmptyRoles(roleIdToPing);

    if (emptyRoles === 0) {
        await auctionChan.send(`<@&${roleIdToPing}> has already filled all their roles. Skipping to the next team.`);
        await dbconnection.query(
            'INSERT INTO currentproposal (player_name, team_id, current_bid, status) VALUES (?, ?, ?, ?)',
            ['NONE', roleIdToPing, 0, 'closed']
        );
        await promptNextTeam(client, false);
    }
    else if (nextId - 1 > 60) {
        await auctionChan.send(`All teams have filled their rosters or the maximum number of rounds has been reached. The auction is now complete! 🎉`);
    }
    else if (nextId - 1 === 8) {
        await auctionChan.send(`<@&${roleIdToPing}> has already obtained a first round player. Skipping to the next team.`);
        await dbconnection.query(
            'INSERT INTO currentproposal (player_name, team_id, current_bid, status) VALUES (?, ?, ?, ?)',
            ['NONE', roleIdToPing, 0, 'closed']
        );
        await promptNextTeam(client, false);
    }
    else {
        await auctionChan.send(`It's your turn to propose a player, <@&${roleIdToPing}>!`);
    }

}

async function draftPlayer(playerName, teamId, points, client) {
    try {

        const [playerRows] = await dbconnection.query(
            'SELECT role FROM undraftedplayers WHERE player_name = ?',
            [playerName]
        );

        await dbconnection.query(
            'INSERT INTO draftedplayers (player_name, role, points, team_id) VALUES (?, ?, ?, ?)',
            [playerName, playerRows[0].role, points, teamId]
        );

        await dbconnection.query(
            'DELETE FROM undraftedplayers WHERE player_name = ?',
            [playerName]
        );

        await teamInfo.updateTeamPoints(teamId, points);

        await dbconnection.query(
            `UPDATE teams SET ${playerRows[0].role} = ? WHERE disc_role_id = ?`,
            [playerName, teamId]
        );

        await promptNextTeam(client, false);

        return true;
    } catch (error) {
        console.error('Error drafting player:', error);
        return false;
    }
}

module.exports = { liveAuctionHandler, promptNextTeam, draftPlayer };