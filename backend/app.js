const express = require('express');
const app = express();
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use('/api/leaderboard', leaderboardRoutes);

module.exports = app;
