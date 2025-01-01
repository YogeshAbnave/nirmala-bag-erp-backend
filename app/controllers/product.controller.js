const Product = require('../models/product.model'); 
const cloudinary = require('../../config/cloudinary');
const fs = require('fs').promises;

exports.addProduct = async (req, res) => {
    try {
        // Validate and extract product data
        const { name, description, price, category, subCategory, size, bestseller } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Please upload at least one image.'
            });
        }

        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Please provide name, price, and category.'
            });
        }

        // Upload images to Cloudinary
        const imageUrls = [];
        for (const file of req.files) {
            try {
                console.log('Attempting to upload file:', file.path);
                
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'products',
                    resource_type: 'auto',
                    timeout: 120000,
                })
                imageUrls.push(result.secure_url);

                // Clean up local file
                await fs.unlink(file.path);
            } catch (error) {
                console.error('Cloudinary upload error:', error);
                throw new Error('Image upload failed');
            }
        }

        // Create new product
        const newProduct = new Product({
            name,
            description,
            price: Number(price),
            images: imageUrls,
            category,
            subCategory,
            size,
            bestseller: bestseller === 'true' ? "true" : "false",
            date:Date.now()
        });

        // Save product
        const savedProduct = await newProduct.save();

        return res.status(201).json({
            success: true,
            status: 201,
            data: savedProduct,
            message: 'Product added successfully'
        });

    } catch (error) {
        console.error('Error in addProduct:', error);

        // Clean up any remaining files
        if (req.files) {
            for (const file of req.files) {
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
            }
        }

        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message || 'An error occurred while adding the product.'
        });
    }
};
// Get Single Product
exports.singleProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Product not found.',
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            data: product,
            message: 'Product retrieved successfully',
        });
    } catch (err) {
        console.error('Error fetching product:', err);
        return res.status(500).json({
            success: false,
            status: 500,
            message: 'An unexpected error occurred.',
        });
    }
};


// Remove Product
exports.removeProduct = async (req, res) => {
    try {
        const { productId } = req.params;
console.log("productId",productId)
        // Find and delete the product by ID
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Product not found.',
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: 'Product removed successfully',
        });
    } catch (err) {
        console.error('Error removing product:', err);
        return res.status(500).json({
            success: false,
            status: 500,
            message: 'An unexpected error occurred.',
        });
    }
};

// List all Products
exports.listProduct = async (req, res) => {
    try {
        const products = await Product.find();

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'No products found.',
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            data: products,
            message: 'Products retrieved successfully',
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({
            success: false,
            status: 500,
            message: 'An unexpected error occurred.',
        });
    }
};
