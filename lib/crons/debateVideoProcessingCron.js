'use strict';

const cron = require('node-cron');
const request = require("request");
const ffmpeg = require('fluent-ffmpeg');
const { DebateData } = require('../../app/models/debate.model');


exports.debateVideoProcessingCron = () => {
    /* Process the videos of those debates whose video.status is not COMPLETE */
    // running in every 1 minute
    cron.schedule(`*/${process.env.DEBATE_VIDEO_PROCESSING_CRON_TIME || 1 } * * * *`, async() => {
        try {
            const inProgress = await DebateData.findOne({ "video.status": "IN_PROCESS" });
            if (!inProgress) {
                const debateQuery = {
                    "video.retryCount": { $lt: 3 },
                    "video.status": { $in: ["IN_QUEUE", "FAILED"] },
                    "creator": { $exists: true },
                    "joiner": { $exists: true },
                    "completedAt": { $exists: true }
                }
                const debate = await DebateData.findOne(debateQuery).sort({"_id": 1});
    
                if (debate) {
                    console.log(`(${debate._id}) debate found, whose video need to be processed.`);
                    
                    // Update the processingStatus to IN_PROCEESS
                    await DebateData.updateOne({ "_id": debate._id }, {
                        $set: {
                            "video.status": "IN_PROCESS"
                        },
                        $inc: {
                            "video.retryCount": 1
                        }
                    });

                    let data = JSON.stringify({
                        "ROOMID": parseInt(debate.roomId)
                    });
                    const options = {
                        "method": "GET",
                        "url": "https://janus.NirmalaBagERPapp.co/processvideo2",
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        body: data
                    };
                    request(options, async function (error, response) {

                        if (!error) {
                            await DebateData.findByIdAndUpdate(debate._id, { $set: { "video.status": "COMPLETE" } });
                            // update the thumbnail in debate, whose video is processed
                            let thumnail_name = "";
                            if (debate.video.url) {
                                thumnail_name = `${Date.now()}-thumb.png`;
                                ffmpeg(debate.video.url).screenshots({
                                count: 1,
                                filename: thumnail_name,
                                folder: './public/generatedThumbnails'
                                })
                                .on('error', function (err) {
                                    console.log('Error:: ' + err.message);
                                });
                            }
                            // Generate thumbnail ends

                            await DebateData.findByIdAndUpdate(debate._id, { $set: { "video.thumbnail": thumnail_name } });
                            console.log(`Video processed for ${debate._id} debate (${debate.question})`);
                        } else {
                            // Update the processingStatus to FAILED
                            await DebateData.updateOne({ "_id": debate._id }, { $set: { "video.status": "FAILED" } });
                            console.log("VIDEO PROCESSING ERROR ", error);
                        }
                    });
                }
            }
        } catch (err) {
            console.log("IN DEBATE VIDEO PROCESSING CRON = Someting went wrong ", err);
        }
    },
    {
        timezone: "Asia/Kolkata"
    });
}