'user strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');


//************************** CATEGORY SCHEMA **************************//
var blockemployeeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Emloyees' }
}, { timestamps: true });

//************************** CATEGORY SCHEMA **************************//
var designationSchema = new Schema({
  category: { type: Schema.Types.ObjectId, required: true, ref: 'Designation' }
}, { timestamps: true });

//************************** FOLLOWER SCHEMA **************************//

//************************** USER SCHEMA **************************//
var employeeSchema = new Schema({
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
    contactNo: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    about: { type: String, default: '' },
    profilePic: { type: String, default: 'default.png' },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    block: [blockemployeeSchema],
    designation: [designationSchema],
    sessionToken: { type: String, default: "" },
    status: { type: String, default: "" },
    /* Notifications */ 
    deleted_at: { type: Date, default: null }
}, { timestamps: true });
var EmloyeeModel = mongoose.model('Emloyees', employeeSchema);
employeeSchema.plugin(uniqueValidator, { message: '{PATH} already exists!' });

// Export user model
module.exports = EmloyeeModel;
