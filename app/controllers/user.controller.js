var bcrypt = require('bcrypt-nodejs');
var salt = bcrypt.genSaltSync(10);
var jwt = require("jsonwebtoken");
var uid = require('rand-token').uid;

const fs = require('fs');
const moment = require('moment');
const async = require("async");

var mailSend = require('../../config/sendMail.js');
const iapValidationLib = require('../../lib/in-app-purchase');
var webUserData = require('../models/user.model');
var deletedUser = require('../models/deleteUser.model');
var forgotToken = require('../models/forgotToken.model');
var verifyCode = require('../models/verificationCode.model');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');


// Send verfication code
sendVerficationCode = async (data, callback) => { 
    await verifyCode.updateMany({ user: data.userId }, { $set: { expired: true } });

    var code = Math.floor(1000 + Math.random() * 9000);
    var verify = new verifyCode({
        code: code,
        email: data.email,
        user: data.userId
    });
    verify.save(function(error, response) {
        if (error) {
            console.log(error);
            return { success: false, message: error };
        } else {
            const date = response.createdAt.getTime() + 60 * 5 * 1000; // Add 5 minutes of time				
            schedule.scheduleJob(date, function() {
                verifyCode.findByIdAndUpdate(response._id, { $set: { expired: true } })
                    .then(() => {
                        console.log(`Verification code has expired for ${response._id}.`);
                    }).catch(err => {
                        console.log(err.message);
                    });
            });
            var params = {
                code: code,
                email: data.email,
                username: data.name,
                emailType: "verifyUser",
                path: "config/verifyUser.html"
            }
            mailSend.sendMail(params, function(response) {
                console.log(response);
                if (response.success) {
                    return callback({ success: true, message: response.message });
                } else {
                    return callback({ success: false, message: response.message });
                }
            });
        }
    });
}
const query = [
    {
        path: 'followings',
        populate: {
            path: 'following',
            select: 'firstName lastName profilePic contactNo city state email about dateOfBirth'
        }
    },
    {
        path: 'categories',
        populate: {
            path: 'category',
            select: 'name image'
        }
    },
    {
        path: 'subscriptions',
        populate: {
            path: 'subscription'
        }
    }
];

// Password validation
const re = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

exports.register = (req, res) => {

    let { firstName, lastName, username, email, password, confirmPassword, dateOfBirth, profilePic, deviceToken, deviceType } = req.body;

    if (password !== confirmPassword) {
        res.status(400).send({ success: false, status: 400, message: "Password and Confirm password does not match." });
    } else if (re.test(password)) {
        let userData = new webUserData({
            firstName,
            lastName,
            username,
            email,
            password: bcrypt.hashSync(password, salt),
            dateOfBirth,
            profilePic: profilePic ? profilePic : "default.png",
            deviceToken,
            deviceType
        });
        userData.save().then(result => {
            let params = {
                name: userData.firstName + " " + userData.lastName,
                email: userData.email,
                userId: userData._id
            }
            sendVerficationCode(params, function(response) {
                let result_data = {
                    userId: result._id,
                    email: result.email
                }
                if (response.success) {
                    res.status(200).json({ success: true, status: 200, data: result_data, message: 'User added successfully' });
                } else {
                    res.status(500).json(response);
                }
            });
        }).catch(err => {
            let usernameAlreadyExists = "User validation failed: username: username already exists!";
            let emailAlreadyExists = "User validation failed: email: email already exists!";
            let emailUSernameAlreadyExists = "User validation failed: email: email already exists!, username: username already exists!";
            if (err.message == emailUSernameAlreadyExists) {
                res.status(400).json({ success: false, status: 400, message: "Email and username already exists" });
            } else if (err.message == emailAlreadyExists) {
                res.status(400).json({ success: false, status: 400, message: "Email already exists" });
            } else if (err.message == usernameAlreadyExists) {
                res.status(400).json({ success: false, status: 400, message: "Username already exists" });
            } else res.status(400).json({ success: false, status: 400, message: err.message });
        });
    } else {
        res.status(400).json({ success: false, status: 400, message: "Password should contain atleast 1 number, 1 lowercase, 1 uppercase, 1 special character and must of 8 digits." })
    }
}

