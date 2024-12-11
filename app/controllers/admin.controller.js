var bcrypt = require('bcrypt-nodejs');
var salt = bcrypt.genSaltSync(10);
var jwt = require("jsonwebtoken");
var uid = require('rand-token').uid;

const fs = require('fs');

var mailSend = require('../../config/sendMail.js');
var AdminUserData = require('../models/admin.model');
var forgotToken = require('../models/forgotToken.model');


exports.login = function (req, res) {
	console.log("req",req.body)
    AdminUserData.findOne({ email: req.body.email }, function (err, userData) {
        if (err) {
            return res.status(500).json({ success: false, status: 500, message: "Database error" });
        }
        if (!userData) {
            return res.status(400).json({ success: false, status: 400, message: "Incorrect email address" });
        }
        bcrypt.compare(req.body.password, userData.password, function (bcryptErr, result) {
            if (bcryptErr) {
                return res.status(500).json({ success: false, status: 500, message: "Error during password comparison" });
            }
            if (!result) {
                return res.status(400).json({ success: false, status: 400, message: "Incorrect password" });
            }
            if (!userData.active) {
                return res.status(400).json({ success: false, status: 400, message: "Seems, your account is inactivated." });
            }
            if (userData.role !== "Admin") {
                return res.status(400).json({ success: false, status: 400, message: "User not allowed" });
            }
            let token = jwt.sign({ username: userData.username }, 'RESTFULAPIs');
            AdminUserData.updateOne({ "_id": userData._id }, { $set: { "sessionToken": token } })
                .then(() => {
				
                    var data = {
                        "success": true,
                        "status": 200,
                        "token": userData.sessionToken,
                        "userId": userData._id,
                        "email": userData.email,
						"name": userData.firstName + " " + userData.lastName,
                        "profilePic": userData.profilePic
                    }
                    return res.status(200).json(data);
                }).catch(updateErr => {
                    res.status(500).json({ success: false, status: 500, message: "Error updating session token" });
                });
        });
    });
};

exports.logout = function (req, res) {
	res.status(200).send({ success: true, status: 200, message: "Admin User Logout" });
}

exports.getAdminById = function (req, res) {
	var userId = req.params.userId;
	AdminUserData.findOne({ _id: userId }, function (err, userData) {
		if (err || !userData) {
			res.status(404).send({ success: false, status: 404, message: "Admin does not exist" });
		} else {
			var data = {
				firstName: userData.firstName,
		    	lastName: userData.lastName,
		    	email: userData.email,
		    	profilePic: userData.profilePic,
				createdAt: userData.createdAt
			}
			res.status(200).json({ success: true, status: 200, data: data, message: 'User by Id' });
		}
	});
}

exports.addAdmin = (req, res) => {
	const re = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
	if (re.test(req.body.password) || req.body.password) {
		let adminUserData = new AdminUserData({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: bcrypt.hashSync(req.body.password, salt),
			profilePic: req.body.profilePic,
			role: "Admin"
		});
		adminUserData.save().then(createdUser => {
			res.status(200).json({ success: true, status: 200, data: createdUser, message: "Admin added successfully" });
		}).catch(err => {
			res.status(400).json({ success: false, status: 400, message: err.message })
		})
	} else {
		res.status(400).json({ success: false, status: 400, message: "Password should contain atleast 1 number, 1 lowercase, 1 uppercase, 1 special character and must of 8 digits." })
	}
}

exports.updateProfile = function (req, res) {
	let userId = req.body.userId;
	let userData = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		profilePic: req.body.profilePic
	}
	AdminUserData.updateOne({ _id: userId }, { $set: userData }, function (err, profileData) {
		if (err) {
			res.status(500).json({ success: false, status: 500, message: err.message });
		} else {
			if (req.body.oldProfilePic)
				fs.unlink('./public/uploadedFiles/profile/' + req.body.oldProfilePic, (err) => { console.log(err) });
			res.status(200).json({ success: true, status: 200, message: "Profile updated successfully." });
		}
	});
}

exports.forgotPassword = function (req, res) {
	var userMail = req.body.email;
	AdminUserData.findOne({ email: userMail }, function (err, userData) {
		if (!userData) {
			res.status(404).send({ success: false, status: 404, message: "Email Address does not exist in our system" });
		} else {
			var token = uid(25);
			var forgotPasswordToken = new forgotToken({
				token: token,
				userMail: userMail,
				userId: userData._id
			});
			forgotPasswordToken.save(function (error, response) {
				if (error) {
					res.status(500).send({ success: false, status: 500, message: "error while saving forgotToken" });
				} else {
					var params = {
						token: token,
						email: userMail,
						// email: 'sachin.kumar@otssolutions.com',
						username: userData.firstName + " " + userData.lastName,
						origin: req.headers.origin,
						emailType: "forgotPassword",
						path: "config/forgotMail.html",
						platform: 'web'
					}
					mailSend.sendMail(params, function (response) {
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

exports.checkResetPasswordToken = function (req, res) {
	forgotToken.findOne({ token: req.body.token, expired: false }, function (err, result) {
		if (err) {
			res.status(400).send({ success: false, status: 400, message: "Error while validating token" });
		} else {
			if (result) {
				let result_data = {
					userId: result.userId,
					email: result.userMail
				}
				res.status(200).send({ success: true, status: 200, data: result_data, message: "Token is valid yet." });
			} else {
				res.status(400).send({ success: false, status: 400, message: "Token Expired or Invalid" });
			}
		}
	})
}

exports.resetPassword = function (req, res) {
	forgotToken.findOne({ token: req.body.token }, function (err, userData) {
		if (userData == null) {
			res.status(400).send({ success: false, status: 400, message: 'Invalid Token' })
		}
		else if (userData.userId == req.body.userId) {
			AdminUserData.findOneAndUpdate({ _id: req.body.userId }, { $set: { password: bcrypt.hashSync(req.body.password, salt) } }, function (err, response) {
				if (err) {
					res.status(500).send({ success: false, status: 500, message: "Some Error while resetting password" });
				} else {
					forgotToken.findOneAndUpdate({ userId: req.body.userId, token: req.body.token }, { $set: { expired: true, updated_at: new Date() } }, function (err, response) {
					});
					res.status(200).send({ success: true, status: 200, message: 'Password updated successfully' });
				}
			});
		} else {
			res.status(500).send({ success: false, status: 500, message: err })
		}
	});
}

exports.changePassword = (req, res) => {
	AdminUserData.findOne({ _id: req.body.userId }).then(newUser => {
		bcrypt.compare(req.body.currentPassword, newUser.password, (err, isMatched) => {
			if (!isMatched) return res.status(400).json({ success: false, status: 400, message: "Current Password is incorrect" });
			let passwordHash = bcrypt.hashSync(req.body.password, salt);
			AdminUserData.updateOne({ _id: req.body.userId }, { $set: { password: passwordHash } })
				.then(() => {
					return res.status(200).json({ success: true, status: 200, message: 'Congratulations : Your password changed successfully' });
				}).catch(err => {
					res.status(500).json({ success: false, status: 500, message: err.message });
				})
		})
	}).catch(err => {
		return res.status(500).json({ success: false, status: 500, message: err })
	});
}
