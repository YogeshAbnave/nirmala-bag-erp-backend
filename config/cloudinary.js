require('dotenv').config(); // Load environment variables from .env file
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dimp8gzvu", // Use environment variable or fallback value
    api_key: process.env.CLOUDINARY_API_KEY || "453948499698794", // Use environment variable or fallback value
    api_secret: process.env.CLOUDINARY_API_SECRET || "4gB1IFaO-cYsRWbKgNVeVZXJrho", // Use environment variable or fallback value
    secure: true // Enforce HTTPS
});

// Export the configured instance for reuse
module.exports = cloudinary;