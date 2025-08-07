const dbconnection = require('../database/dbconnection');
const teamInfo = require('./getTeamsInfo');

async function validateProposalOrBid(playerName, teamId, bid) {
    try {
        
        const [undrafted] = await dbconnection.query(
            'SELECT * FROM undraftedplayers WHERE player_name = ?',
            [playerName]
        );
        if (undrafted.length === 0) {
            return { valid: false, reason: 'Player not found or already drafted.' };
        }

        var roleAvailable = await checkRoleAvailability(teamId, undrafted[0].position);
        if (!roleAvailable) {
            return { valid: false, reason: `No available slots for role: ${undrafted[0].position}` };
        }

        var pointsAvailable = await checkPointsAvailability(teamId, bid);
        if (!pointsAvailable) {
            return { valid: false, reason: `Not enough points to cover bid and minimum required points for remaining slots.` };
        }

        currentBid = dbconnection.query(
            'SELECT * FROM currentproposal WHERE status = ?',
            ['open']
        );
        if (currentBid.length > 0 && bid <= currentBid[0].current_bid) {
            return { valid: false, reason: `Bid must be higher than the current bid of ${currentBid[0].current_bid}.` };
        }

        let round;
        if (currentBid[0].id >= 0 && currentBid[0].id <= 9) {
            round = 1;
        } else if (currentBid[0].id >= 10 && currentBid[0].id <= 19) {
            round = 2;
        } else if (currentBid[0].id >= 20 && currentBid[0].id <= 29) {
            round = 3;
        } else if (currentBid[0].id >= 30 && currentBid[0].id <= 39) {
            round = 4;
        } else if (currentBid[0].id >= 40 && currentBid[0].id <= 49) {
            round = 5;
        }

        if (round === 1 && bid < 15) {
            return { valid: false, reason: 'Minimum bid for round 1 is 15 points.' };
        }
        if (round === 2 && bid < 10) {
            return { valid: false, reason: 'Minimum bid for round 2 is 10 points.' };
        }
        if ((round === 3 || round === 4 || round === 5) && bid < 1) {
            return { valid: false, reason: 'Minimum bid for round 3 is 1 point.' };
        }

        return { valid: true };
    } catch (error) {
        console.error('Error validating proposal:', error);
        return { valid: false, reason: 'Database error.' };
    }
}

module.exports = { validateProposalOrBid };

async function checkRoleAvailability(teamId, role) {
    try {
        const [slot] = await teamInfo.getTeamRoleSlot(teamId, role);
        if (slot.length === 0) {
            return true
        } else {
            return false
        }
    } catch (error) {
        console.error('Error checking role availability:', error);
        return false;
    }
}

async function checkPointsAvailability(teamId, bid) {
    try {
        const points = await teamInfo.getTeamPoints(teamId);
        const emptyRoles = await teamInfo.countEmptyRoles(teamId);

        if (points >= bid + emptyRoles) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.error('Error checking points availability:', error);
        return false;
    }
}