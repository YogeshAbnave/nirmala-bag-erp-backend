var jwt = require("jsonwebtoken");
var UserData = require('../app/models/user.model');
var AdminData = require('../app/models/admin.model');

exports.apiAuthentication = function (req, res, next) {
    console.log(req.headers.authorization,"req.headers.authorization")
    var token = req.headers.authorization || '';
if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
}
    if (token) {
        AdminData.findOne({ "sessionToken": token })
        .then(result => {
            console.log(result,"result")
            if (result) return next();
            else {
                AdminData.findOne({ "sessionToken": token })
                .then(userResult => {
                    console.log(userResult,"userResult")
                    if (userResult) return next();
                    return res.status(401).json({ success: false, status: 401, message: "Token invalid or expired" });
                }).catch(err => {
                    res.status(500).json({ success: false, status: 500, message: err.message })
                });
            }
        }).catch(err => {
            res.status(500).json({ success: false, status: 500, message: err.message })
        });
    } else return res.status(400).json({ success: false, status: 400, message: "Please provide auth token!" });
}
