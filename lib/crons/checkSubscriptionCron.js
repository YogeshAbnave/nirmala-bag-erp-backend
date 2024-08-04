'use strict';

const cron = require('node-cron');
const moment = require('moment');
const UserData = require('../../app/models/user.model');


const updateUserSubscriptionStatus = async (userId, paymentId) => {
    // Update subscription status in user model, when subscription expired.
    await UserData.updateOne({ "_id": userId, 'subscriptions.paymentId': paymentId }, { $set:
        {
            'subscriptions.$.active': false,
            'subscriptions.$.lastCheck': Date.now(),
        }
    });
}

exports.checkSubscriptionCron = () => {

    /* Expire subscription active status of users after end date reached */
    // running every day at 01:00 EDT & 05:00 UTC & 10:30 IST
    cron.schedule('30 10 * * *', async() => {
        try {
            let beforeFiveDays = moment().add(5, 'days').startOf('day');
            beforeFiveDays = moment(beforeFiveDays).endOf('day').toDate();

            const users = await UserData.aggregate([
                {
                    $project: {
                        id: 1,
                        subscriptions: { $slice: [ "$subscriptions", -1 ] }
                    }
                },
                {
                    $lookup: {
                        from: "payments",
                        localField: "subscriptions.paymentId",
                        foreignField: "_id",
                        as: "payment"
                    }
                },
                {
                    $match: { "subscriptions.active": true, "subscriptions.lastCheck": { $lt: beforeFiveDays } } 
                }
            ]);

            if (users.length > 0) {
                for (let i=0; i<users.length; i++) {
                    if (users[i].subscription[0].device.type == "android") {
                        const androidValidation = await iapValidationLib.validatePurchase("android", "checkSubscription",  users[i].payment[0].paymentReceipt.transactionReceipt);
                        if (!androidValidation.success) {
                            // Update user subscription status
                            updateUserSubscriptionStatus(userId, subscription.paymentId._id, true);
                        }
                    } else if (users[i].subscription[0].device.type == "ios") {
                        const iosValidation = await iapValidationLib.validatePurchase("ios", "checkSubscription", users[i].payment[0].paymentReceipt.transactionReceipt);
                        if (!iosValidation.success) {
                            // Update user subscription status
                            updateUserSubscriptionStatus(userId, subscription.paymentId._id);
                        }
                    }
                }
                console.log(`Subscrpition status updated for ${users.length} users`);
            }
        } catch (err) {
            console.log("IN SUBSCRIPTION EXPIRATION CRON = Someting went wrong ", err);
        }
    },
    {
        timezone: "Asia/Kolkata"
    });
}