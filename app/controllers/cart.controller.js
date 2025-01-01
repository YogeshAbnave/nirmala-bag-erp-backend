var webUserModel = require('../models/webUser.model.js');
exports.getUserCart = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
      const token = authHeader.split(" ")[1];
  
      const user = await webUserModel.findOne({ token }).select('+cartData');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
        success: true,
        message: "Item added to cart",
        cartData: user.cartData
      });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching user categories" });
    }
};


exports.addToCart = async (req, res) => {
    try {
      const { itemId, size } = req.body;
      const authHeader = req.headers.authorization;
  
      if (!itemId || !size) {
        return res.status(400).json({ 
          success: false, 
          message: "ItemId and size are required" 
        });
      }
  
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ 
          success: false, 
          message: "Authorization token required" 
        });
      }
  
      const token = authHeader.split(" ")[1];
  
      const user = await webUserModel.findOne({ token }).select('+cartData');
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid token" 
        });
      }
  
      // Initialize cartData if doesn't exist
      if (!user.cartData) {
        user.cartData = {};
      }
  
      // Create or update item in cart
      if (!user.cartData[itemId]) {
        user.cartData[itemId] = {};
      }
  
      user.cartData[itemId][size] = (user.cartData[itemId][size] || 0) + 1;
  
      // Use markModified for nested objects
      user.markModified('cartData');
      
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: "Item added to cart",
        cartData: user.cartData
      });
  
    } catch (error) {
      console.error('Add to cart error:', error);
      
      return res.status(500).json({
        success: false,
        message: "Server error while adding to cart",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };


// API 3: Update Cart
 exports.updateCart = async (req, res) => {
    try {
        const { itemId, size, quantity } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ 
              success: false, 
              message: "Authorization token required" 
            });
          }
          const token = authHeader.split(" ")[1];
          const user = await webUserModel.findOne({ token })
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let cartData = user.cartData;

        if (cartData[itemId] && cartData[itemId][size] !== undefined) {
            cartData[itemId][size] = quantity;

            // Remove the item if quantity is 0
            if (quantity === 0) {
                delete cartData[itemId][size];
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
            }

            await webUserModel.findByIdAndUpdate(user._id, { cartData });
            res.json({ success: true, message: "Cart updated successfully" });
        } else {
            res.status(404).json({ success: false, message: "Item not found in cart" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating cart" });
    }
};
