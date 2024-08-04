'user strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

//************************** ADMIN SCHEMA**************************//
var adminSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
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
    profilePic: { type: String, default: '' },
    role: { type: String, required: true, enum : ['Admin']},
    sessionToken: { type: String, default: "" },
    active: { type: Boolean, default: true }
}, { timestamps: true });
var AdminUserModel = mongoose.model('AdminUser', adminSchema);
adminSchema.plugin(uniqueValidator, { message: '{PATH} already exists!' });

// Export models
module.exports = AdminUserModel;