exports.resendCode = function(req, res) {
    verifyCode.updateMany({ user: req.body.userId }, { $set: { expired: true } })
        .then(() => {
            console.log("Old verification code has expired.");
        }).catch(err => {
            console.log(err.message);
        });
    webUserData.findOne({ _id: req.body.userId }, function(err, userData) {
        if (userData) {
            let params = {
                name: userData.firstName + " " + userData.lastName,
                email: userData.email,
                userId: userData._id
            }
            sendVerficationCode(params, function(response) {
                if (response.success) {
                    res.status(200).json({ success: true, status: 200, message: 'Verification code resend successfully.' });
                } else {
                    res.status(500).json(response);
                }
            });
        } else {
            res.status(404).json({ success: false, status: 404, message: 'User does not exist' });
        }
    });
}

exports.verify = function(req, res) {

    verifyCode.findOne({ "code": req.body.code, "user": req.body.userId }, function(err, result) {
   
        if (err) {
            res.status(500).send({ success: false, status: 500, message: err.message });
        } else if (result == null) {
            res.status(400).send({ success: false, status: 400, message: 'Invalid Verification Code' });
        } else if (result.expired) {
            res.status(400).send({ success: false, status: 400, message: 'Entered verification code is expired.' });
        } else {
            webUserData.findOneAndUpdate({ "_id": req.body.userId }, { $set: { "isVerified": true } }, function(err, userData) {
                if (err) {
                    res.status(500).send({ success: false, status: 500, message: "Some error occurred during verification of the user." });
                } else {
                    verifyCode.updateMany({ user: req.body.userId }, { $set: { expired: true } }, function(err, response) {});
                    let token = jwt.sign({ username: userData.username }, 'Nirmala-bag-erp');
                    webUserData.updateOne({ "_id": userData._id }, { $set: { "sessionToken": token } })
                    .then(() => {
                        var data = {
                            "success": true,
                            "status": 200,
                            "token": token,
                            "userId": userData._id,
                            "username": userData.username,
                            "email": userData.email,
                            "profilePic": userData.profilePic,
                            "categories": userData.categories,
                            "isNotification": userData.isNotification
                        }
                        return res.status(200).send(data);
                    }).catch(err => {
                        res.status(500).json({ success: false, status: 500, message: err.message })
                    });
                }
            });
        }
    });
}

exports.login = function(req, res) {
    let { email, password, deviceToken } = req.body;
    
    webUserData.findOne({ email: email }, function(err, userData) {
        if (!userData) {
            return res.status(404).send({ success: false, status: 404, message: "User does not exist" });
        } else if (!bcrypt.compareSync(password, userData.password)) {
            return res.status(400).send({ success: false, status: 400, message: "Incorrect password" });
        } else if (!userData.active) {
            res.status(400).send({ success: false, status: 400, message: "Seems, your account is inactivated, please contact Admin at info@NirmalaBagERP.com for more details." });
        } else if (!userData.isVerified) {
            let params = {
                name: userData.firstName + " " + userData.lastName,
                email: userData.email,
                userId: userData._id
            }
            sendVerficationCode(params, function(response) {
                if (response.success) {
                    let userParam = {
                        userId: userData._id,
                        userVerified: false
                    }
                    res.status(400).json({ success: false, data: userParam, message: 'Your account is not yet verified, in order to verify your account please enter the verification code which we have sent to your registered email.' });
                } else {
                    res.status(500).json(response);
                }
            });
        } else {
            let token = jwt.sign({ username: userData.username }, 'Nirmala-bag-erp');
            webUserData.updateOne({ "_id": userData._id }, { $set: { "deviceToken": deviceToken, "sessionToken": token } })
            .then(() => {
                var data = {
                    "success": true,
                    "status": 200,
                    "token": token,
                    "userId": userData._id,
                    "name": userData.firstName + " " + userData.lastName,
                    "username": userData.username,
                    "email": userData.email,
                    "profilePic": userData.profilePic,
                    "categories": userData.categories,
                    "isNotification": userData.isNotification
                }
                return res.status(200).send(data);
            }).catch(err => {
                res.status(500).json({ success: false, status: 500, message: err.message })
            });
        }
    });
}

