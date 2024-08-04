const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
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
const dbUri = 'mongodb+srv://JLPT-EXAM:Fl4xkzwe7FhJ5fMY@cluster0.bi0xw4z.mongodb.net/JLPT-EXAM';

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
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});
// routes ======================================================================
app.use('/api', require('./app/routes/routes.js')); // load our routes and pass in our app and fully configured passport
const users = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Doe' }
  ];
  
  // GET endpoint to fetch all users
  app.get('/api/data', (req, res) => {
    res.json(users);
  });
// app.use(express.static(path.join(__dirname, '/angularApp/dist')));
app.use(express.static(path.join(__dirname, '/public')));
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'angularApp/dist/index.html'));
// });

// launch ======================================================================
const http = require('http');
const server = http.createServer(app);
server.listen(port);
console.log('Server is up and listening on port ==========> ' + port);
// pass the server to the socket
app.locals.options = {};
// Cron jobs


exports = module.exports = app, routes;
