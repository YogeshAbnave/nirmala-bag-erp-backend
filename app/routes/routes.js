const router = require("express").Router();
const sharp = require("sharp");
const multer = require('multer');
var authentication = require("../../config/authentication.js");
var uploadFile = require("../../lib/uploadFile");
const uploadMiddleware = require('../middleware/multer');
const admin = require("../controllers/admin.controller");
const webUser = require("../controllers/webUser.controller");
const product = require("../controllers/product.controller.js");
const order = require("../controllers/order.controller.js");
const cart = require("../controllers/cart.controller.js");
const xlsx = require("../controllers/excel.controller.js");
const authUser = require("../middleware/auth.js");
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });


// Upload category image
router.post("/uploadFile", authentication.apiAuthentication, uploadFile.fileUpload.single("photo"), (req, res, next) => {
    const file = req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    } else {
      sharp(req.file.path)
      .resize(1000, 1000)
      .flatten()
      .toFile(`./public/uploadedFiles/category/thumbnails-${req.file.filename}`)
      .then(() => {
        let imageData = {
          filename: `thumbnails-${req.file.filename}`
        }
        res.send(imageData);
      }).catch(err => {
        res.status(500).json({ success: false, status: 500, message: err.message })
      });
    }
  }
);
// Upload profile image
router.post("/uploadProfile", uploadFile.profileUpload.single("photo"), (req, res, next) => {
    const file = req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    } else {
        sharp(req.file.path)
        .resize(1000, 1000)
        .withMetadata()
        .toFile(`./public/uploadedFiles/profile/thumbnails-${req.file.filename}`)
        .then(() => {
          let imageData = {
            filename: `thumbnails-${req.file.filename}`
          }
          res.send(imageData);
        }).catch(err => {
          res.status(500).json({ success: false, status: 500, message: err.message })
        });
    }
  }
);

// Admin webUser routes
router.post("/admin/login", admin.login);
router.post("/admin/addAdmin", admin.addAdmin);
router.post("/admin/forgotPassword", admin.forgotPassword);
router.post("/admin/checkResetPasswordToken", admin.checkResetPasswordToken);
router.post("/admin/resetPassword", admin.resetPassword);
router.post("/admin/changePassword", authentication.apiAuthentication, admin.changePassword);
router.get("/admin/logout", admin.logout);
router.get("/admin/getAdminById/:userId", authentication.apiAuthentication, admin.getAdminById);
router.post("/admin/updateProfile", authentication.apiAuthentication, admin.updateProfile);

// Xlsx import
router.post('/xlsx/import/chunk', upload.single('chunk'), xlsx.insertXlsx);
router.delete('/xlsx/import/delete/:id', xlsx.deleteData);
router.get("/xlsx/import",xlsx.getData );

// User routes
router.post("/webUser/register", webUser.register);
router.post("/webUser/login", webUser.login);

// Product routes
router.post("/product/add",uploadMiddleware.array('images', 5), product.addProduct);
router.delete("/product/remove/:productId", product.removeProduct);
router.get("/product/single/:productId", product.singleProduct);
router.get("/product/list", product.listProduct);

// Cart routes
router.post("/cart/add", cart.addToCart );
router.put("/cart/updateCart",cart.updateCart);
router.get("/cart/single/:productId",authUser, cart.addToCart);
router.get("/cart/getData", cart.getUserCart);

// Order routes
router.post("/order/placeOrderRazorpay", order.placeOrderRazorpay );
router.put("/order/placeOrderStripe",order.placeOrderStripe);
router.get("/order/allOrders", order.allOrders);
router.post("/order/userOrders", order.userOrders);
router.post("/order/placeUserOrders", order.userPlaceOrders);
router.get("/order/updateStatus", order.updateStatus);

module.exports = router;
