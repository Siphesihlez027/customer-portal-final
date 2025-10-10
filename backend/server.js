const fs = require('fs');
const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(cors({
  origin: ['https://localhost:3000'], // React dev server
  credentials: true
}));

// ===== Routes =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employee/auth', require('./routes/employeeAuth'));
app.use('/api/payments', require('./routes/payments'));

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ===== SSL Certificate Setup =====
const sslOptions = {
  key: fs.readFileSync('./localhost+2-key.pem'),
  cert: fs.readFileSync('./localhost+2.pem'),
};

// ===== Start HTTPS Server =====
const PORT = process.env.PORT || 5000;

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`✅ HTTPS server running at https://localhost:${PORT}`);
});
