const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  size: { type: String, required: true },
  discussion: { type: String },
  imageUrls: [{ type: String }], // Array for multiple image URLs
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Client', clientSchema);
