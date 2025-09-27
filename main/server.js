const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Default root route - simple health check
app.get('/', (req, res) => {
  res.status(200).json({ message: '🚀 Server is running!' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/evidence', require('./routes/evidenceRoutes'));
app.use('/api/fir', require('./routes/firRoutes'));
app.use('/api/status', require('./routes/statusRoutes'));

app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Server Status</title>
          <style>
            body {
              display: flex;
              height: 100vh;
              margin: 0;
              justify-content: center;
              align-items: center;
              background: #121212;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .status-box {
              background: #1e1e1e;
              border-radius: 15px;
              padding: 40px 60px;
              text-align: center;
              box-shadow: 0 0 20px #4caf50;
              animation: glow 2s ease-in-out infinite alternate;
              color: #4caf50;
              font-size: 24px;
              user-select: none;
            }
            @keyframes glow {
              from {
                box-shadow: 0 0 10px #4caf50;
              }
              to {
                box-shadow: 0 0 30px #81c784;
              }
            }
            .emoji {
              font-size: 48px;
              margin-bottom: 15px;
            }
          </style>
        </head>
        <body>
          <div class="status-box">
            <div class="emoji">🚀✨</div>
            <div>Server is running!</div>
            <div style="margin-top: 10px; font-size: 16px; color: #bbb;">
              Stay safe & code on! 💻🔥
            </div>
          </div>
        </body>
      </html>
    `);
  });
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
