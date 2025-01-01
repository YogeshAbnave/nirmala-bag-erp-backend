const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: 0
    },
    images: [{
        type: String,
        required: [true, 'Product images are required']
    }],
    category: {
        type: String,
        required: [true, 'Product category is required'],
        trim: true
    },
    subCategory: {
        type: String,
        trim: true
    },
    size: {
        type: [String],
        trim: true
    },
    bestseller: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    sellingPrice: {
        type: String,
        min: 0
    },
    date:{type:Number, require:true}
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Export the model
module.exports = Product;
