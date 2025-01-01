const mongoose = require('mongoose');

// Define the User schema
const webUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String
    },
    categories: {
        type: [String], // Array of strings for user categories
        default: []
    },
    cartData: {
        type: Object,
        default: {}, // Default is an empty object
    },
}, { timestamps: true });

// Create the User model
const webUserModel = mongoose.model('WebUser', webUserSchema);

// Export the model
module.exports = webUserModel;