exports.logout = function(req, res) {
    let { userId } = req.body;
    webUserData.updateOne({ "_id": userId }, { $set: { "deviceToken": "", "sessionToken": "" } })
    .then(() => {
        res.status(200).send({ success: true, status: 200, message: "User logout successfully" });
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
    });
}

//Delete user
exports.deletedUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await webUserData.findOne({ "_id": userId });

        if (user) {
            await webUserData.updateOne(
                { "_id": userId },
                {
                    $set: {
                        status: "Deleted",
                        email: `${user._id}_${user.email}`,
                        username: `${user._id}_${user.username}`,
                        active: false,
                        deleted: true,
                        deleted_at: new Date(),
                        updated_at: new Date()
                    }
                },
                { runValidators: true, context: 'query' }
            );
            res.status(200).json({ success: true, message: 'User deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getById = async(req, res) => {
    let userId = req.params.userId;
    let currentUserId = req.query.currentUserId;    // the user who logged in app

    let user_exists = await webUserData.findOne({ "_id": userId });

    let filter_query = { "_id": userId };
    if (currentUserId && (currentUserId != userId)) {
        filter_query = { "_id": userId, "block.user": { $nin: [currentUserId] } }
    }
    webUserData.findOne(filter_query).populate(query)
    .then(async result => {
        if (!result) {
            if (user_exists) res.status(400).send({ success: false, status: 400, message: "You are not allowed to view this users profile at the moment, please try again later" });
            else res.status(404).send({ success: false, status: 404, message: "User does not exist" });
        } else {
            let users = await webUserData.find({ "active": true, "win": { $gte: 1 } }).sort({ win: -1, loss: 1 }).limit(50);
            let rank = users.findIndex(item => item._id.toString() == userId) + 1;
            var data = {
                _id: result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                dateOfBirth: result.dateOfBirth,
                email: result.email,
                username: result.username,
                contactNo: result.contactNo,
                city: result.city,
                state: result.state,
                about: result.about,
                profilePic: result.profilePic,
                categories: result.categories.filter(item => item.category != null),
                subscriptions: result.subscriptions,
                win: result.win,
                loss: result.loss,
                rank: rank,
                createdAt: result.createdAt
            }

            if (currentUserId && (currentUserId != userId)) {
                let user = await webUserData.findOne({ "_id": currentUserId }).lean();
                if (user.followings.length > 0) {
                    for (var i = 0; i < user.followings.length; i++) {
                        if (user.followings[i].following.toString() == userId) {
                            data['follow'] = true;
                            break;
                        } else data['follow'] = false;
                    }
                } else data['follow'] = false;
            }
            res.status(200).json({ success: true, status: 200, data: data, message: 'User by Id' });
        }
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
    });
}

// Used for global aggregation in this file
const categoryLookup = {
    $lookup: {
        from: 'categories',
        localField: 'categories.category',
        foreignField: '_id',
        as: 'categories'
    },
}
const followingLookup = {
    $lookup: {
        from: 'users',
        localField: 'followings.following',
        foreignField: '_id',
        as: 'followings'
    },
    
}

const project = {
    $project: {
        '_id': 1,
        'firstName': 1,
        'lastName': 1,
        'dateOfBirth': 1,
        'email': 1,
        'username': 1,
        'contactNo': 1,
        'city': 1,
        'state': 1,
        'about': 1,
        'profilePic': 1,
        'win': 1,
        'loss': 1,
        'active': 1,
        'createdAt': 1,
        "isVerified": 1
    },
}

exports.getAll = async (req, res) => {
   
    let { search_query, start, end, platform, userId } = req.body;
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 100;
    let searchQuery = search_query ? search_query.replace(/^\s+/g, '') : "";
    let query;
    if (platform && platform == "admin") query = {};
    else {
        // Blocked Users
        let user = await webUserData.findOne({ "_id": userId });
        let blockedUsers = [];
        if (user && user.block && user.block.length > 0) {
            blockedUsers = user.block.map(item => {
                return ObjectId(item.user);
            });
        }
        blockedUsers.push(ObjectId(userId));
        query = { "_id": { $nin: blockedUsers }, "active": true, "isVerified": true, "block.user": { $nin: [ObjectId(userId)] } };
    }

    if (start && end) {
        query.createdAt = {
            $gte: moment(start).toDate(),
            $lte: moment(end).toDate()
        }
    }

    const searchMatch = {
        $match: {
            $or: [
                {
                    'fullName': {
                        $regex: new RegExp(searchQuery, 'gi')
                    }
                },
                {
                    'username': {
                        $regex: new RegExp(searchQuery, 'gi')
                    }
                },
                {
                    'email': {
                        $regex: new RegExp(searchQuery, 'gi')
                    }
                },
            ]
        }
    };
    

    webUserData.aggregate([
        {
            $match: query
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $addFields: {
                "fullName": { $concat: ["$firstName", " ", "$lastName"] }
            }
        },
        searchMatch,
        // categoryLookup,
        // followingLookup,
        project,
        {
            '$facet': {
                metadata: [{ $count: "total" }, { $addFields: { 'page': page } }],
                data: [{ $skip: (limit * page) - limit }, { $limit: limit }]
            }
        }
    ]).then(async result => {
        if (userId && result[0].data.length > 0) {
            let user = await webUserData.findOne({ "_id": userId });
           
            result[0].data.map(item => {
                return item;
            });
        }
        result[0].data.length > 0 ? result[0].metadata[0].count = result[0].data.length : 0;
        res.status(200).json({ success: true, status: 200, message: 'All Users', metadata: result[0].metadata, data: result[0].data });
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
    });
}

exports.getAllCount = async(req, res) => {
    try {
        let users = await webUserData.countDocuments({"active": true});
        res.status(200).json({ error: false, status: 200, data: users, message: 'All users count' });
    } catch (err) {
        res.status(500).json({ error: true, status: 500, message: err.message });
    }
}

exports.getByCategory = async (req, res) => {
    let page = parseInt(req.body.page, 10) || 1;
    let limit = parseInt(req.body.limit, 10) || 100;
    let { userId, categories } = req.body;
    categories = categories.map(function(el) { return mongoose.Types.ObjectId(el) });

    let query = { "active": true, "isVerified": true };

    webUserData.aggregate([
        {
            $match: query
        },
        {
            $sort: { createdAt: -1 }
        },
        categoryLookup,
        {
            $match: {
                $or: [{
                    'categories._id': {
                        $in: categories
                    }
                }]
            }
        },
        {
            $match: { "_id": { $nin: [ObjectId(userId)] }, "block.user": { $nin: [ObjectId(userId)] }  }
        },
        followingLookup,
        project,
        {
            $project: {
                "active": 0,
                "subscriptions": 0
            }
        },
        {
            '$facet': {
                metadata: [{ $count: "total" }, { $addFields: { 'page': page } }],
                data: [{ $skip: (limit * page) - limit }, { $limit: limit }]
            }
        }
    ]).then(async result => {
        let user = await webUserData.findOne({ "_id": userId });
        result[0].data.map(item => {
            let exists = user.followings.find(element => element.following.toString() == item._id.toString());
            if (exists) item['isFollowed'] = true;
            else item['isFollowed'] = false;
            return item;
        });
        result[0].data.length > 0 ? result[0].metadata[0].count = result[0].data.length : 0;
        res.status(200).json({ success: true, status: 200, message: 'All users by category', metadata: result[0].metadata, data: result[0].data });
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
    });
}

exports.updateProfile = function(req, res) {
    let userId = req.body.userId;
    let userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateOfBirth: req.body.dateOfBirth,
        contactNo: req.body.contact,
        city: req.body.city,
        state: req.body.state,
        about: req.body.about,
        profilePic: req.body.profilePic
    }
    webUserData.updateOne({ _id: userId }, { $set: userData }, function(err, profileData) {
        if (err) {
            res.status(500).json({ success: false, status: 500, message: err.message });
        } else {
            if (req.body.oldProfilePic)
                fs.unlink('./public/uploadedFiles/profile/' + req.body.oldProfilePic, (err) => { console.log(err) });
            res.status(200).json({ success: true, status: 200, message: "Profile updated successfully" });
        }
    });
}

exports.forgotPassword = function(req, res) {
    var userMail = req.body.email;
    webUserData.findOne({ email: userMail }, function(err, userData) {
        if (!userData) {
            res.status(404).send({ success: false, status: 404, message: "User does not exist" });
        } else {
            var token = uid(25);
            var forgotPasswordToken = new forgotToken({
                token: token,
                userMail: userMail,
                userId: userData._id
            });
            forgotPasswordToken.save(function(error, response) {
                if (error) {
                    res.status(500).send({ success: false, status: 500, message: "error while saving forgotToken" });
                } else {
                    var params = {
                        token: token,
                        email: userMail,
                        username: userData.firstName + " " + userData.lastName,
                        host: req.headers.host,
                        emailType: "forgotPassword",
                        path: "config/forgotMail.html",
                        platform: 'mobile'
                    }
                    mailSend.sendMail(params, function(response) {
                        if (response.success) {
                            res.status(200).send({ success: true, status: 200, message: response.message });
                        } else {
                            res.status(500).send({ success: false, status: 500, message: response.message });
                        }
                    });
                }
            });
        }
    });
}

exports.checkResetPasswordToken = function(req, res) {
    forgotToken.findOne({ token: req.body.token, expired: false }, function(err, token) {
        if (err) {
            res.status(500).send({ success: false, status: 500, message: "Error, While validating token" });
        } else {
            if (result) {
                let result_data = {
                    userId: result.userId,
                    email: result.userMail
                }
                res.status(200).send({ success: true, status: 200, data: result_data, message: "Token is valid yet" });
            } else {
                res.status(400).send({ success: false, status: 400, message: "Token expired or invalid" });
            }
        }
    })
}

exports.resetPassword = function(req, res) {
    forgotToken.findOne({ token: req.body.token, expired: false }, function(err, userData) {
        if (userData == null) {
            res.status(400).send({ success: false, status: 400, message: "Token expired or invalid" })
        } else if (userData.userId == req.body.userId) {
            webUserData.findOneAndUpdate({ _id: req.body.userId }, { $set: { password: bcrypt.hashSync(req.body.password, salt) } }, function(err, response) {
                if (err) {
                    res.status(500).send({ success: false, status: 500, message: "Some Error while resetting password" });
                } else {
                    forgotToken.updateMany({ userId: req.body.userId }, { $set: { expired: true, updated_at: new Date() } }, function(err, response) {});
                    res.status(200).send({ success: true, status: 200, message: "Password updated successfully" });
                }
            });
        } else {
            res.status(500).send({ success: false, status: 500, message: err })
        }
    });
}

exports.changePassword = (req, res) => {
    webUserData.findOne({ _id: req.body.userId }).then(newUser => {
        bcrypt.compare(req.body.currentPassword, newUser.password, (err, isMatched) => {
            if (!isMatched) return res.status(400).json({ success: false, message: "Old password is incorrect" });
            else if (re.test(req.body.password)) {
                let passwordHash = bcrypt.hashSync(req.body.password, salt);
                webUserData.updateOne({ _id: req.body.userId }, { $set: { password: passwordHash } })
                    .then(() => {
                        return res.status(200).json({ success: true, status: 200, message: 'Congratulations : Your password changed successfully' });
                    }).catch(err => {
                        res.status(500).json({ success: false, status: 500, message: err.message });
                    });
            } else {
                res.status(400).json({ success: false, status: 400, message: "Password should contain atleast 1 number, 1 lowercase, 1 uppercase, 1 special character and must of 8 digits." })
            }
        });
    }).catch(err => {
        return res.status(500).json({ success: false, status: 500, message: err })
    });
}

exports.block = (req, res) => {
    let { userId, blockingUserId } = req.body;
    webUserData.findOne({
            $or: [
                { "_id": userId, "followings.following": blockingUserId },
                { "_id": blockingUserId, "followings.following": userId }
            ],
            "active": true
        })
        .then(async result => {
            if (result) {
                webUserData.findOne({ "_id": userId, "block.user": { $nin: [blockingUserId] } })
                .then((result) => {
                    if (result) {
                        webUserData.updateOne({ "_id": userId }, { $addToSet: { "block": { "user": blockingUserId } } })
                        .then(() => {
                            async.parallel([
                                function(callback) {
                                    webUserData.updateOne({ "_id": userId }, { $pull: { "followings": { "following": blockingUserId } } })
                                    .then(() => {
                                        callback();
                                    }).catch(err => {
                                        res.status(500).json({ success: false, status: 500, message: err.message });
                                    });
                                },
                                function(callback) {
                                    webUserData.updateOne({ "_id": blockingUserId }, { $pull: { "followings": { "following": userId } } })
                                    .then(() => {
                                        callback();
                                    }).catch(err => {
                                        res.status(500).json({ success: false, status: 500, message: err.message });
                                    });
                                }
                            ], function(err, data) {
                                if (err) res.status(500).json({ success: false, status: 500, message: err.message });
                                else res.status(200).json({ success: true, status: 200, message: 'User blocked successfully' });
                            });
                        }).catch(err => {
                            res.status(500).json({ success: false, status: 500, message: err.message });
                        });
                    } else res.status(400).json({ success: true, status: 400, message: 'You have already blocked this user' });
                });
            } else res.status(400).json({ success: true, status: 400, message: 'Please follow this user first' });
        }).catch(err => {
            res.status(400).json({ success: false, status: 400, message: err.message });
        });
}

exports.getAllBlocked = (req, res) => {
    let { userId } = req.body;
    webUserData.aggregate([{
            $match: { "_id": ObjectId(userId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "block.user",
                foreignField: "_id",
                as: "blockedUsers"
            }
        },
        {
            $unwind: "$blockedUsers"
        },
        {
            $project: {
                "_id": "$blockedUsers._id",
                "firstName": "$blockedUsers.firstName",
                "lastName": "$blockedUsers.lastName",
                "email": "$blockedUsers.email",
                "username": "$blockedUsers.username",
                "profilePic": "$blockedUsers.profilePic"
            }
        }
    ]).then(result => {
        res.status(200).json({ success: true, status: 200, message: 'All blocked users', data: result });
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
    });
}

exports.unblock = (req, res) => {
    let { userId, unBlockingUserId } = req.body;
    webUserData.findOne({ "_id": userId, "block.user": { $in: [unBlockingUserId] } })
    .then(result => {
        if (result) {
            webUserData.updateOne({ "_id": userId }, { $pull: { "block": { "user": unBlockingUserId } } })
                .then(() => {
                    res.status(200).json({ success: true, status: 200, message: 'User unblocked successfully' });
                }).catch(err => {
                    res.status(500).json({ success: false, status: 500, message: err.message });
                });
        } else res.status(400).json({ success: true, status: 400, message: 'Please block the user first' });
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message });
    });
}

