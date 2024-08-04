const router = require("express").Router();
const sharp = require("sharp");

var authentication = require("../../config/authentication.js");
var uploadFile = require("../../lib/uploadFile");

const admin = require("../controllers/admin.controller");
const user = require("../controllers/user.controller");

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

// Admin user routes
router.post("/admin/login", admin.login);
router.post("/admin/addAdmin", admin.addAdmin);
router.post("/admin/forgotPassword", admin.forgotPassword);
router.post("/admin/checkResetPasswordToken", admin.checkResetPasswordToken);
router.post("/admin/resetPassword", admin.resetPassword);
router.post("/admin/changePassword", authentication.apiAuthentication, admin.changePassword);
router.get("/admin/logout", admin.logout);
router.get("/admin/getAdminById/:userId", authentication.apiAuthentication, admin.getAdminById);
router.post("/admin/updateProfile", authentication.apiAuthentication, admin.updateProfile);

// Employees routes





// User routes
router.post("/user/register", user.register);
router.post("/user/resendCode", user.resendCode);
router.post("/user/addUserCategory", user.addUserCategory);
router.post("/user/follow", user.follow);
router.post("/user/unfollow", user.unfollow);
router.post("/user/checkSubscription", user.checkSubscription);
router.post("/user/login", user.login);
router.post("/user/verify", user.verify);
router.post("/user/forgotPassword", user.forgotPassword);
router.post("/user/checkResetPasswordToken", user.checkResetPasswordToken);
router.post("/user/resetPassword", user.resetPassword);
router.post("/user/changePassword", authentication.apiAuthentication, user.changePassword);
router.post("/user/updateProfile", authentication.apiAuthentication, user.updateProfile);
router.post("/user/getAll", user.getAll);
router.get("/user/getAllCount", authentication.apiAuthentication, user.getAllCount);
router.get("/user/topDebators", authentication.apiAuthentication, user.topDebators);
router.post("/user/getByCategory", user.getByCategory);
router.get("/user/getById/:userId", authentication.apiAuthentication, user.getById);
router.get("/user/getFollowingById/:userId", authentication.apiAuthentication, user.getFollowingById);
router.get("/user/getFollowersById/:userId", authentication.apiAuthentication, user.getFollowersById);
router.post('/user/block', authentication.apiAuthentication, user.block);
router.post('/user/getAllBlocked', authentication.apiAuthentication, user.getAllBlocked);
router.post('/user/unblock', authentication.apiAuthentication, user.unblock);
router.get("/user/showNotification/:userId", authentication.apiAuthentication, user.showNotification);
router.get("/user/hideNotification/:userId", authentication.apiAuthentication, user.hideNotification);
router.get("/user/deactivate/:userId", user.deactivate);
router.get("/user/activate/:userId",  user.activate);
router.post("/user/deletedUser", user.deletedUser);
router.post("/user/logout", authentication.apiAuthentication, user.logout);

module.exports = router;
