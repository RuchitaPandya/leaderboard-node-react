const Activity = require('../models/activityModel');

const getLeaderboard = async (req, res) => {
    try {
        const filter = req.query.filter;
        const data = await Activity.getLeaderboard(filter);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const searchUser = async (req, res) => {
    const userId = req.params.id;
    const filter = req.query.filter || 'all';
    const data = await Activity.searchUser(userId, filter);    
    res.json(data);
};

const recalculate = async (req, res) => {  
    await Activity.addPointsToAllUsers();
    res.json({ message: 'Dummy data inserted and leaderboard recalculated' });
};

module.exports = {
    getLeaderboard,
    searchUser,
    recalculate,
};