exports.showNotification = (req, res) => {
    let userId = req.params.userId;
    webUserData.updateOne({ "_id": userId }, { $set: { "isNotification": true } })
    .then(() => {
        res.status(200).json({ success: true, status: 200, message: 'Notification set to show successfully' })
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
    });
}
exports.hideNotification = (req, res) => {
    let userId = req.params.userId;
    webUserData.updateOne({ "_id": userId }, { $set: { "isNotification": false } })
    .then(() => {
        res.status(200).json({ success: true, status: 200, message: 'Notification set to hide successfully' })
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
    });
}

// Activate & Deactivate by admin
exports.deactivate = (req, res) => {
    let userId = req.params.userId;
    webUserData.findOne({ "_id": userId })
    .then(result => {
        if (result.subscriptions.length > 0) {
            res.status(400).json({ success: false, status: 400, message: 'You cannot deactivate this user, because this user has active subscription.' })
        } else {
            webUserData.updateOne({ "_id": userId }, { $set: { "active": false } })
            .then(() => {
                res.status(200).json({ success: true, status: 200, message: 'User deactivated successfully' })
            }).catch(err => {
                res.status(500).json({ success: false, status: 500, message: err.message })
            });
        }
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
    });
}

exports.activate = (req, res) => {
    let userId = req.params.userId;
    webUserData.updateOne({ "_id": userId }, { $set: { "active": true } })
    .then(() => {
        res.status(200).json({ success: true, status: 200, message: 'User activated successfully' })
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
    });
}