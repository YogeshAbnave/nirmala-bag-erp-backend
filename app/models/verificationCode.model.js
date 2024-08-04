'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//************************** VERIFY CODE SCHEMA **************************//
var verifyCodeSchema = new Schema({
    code: { type: Number, required: true },
    email: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    expired: { type: Boolean, default: false },
}, { timestamps: true });
// Export verify code model
var VerifyCodeModel = mongoose.model('VerifyCode', verifyCodeSchema);
module.exports = VerifyCodeModel;
