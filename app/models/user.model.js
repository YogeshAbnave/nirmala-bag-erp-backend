'user strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//************************** USER SCHEMA **************************//
var userSchema = new Schema({
    _id: { type: String},
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    dateOfBirth: { type: Date, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      match: [
            /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
            'Your email is not valid'
        ]
    },
    password: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true },
    contactNo: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    about: { type: String, default: '' },
    profilePic: { type: String, default: 'default.png' },
    win: { type: Number, default: 0 },
    loss: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    sessionToken: { type: String, default: "" },
    status: { type: String, default: "" },
    /* Notifications */
    deviceToken: { type: String, default: "" },   
    deviceType: { type: String, default: "" }, /* android/ios */
    isNotification: { type: Boolean, default: true },
    deleted_at: { type: Date, default: null }
}, { timestamps: true });
var UserModel = mongoose.model('User', userSchema);

// Export user model
module.exports = UserModel;
