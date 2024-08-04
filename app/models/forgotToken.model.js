var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
// create a schema
var forgotPasswordToken = new Schema({
  token: {type:String,required:true},
  userMail : {type:String,required:true},
  created_at : {type:Date,default:new Date(),required:true},
  updated_at : {type:Date,default:new Date(),required:true},
  expired_at : {type:Date,default:new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),required:true},
  deleted_at : {type:Date,default:null},
  status      : {type:String,default:"Active",required:true},
  expired    : {type:Boolean,default:false,required:true},
  userId : {type:ObjectId,required:true}
});


var forgotPasswordToken = mongoose.model('forgotPasswordToken', forgotPasswordToken);

// make this available to our users in our Node applications
module.exports = forgotPasswordToken;
