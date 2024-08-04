'user strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');


//************************** CATEGORY SCHEMA **************************//
var blockUserSchema = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
}, { timestamps: true });

//************************** CATEGORY SCHEMA **************************//
var categorySchema = new Schema({
  category: { type: Schema.Types.ObjectId, required: true, ref: 'Category' }
}, { timestamps: true });

//************************** FOLLOWER SCHEMA **************************//
var followSchema = new Schema({
  following: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
}, { timestamps: true });

//************************** SUBSCRIPTION SCHEMA **************************//
var subscriptionSchema = new Schema({
  subscription: { type: Schema.Types.ObjectId, required: true, ref: 'Subscription' },
  paymentId: { type: Schema.Types.ObjectId, required: true, ref: 'Payment' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  lastCheck: { type: Date },
  active: { type: Boolean, default: true },
  device: {
    type: { type: String, required: true, trim: true },
    id: { type: String }
  }
}, { timestamps: true });

//************************** USER SCHEMA **************************//
var userSchema = new Schema({
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
    block: [blockUserSchema],
    categories: [categorySchema],
    followings: [followSchema],
    subscriptions: [subscriptionSchema],
    sessionToken: { type: String, default: "" },
    status: { type: String, default: "" },
    /* Notifications */
    deviceToken: { type: String, default: "" },   
    deviceType: { type: String, default: "" }, /* android/ios */
    isNotification: { type: Boolean, default: true },
    deleted_at: { type: Date, default: null }
}, { timestamps: true });
var UserModel = mongoose.model('User', userSchema);
userSchema.plugin(uniqueValidator, { message: '{PATH} already exists!' });

// Export user model
module.exports = UserModel;
