const bcrypt = require('bcrypt');
var jwt = require("jsonwebtoken");
var webUserModel = require('../models/webUser.model.js');
const mongoose = require('mongoose');


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
const JWT_SECRET = 'Nirmala-bag-erp';


exports.register = async (req, res) => {
    try {
        console.log("Register API called with data:", {
            ...req.body,
            password: req.body.password ? '********' : undefined
        });

        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            console.log("Missing required fields:", {
                name: !!name,
                email: !!email,
                password: !!password
            });
            return res.status(400).json({
                success: false,
                status: 400,
                message: "All fields (name, email, and password) are required."
            });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            console.log("Invalid email format:", email);
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Please provide a valid email address."
            });
        }

        // Validate password format
        if (!passwordRegex.test(password)) {
            console.log("Invalid password format");
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters."
            });
        }

        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            console.error("MongoDB not connected. Connection state:", mongoose.connection.readyState);
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Database connection error"
            });
        }

        // Check for existing user
        const existingUser = await webUserModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log("User already exists:", email);
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Email is already registered."
            });
        }

        // Hash password
        console.log("Generating salt and hashing password...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("Password hashed successfully:", hashedPassword);

        // Generate JWT token
        console.log("Generating JWT token...");
        const token = jwt.sign(
            { email: email.toLowerCase() },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Create user object
        const userData = new webUserModel({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            token: token
        });

        // Save user to database with explicit error handling
        console.log("Attempting to save user to database...");
        let savedUser;
        try {
            savedUser = await userData.save();
        } catch (saveError) {
            console.error("Error saving user:", saveError);
            if (saveError.code === 11000) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: "Email is already registered."
                });
            }
            throw saveError;
        }

        console.log("User successfully saved:", {
            id: savedUser._id,
            email: savedUser.email
        });

        // Send success response
        return res.status(200).json({
            success: true,
            status: 200,
            data: {
                email: savedUser.email,
                name: savedUser.name,
                token: savedUser.token
            }, 
            message: "Registration successful"
        });

    } catch (error) {
        console.error("Detailed error in register API:", {
            message: error.message,
            stack: error.stack,
            code: error.code,
            name: error.name
        });

        // Handle specific error types
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Validation error: " + Object.values(error.errors).map(err => err.message).join(', ')
            });
        }

        // Handle MongoDB errors
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Database error occurred"
            });
        }

        return res.status(500).json({
            success: false,
            status: 500,
            message: "Registration failed. Please try again later."
        });
    }
};
    


exports.login = async function(req, res) {
    const { email, password } = req.body;
    
    try {
        // Find user by email
        const userData = await webUserModel.findOne({ email });

        if (!userData) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: "User does not exist",
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: "Incorrect password",
            });
        }

        // // Check if account is active
        // if (!userData.active) {
        //     return res.status(400).send({
        //         success: false,
        //         status: 400,
        //         message: "Your account is inactivated, please contact Admin for more details.",
        //     });
        // }

        // // Check if account is verified
        // if (!userData.isVerified) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Your account is not verified. Please check your email for the verification code.',
        //     });
        // }   

        // Create JWT token
        const token = jwt.sign({ userId: userData._id }, 'RESTFULAPIs', { expiresIn: '1h' });

        // Update device token and session token
        await webUserModel.updateOne({ _id: userData._id }, { $set: { sessionToken: token } });

        // Return success response with token and user data
        // return res.status(200).send({
        //     success: true,
        //     status: 200,
        //     token,
        //     userId: userData._id,
        //     name: userData.name,
        //     email: userData.email,
        // });

        return res.status(200).json({
            success: true,
            status: 200,
            data: {
                userId: userData._id,
                email: userData.email,
                name: userData.name,
                token: userData.token
            }, 
            message: "Login successful"
        });
        
    } catch (err) {
        console.error('Error in login API:', err);
        return res.status(500).json({
            success: false,
            status: 500,
            message: 'An unexpected error occurred.',
        });
    }
};