var bcrypt = require('bcrypt-nodejs');
var salt = bcrypt.genSaltSync(10);
var jwt = require("jsonwebtoken");
const fs = require('fs');
const moment = require('moment');
const async = require("async");
var ClientData = require('../models/client.model');
var deletedUser = require('../models/deleteUser.model');
var forgotToken = require('../models/forgotToken.model');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');


// Send verfication code

const query = [
    {
        path: 'followings',
        populate: {
            path: 'following',
            select: 'firstName lastName clientPic contactNo city state email about dateOfBirth'
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

    let { fullName, organizationName, registrationDate, email, contactNo, secondContactNo, city, state, description, clientPic, active, deleted, isConverted, sessionToken, status, deleted_at} = req.body;

    let userData = new ClientData({
        fullName, 
        organizationName, 
        registrationDate, 
        email, 
        contactNo, 
        secondContactNo, 
        city, 
        state, 
        description, 
        clientPic, 
        active, 
        deleted, 
        isConverted, 
        sessionToken, 
        status, 
        deleted_at,
        clientPic: clientPic ? clientPic : "default.png"
    });
    userData.save().then(result => {
       

        if (result) {
            res.status(200).json({ success: true, status: 200, data: result, message: 'Client added successfully' });
        } else {
            res.status(500).json({"error":"Error occured while registring client."});
        }
    }).catch(err => {
        let usernameAlreadyExists = "Client validation failed: clientname: clientname already exists!";
        let emailAlreadyExists = "Client validation failed: email: email already exists!";
        let emailUSernameAlreadyExists = "Client validation failed: email: email already exists!, clientname: clientname already exists!";
        if (err.message == emailUSernameAlreadyExists) {
            res.status(400).json({ success: false, status: 400, message: "Email and clientname already exists" });
        } else if (err.message == emailAlreadyExists) {
            res.status(400).json({ success: false, status: 400, message: "Email already exists" });
        } else if (err.message == usernameAlreadyExists) {
            res.status(400).json({ success: false, status: 400, message: "Username already exists" });
        } else res.status(400).json({ success: false, status: 400, message: err.message });
    });
}

//Delete user
exports.delete = (req, res) => {
    const { clientId } = req.body;

    // Ensure clientId is provided
    if (!clientId) {
        return res.status(400).json({ success: false, status: 400, message: 'clientId is required' });
    }

    // Find the client to be deleted
    ClientData.findOne({ "_id": clientId, "active": true })
        .then(result => {
            if (!result) {
                return res.status(400).json({ success: false, status: 400, message: 'Client not found or already inactive' });
            }

            // Proceed to delete the client
            async.parallel([
                function (callback) {
                    ClientData.deleteOne({ "_id": clientId })
                        .then(() => callback())
                        .catch(err => callback(err));
                }
            ], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, status: 500, message: err.message });
                }

                res.status(200).json({ success: true, status: 200, message: 'Client deleted successfully' });
            });
        })
        .catch(err => {
            res.status(500).json({ success: false, status: 500, message: err.message });
        });
};

