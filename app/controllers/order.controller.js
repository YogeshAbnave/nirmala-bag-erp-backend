const webUserModel = require("../models/webUser.model.js");
const orderModel = require("../models/order.model.js");
const mongoose = require("mongoose");
const { ObjectId } = require('mongodb');
exports.placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    if (!userId || !items?.length || !amount || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newOrder = await orderModel.create({
      userId,
      items,
      amount,
      address,
      status: "Order Placed",
      paymentMethod: "Razorpay",
      paid: true,
      date: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully using Razorpay",
      order: newOrder,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

exports.placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    if (!userId || !items?.length || !amount || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newOrder = await orderModel.create({
      userId,
      items,
      amount,
      address,
      status: "Order Placed",
      paymentMethod: "Stripe",
      paid: true,
      date: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully using Stripe",
      order: newOrder,
    });
  } catch (error) {
    console.error("Stripe order error:", error);
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

exports.allOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .sort({ date: -1 })
      .populate("userId", "name email");

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};
// Placing Orders using COD Method
exports.userPlaceOrders = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const { userId, items, amount, address, paymentMethod } = req.body; // Destructure from the request body

    // Prepare the order data
    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: paymentMethod || "COD", // Default to COD
      paid: paymentMethod === "COD" ? false : true, // Payment is false for COD, else true for other methods
    };

    // Save the order in the database
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear the user's cart data after placing the order
    const userIdObj = new ObjectId(userId);
    const updatedUser = await webUserModel.findByIdAndUpdate(
      { _id: userIdObj },
      { cartData: {} },
      { new: true } // Return the updated document
    );
    console.log(updatedUser, "updatedUser");
    // Return a success response
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
};

exports.userOrders = async (req, res) => {
  try {
    // Extract userId from the request body
    const { userId } = req.body;

    // Validate userId format
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Convert userId to ObjectId
    const userIdObj = new ObjectId(userId);

    // Find the user by ID
    const user = await webUserModel.findById(userIdObj);

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get the orders for the user
    const orders = await orderModel
      .find({ userId: userIdObj })
      .sort({ createdAt: -1 });

    // Return the success response with orders
    res.status(200).json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Error retrieving user orders:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user orders",
      error: error.message,
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    // Verify admin role
    if (!req.user?.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID and status required" });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update order status" });
  }
};
