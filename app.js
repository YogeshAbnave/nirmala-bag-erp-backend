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

const port = 8000
app.set('views', path.join(__dirname, 'app/views'));
app.use(express.static(path.join(__dirname, 'dist')));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
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

//set up our express application
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

const http = require('http');
const server = http.createServer(app);
server.listen(port);
console.log('Server is up and listening on port ==========> ' + port);
// pass the server to the socket
app.locals.options = {};
// Cron jobs


exports = module.exports = app, routes;
