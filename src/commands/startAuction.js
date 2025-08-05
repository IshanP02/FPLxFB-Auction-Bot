require('dotenv').config();
const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');
const dbconnection = require('../../database/dbconnection');

module.exports = {

    callback: async (interaction) => {

        //I'm thinking maybe there's another file with a method to call that actually does the bulk of the work in terms of:
        // - tracking which round of draft we're on
        // - tracking who's turn it is to propose a player
        // - tracking the current bid and who has it
        // - tracking when a player is sold and to whom
        // - updating the database accordingly
        //If I do that, all this class has to do is call that method to start the draft and trigger everything else

        //Once called, that function should:
        // - prompt the first team to propose a player
        // - wait for a proposal
        // - once a proposal is made, it should start reading every message in the channel to see if it's a bid (maybe call a diff function to check for valid bids)
        // - it should also set current bid's status in the database to live or open or something
        // - save the most recent valid bid constantly
        // - once 3 second goes without a bid, it should post the current bid and who has it
        // - once ANOTHER 2 seconds goes without a bid, it should finalize the sale, update the database, and prompt the next team to propose a player

        //the propose.js file should be used to propose a player, this is where any checks to make sure the proposal is valid should be made
        // - once a valid proposal is made, it should call the function that handles the live bidding process which should handle everything until another sale is made, and the next team is prompted

    },

    name: 'startAuction',
    description: 'Begin the auction draft'
}