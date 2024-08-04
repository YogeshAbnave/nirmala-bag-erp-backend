'user strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');


//************************** USER SCHEMA **************************//
var clientSchema = new Schema({
    fullName: { type: String, required: true, trim: true },
    organizationName: { type: String, trim: true },
    registrationDate: { type: Date, required: true },
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
    secondContactNo: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    description: { type: String, default: '' },
    clientPic: { type: String, default: 'default.png' },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    isConverted: { type: Boolean, default: false },
    sessionToken: { type: String, default: "" },
    status: { type: String, default: "" },
    deleted_at: { type: Date, default: null }
}, { timestamps: true });
var ClientModel = mongoose.model('Client', clientSchema);
clientSchema.plugin(uniqueValidator, { message: '{PATH} already exists!' });

// Export user model
module.exports = ClientModel;
