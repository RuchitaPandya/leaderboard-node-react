const db = require('../config/db');

const getLeaderboard = async (filter) => {
    let whereClause = '';

    if (filter === 'day') {
        whereClause = "WHERE DATE(activity_time) = CURDATE()";
    } else if (filter === 'month') {
        whereClause = "WHERE MONTH(activity_time) = MONTH(CURDATE()) AND YEAR(activity_time) = YEAR(CURDATE())";
    } else if (filter === 'year') {
        whereClause = "WHERE YEAR(activity_time) = YEAR(CURDATE())";
    }

    const [rows] = await db.query(`
        SELECT u.id, u.full_name, u.points AS total_points
        FROM users u
        LEFT JOIN activities a ON u.id = a.user_id
        ${whereClause}
        GROUP BY u.id
        ORDER BY total_points DESC
      `);

    return rows;
};



const searchUser = async (userId, filter) => {
    let whereClause = 'AND 1=1'; // <-- Important
    if (filter === 'day') whereClause += " AND DATE(a.activity_time) = CURDATE()";
    else if (filter === 'month') whereClause += " AND MONTH(a.activity_time) = MONTH(CURDATE())";
    else if (filter === 'year') whereClause += " AND YEAR(a.activity_time) = YEAR(CURDATE())";

    const query = `
    SELECT u.id, u.full_name, COALESCE(SUM(CASE WHEN a.id IS NOT NULL THEN 20 ELSE 0 END), 0) AS total_points
    FROM users u
    LEFT JOIN activities a ON u.id = a.user_id
    WHERE u.id = ?
    ${whereClause}
    GROUP BY u.id
  `;

    const [rows] = await db.query(query, [userId]);
    return rows;
};

const insertDummyData = async () => {
    for (let i = 1; i <= 5; i++) {
        await db.query('INSERT INTO users (full_name) VALUES (?)', [`User ${i}`]);
        for (let j = 0; j < Math.floor(Math.random() * 10); j++) {
            await db.query(
                'INSERT INTO activities (user_id, activity_time) VALUES (?, NOW())',
                [i]
            );
        }
    }
};

const addPointsToAllUsers = async () => {
    try {
        // Ensure points column exists
        try {
            await db.query(`SELECT points FROM users LIMIT 1`);
        } catch (error) {
            await db.query(`ALTER TABLE users ADD COLUMN points INT DEFAULT 0`);
        }

        // Fetch all users
        const [users] = await db.query('SELECT id FROM users');

        for (const user of users) {
            // Check if the user has any activity
            const [activities] = await db.query(
                'SELECT COUNT(*) AS activityCount FROM activities WHERE user_id = ?',
                [user.id]
            );

            if (activities[0].activityCount === 0) {
                // User has no activity yet ➔ Insert one activity and give 20 points
                await db.query(
                    'INSERT INTO activities (user_id, activity_time) VALUES (?, NOW())',
                    [user.id]
                );

                await db.query(
                    'UPDATE users SET points = 20 WHERE id = ?',
                    [user.id]
                );
            }
            // If user already has activities ➔ do nothing
        }

        return { success: true, message: 'Checked and initialized points for new users only' };
    } catch (error) {
        console.error('Error adding points to users:', error);
        throw error;
    }
};


module.exports = {
    getLeaderboard,
    searchUser,
    insertDummyData,
    addPointsToAllUsers
};
