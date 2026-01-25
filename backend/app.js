const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploads (static files for images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/businesses', require('./src/routes/businessRoutes'));
app.use('/api/jobs', require('./src/routes/jobRoutes'));
app.use('/api/announcements', require('./src/routes/announcementRoutes'));
app.use('/api/complaints', require('./src/routes/complaintRoutes'));
app.use('/api/emergency', require('./src/routes/emergencyRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
