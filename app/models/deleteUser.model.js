const mongoose = require('mongoose');

const DeletedUserSchema = new mongoose.Schema({
    userInfo:  { type: Object }
}, { timestamps: true });

const DeleteUser = mongoose.model('DeleteUser', DeletedUserSchema);

module.exports = DeleteUser;