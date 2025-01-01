const jwt = require("jsonwebtoken");

const authUser = async (req, res, next) => {
    const authHeader = req.headers.authorization; // Access the Authorization header
 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // Check if the Authorization header is present and properly formatted
        return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }

    const token = authHeader.split(" ")[1];
    console.log(token, "req.token");
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not Authorized, Login Again' });
    }

    try {
        const token_decode = jwt.verify(token, 'Nirmala-bag-erp'); // Verify the token
        req.body.userId = token_decode.id; // Add the decoded user ID to the request body
        next(); // Proceed to the next middleware
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
    }
};

module.exports = authUser; // Use `module.exports` to export the middleware
