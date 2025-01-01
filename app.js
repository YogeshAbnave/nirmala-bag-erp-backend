const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const routes = require('express').Router();
const bodyParser = require('body-parser');
const cloudinary = require('./config/cloudinary.js');
const http = require('http');
const server = http.createServer(app);
const port = 8000
app.set('views', path.join(__dirname, 'app/views'));
app.use(express.static(path.join(__dirname, 'dist')));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.cookie('example_cookie', 'cookie_value', {
    httpOnly: true,
    secure: true, // Required for SameSite=None
    sameSite: 'None', // Allows cookies to be sent in third-party contexts
  });
  next();
});
const allowedOrigins = ['https://nirmala-bag-erp-backend.onrender.com','http://localhost:5173', 'http://localhost:4200'];
// added url
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  credentials: true, // Allows cookies to be included in requests
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/public', express.static('public'));

/***************Mongodb configuratrion********************/
// const dbUri = 'mongodb://localhost:27017/NirmalaBagErp';
const dbUri = 'mongodb+srv://Nirmala-bag:Nirmala7596@ac-aphcdql.bi0xw4z.mongodb.net/Nirmala-bag?retryWrites=true&w=majority';

mongoose.connect(dbUri, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});
mongoose.set('runValidators', true);
(async () => {
  try {
      const result = await cloudinary.api.ping();
      console.log('Cloudinary connection successful:', result);
  } catch (error) {
      console.error('Cloudinary connection error:', error);
  }
})();
// //set up our express application
// cloudinary.uploader.upload('./uploads', { 
//   folder: 'uploads', 
//   timeout: 120000 // Timeout set to 60 seconds (60000 ms)
// })
//   .then(result => {
//     console.log('Upload successful:', result);
//   })
//   .catch(error => {
//     console.error('Error uploading to Cloudinary:', error);
//   });
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));  // Set the size limit to 50mb
const storage = multer.memoryStorage(); 
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },  // Limit file size to 100MB
}).single('file'); 
// Increase the limit for URL-encoded data
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

app.post('/upload', upload, (req, res) => {
    if (req.file) {
      // Process the file (e.g., parse XLSX file)
      res.status(200).json({ message: 'File uploaded successfully', file: req.file });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  });

// routes ======================================================================
app.use('/api', require('./app/routes/routes.js')); 
app.use(express.static(path.join(__dirname, '/public')));

server.listen(port);
console.log('Server is up and listening on port ==========> ' + port);
// pass the server to the socket
app.locals.options = {};
// Cron jobs


exports = module.exports = app, routes;
