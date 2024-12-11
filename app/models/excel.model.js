const mongoose = require('mongoose');

const XlsxSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    upsert: true
  },
  mobile: {
    type: String
  },
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('XlsxData', XlsxSchema);
