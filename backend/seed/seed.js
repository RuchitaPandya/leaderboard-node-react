const { insertDummyData } = require('../models/activityModel');

(async () => {
  await insertDummyData();
  process.exit();
})();
