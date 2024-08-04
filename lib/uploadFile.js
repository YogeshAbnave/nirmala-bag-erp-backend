const multer = require('multer');

// Upload Category Image
let uploadStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploadedFiles/category');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
exports.fileUpload = multer({ storage: uploadStorage });

// Upload Profile Picture
let uploadProfileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploadedFiles/profile');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
exports.profileUpload = multer({ storage: uploadProfileStorage });
