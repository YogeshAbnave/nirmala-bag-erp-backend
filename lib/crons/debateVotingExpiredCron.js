'use strict';

const cron = require('node-cron');
const UserData = require('../../app/models/user.model');
const { DebateData } = require('../../app/models/debate.model');
const { notificationFunction } = require('../../app/controllers/notification.controller');


// Update user for win and loss
const updateUser = async (data, type) => {
    const { creator, joiner } = data;
    let winnerId, looserId = "";
    
    if (type === 'creator') {
        winnerId = creator;
        looserId = joiner;
    } else {
        winnerId = joiner;
        looserId = creator;
    }
    try {
        const winnerUser = await UserData.findByIdAndUpdate(winnerId, { $inc: { "win": 1 } });
        if (winnerUser) {
            // Notification code starts
            let title = "Debate result declared";
            let body = `Congratulations! You have won the debate`;
            let notification_data = {
                userId: winnerUser._id,
                title: title,
                body: body,
                type: "dbt_won",
                description: "Debate result declared"
            }
            notificationFunction(notification_data);
            // Notification code ends
            console.log('User winning incremented');
        }
        const looserUser = await UserData.findByIdAndUpdate(looserId, { $inc: { "loss": 1 } });
        if (looserUser) {
            // Notification code starts
            let title = "Debate result declared";
            let body = `Oh! You have lost the debate`;
            let notification_data = {
                userId: looserUser._id,
                title: title,
                body: body,
                type: "dbt_lost",
                description: "Debate result declared"
            }
            notificationFunction(notification_data);
            // Notification code ends
            console.log('User loss incremented');
        }
        const user = await UserData.findOne({ "active": true, "win": { $gte: 1 } }).sort({ win: -1, loss: 1 }).limit(1);
        if (user) {
            // Notification code starts
            let title = "Ranking result";
            let body = "Congratulations, You have topped in the ranking";
            let notification_data = {
                userId: user._id,
                title: title,
                body: body,
                type: "rank_top",
                description: "Debate ranking result"
            }
            notificationFunction(notification_data);
            // Notification code ends
        }
    } catch (err) {
        console.log(err.message);
    }
}

// declare winner for voting
const declareWinner = async (data) => {
    const { creatorVote, joinerVote, creator, joiner } = data;
    let winnerId, looserId, type;
    if (creatorVote > joinerVote) {
        winnerId = creator;
        looserId = joiner;
        type = 'creator';
    } else if (creatorVote < joinerVote) {
        winnerId = joiner;
        looserId = creator;
        type = 'joiner';
    } else {
        winnerId = 'Draw';
        looserId = 'Draw';
        type = 'Draw';
    }

    try {
        await DebateData.updateOne({ "_id": data._id }, { $set: { "winner": winnerId, "looser": looserId } });
        console.log(`Debate winner is declared. Winner is ${winnerId}`);
        if (type === 'creator' || type === 'joiner') {
            updateUser(data, type);
        }
    } catch (err) {
        console.log(err.message);
    }
}

exports.debateVotingExpiredCron = () => {
    /* Set voting time expired true after 24 hours and declere the winner or looser */
    // running in every 1 hour
    cron.schedule(`*/${process.env.DEBATE_VOTING_EXPIRED_CRON_TIME} * * * *`, async() => {
        try {
            const debateQuery = {
                "voteTimeExpired": false,
                "creator": { $exists: true },
                "joiner": { $exists: true },
                "completedAt": { $exists: true },
                // DEBATE_VOTING_TIME = 3 minutes for local & dev and 24 hours for QA & prod
                "completedAt": { $lte: new Date(Date.now() - process.env.DEBATE_VOTING_TIME) }
            }
            const debates = await DebateData.find(debateQuery);

            if (debates.length > 0) {
                console.log(`${debates.length} debates found, whose voting time need to be expired.`);

                for (let i=0; i<debates.length; i++) {
                    const result = await DebateData.findByIdAndUpdate(debates[i]._id, { $set: { voteTimeExpired: true } });
                    declareWinner(result);
                    console.log(`Voting time has expired for ${debates[i]._id} debate (${debates[i].question})`);
                }
            }
        } catch (err) {
            console.log("IN DEBATE VOTING EXPIRED CRON = Someting went wrong ", err);
        }
    },
    {
        timezone: "Asia/Kolkata"
    });
}