exports.getById = async(req, res) => {
    let userId = req.params.userId;
    let currentUserId = req.query.currentUserId;    // the user who logged in app

    let user_exists = await ClientData.findOne({ "_id": userId });

    let filter_query = { "_id": userId };
    if (currentUserId && (currentUserId != userId)) {
        filter_query = { "_id": userId, "block.user": { $nin: [currentUserId] } }
    }
    ClientData.findOne(filter_query).populate(query)
    .then(async result => {
        if (!result) {
            if (user_exists) res.status(400).send({ success: false, status: 400, message: "You are not allowed to view this users profile at the moment, please try again later" });
            else res.status(404).send({ success: false, status: 404, message: "Client does not exist" });
        } else {
            let users = await ClientData.find({ "active": true, "win": { $gte: 1 } }).sort({ win: -1, loss: 1 }).limit(50);
            let rank = users.findIndex(item => item._id.toString() == userId) + 1;
            var data = {
                _id: result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                dateOfBirth: result.dateOfBirth,
                email: result.email,
                clientname: result.clientname,
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
                let user = await ClientData.findOne({ "_id": currentUserId }).lean();
                if (user.followings.length > 0) {
                    for (var i = 0; i < user.followings.length; i++) {
                        if (user.followings[i].following.toString() == userId) {
                            data['follow'] = true;
                            break;
                        } else data['follow'] = false;
                    }
                } else data['follow'] = false;
            }
            res.status(200).json({ success: true, status: 200, data: data, message: 'Client by Id' });
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
        'fullName': 1,
        'organizationName': 1,
        'registrationDate': 1,
        'email': 1,
        'contactNo': 1,
        'city': 1,
        'state': 1,
        'secondContactNo': 1,
        'clientPic': 1,
        'description': 1,
        'deleted': 1,
        'active': 1,
        'status': 1,
        'deleted_at': 1,
        'isConverted': 1,
        "sessionToken": 1
    },
}

exports.getAll = async (req, res) => {
   
    let { search_query, start, end } = req.body;
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 100;
    let searchQuery = search_query ? search_query.replace(/^\s+/g, '') : "";
    let query = {};
   

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
                    'clientname': {
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
    

    ClientData.aggregate([
        {
            $match: query
        },
        {
            $sort: { createdAt: -1 }
        },
        searchMatch,
        project,
        {
            '$facet': {
                metadata: [{ $count: "total" }, { $addFields: { 'page': page } }],
                data: [{ $skip: (limit * page) - limit }, { $limit: limit }]
            }
        }
    ]).then(async result => {
        if (result[0].data.length > 0) {
            let user = await ClientData.findOne({});
           
            result[0].data.map(item => {
                return item;
            });
        }
        result[0].data.length > 0 ? result[0].metadata[0].count = result[0].data.length : 0;
        res.status(200).json({ success: true, status: 200, message: 'All Client', metadata: result[0].metadata, data: result[0].data });
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
    });
}

exports.getAllCount = async(req, res) => {
    try {
        let users = await ClientData.countDocuments({"active": true});
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

    ClientData.aggregate([
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
        let user = await ClientData.findOne({ "_id": userId });
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
    ClientData.updateOne({ _id: userId }, { $set: userData }, function(err, profileData) {
        if (err) {
            res.status(500).json({ success: false, status: 500, message: err.message });
        } else {
            if (req.body.oldProfilePic)
                fs.unlink('./public/uploadedFiles/profile/' + req.body.oldProfilePic, (err) => { console.log(err) });
            res.status(200).json({ success: true, status: 200, message: "Profile updated successfully" });
        }
    });
}




// Add Client Category
exports.addUserCategory = function(req, res) {
    var data = [];
    for (var i = 0; i < req.body.category.length; i++) {
        data.push({
            category: req.body.category[i]
        })
    }
    ClientData.findByIdAndUpdate(req.body.userId, { $set: { categories: [] } })
        .then(() => {
            ClientData.findByIdAndUpdate(req.body.userId, {
                $push: {
                    categories: {
                        $each: data
                    }
                }
            }).then(() => {
                res.status(200).json({ success: true, status: 200, message: 'Client category added successfully' });
            }).catch(err => {
                res.status(400).json({ success: false, status: 400, message: err.message });
            });
        }).catch(err => {
            res.status(500).json({ success: false, status: 500, message: err.message });
        });
}


exports.block = (req, res) => {
    const { clientId } = req.body;

    // Ensure blockingUserId is provided
    if (!clientId) {
        return res.status(400).json({ success: false, status: 400, message: 'clientId is required' });
    }

    // Find the blocking user who must be active
    ClientData.findOne({ "_id": clientId})
        .then(result => {
            if (!result) {
                return res.status(400).json({ success: false, status: 400, message: 'User not found or inactive' });
            }

            // Proceed to block the user and update followings
            async.parallel([
                function (callback) {
                    ClientData.updateOne(
                        { "_id": clientId },
                        { "status":"inactive" }
                    ).then(() => callback())
                     .catch(err => callback(err));
                },
                function (callback) {
                    ClientData.updateOne(
                        { "_id": clientId },
                        { "status":"inactive" }
                    ).then(() => callback())
                     .catch(err => callback(err));
                },
                function (callback) {
                    ClientData.updateOne(
                        { "_id": clientId },
                        { "status":"inactive" }
                    ).then(() => callback())
                     .catch(err => callback(err));
                }
            ], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, status: 500, message: err.message });
                }

                res.status(200).json({ success: true, status: 200, message: 'Client blocked successfully' });
            });
        })
        .catch(err => {
            res.status(500).json({ success: false, status: 500, message: err.message });
        });
};

exports.getAllBlocked = (req, res) => {
    let { userId } = req.body;
    ClientData.aggregate([{
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
                "clientname": "$blockedUsers.clientname",
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
    const { clientId } = req.body;

    // Ensure blockingUserId is provided
    if (!clientId) {
        return res.status(400).json({ success: false, status: 400, message: 'clientId is required' });
    }

    // Find the blocking user who must be inactive
    ClientData.findOne({ "_id": clientId })
        .then(result => {
            if (!result) {
                return res.status(400).json({ success: false, status: 400, message: 'User not found or already active' });
            }

            // Proceed to unblock the user and update followings
            async.parallel([
                function (callback) {
                    ClientData.updateOne(
                        { "_id": clientId },
                        { "status": "active" }
                    ).then(() => callback())
                     .catch(err => callback(err));
                },
                function (callback) {
                    ClientData.updateOne(
                        { "_id": clientId },
                        { "status": "active" }
                    ).then(() => callback())
                     .catch(err => callback(err));
                },
                function (callback) {
                    ClientData.updateOne(
                        { "_id": clientId },
                        { "status": "active" }
                    ).then(() => callback())
                     .catch(err => callback(err));
                }
            ], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, status: 500, message: err.message });
                }

                res.status(200).json({ success: true, status: 200, message: 'Client unblocked successfully' });
            });
        })
        .catch(err => {
            res.status(500).json({ success: false, status: 500, message: err.message });
        });
};

// Activate & Deactivate by admin
exports.isConverted = (req, res) => {
    let clientId = req.body.clientId;
    ClientData.findOne({ "_id": clientId })
    .then(result => {
        if (result && result.isConverted) {
            res.status(400).json({ success: false, status: 400, message: 'You cannot convert this user, because this user is already converted.' });
        } else {
            ClientData.updateOne({ "_id": clientId }, { $set: { "isConverted": true } })
            .then(() => {
                res.status(200).json({ success: true, status: 200, message: 'Client is converted successfully' });
            }).catch(err => {
                res.status(500).json({ success: false, status: 500, message: err.message });
            });
        }
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message });
    });
};

exports.isNotConverted = (req, res) => {
    let clientId = req.body.clientId;
    ClientData.updateOne({ "_id": clientId }, { $set: { "isConverted": false } })
    .then(() => {
        res.status(200).json({ success: true, status: 200, message: 'Client is not converted successfully' });
    }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message });
    });
};