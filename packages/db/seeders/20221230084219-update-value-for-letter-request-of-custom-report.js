"use strict";
const records = [
  "346e05ff-a1a2-449f-9189-7ceeff4090b0",
  "e0d1eb3a-dca1-493f-89a5-dccb4366389a"
];
module.exports = {
  up: (queryInterface, Sequelize) => {
    const promises = records.map((r) =>
      queryInterface.sequelize.query(
        `
      UPDATE letters
      SET from_email = 'repogen@getgps.pro'
      WHERE id = '${r}' 
    `
      )
    );
    return Promise.all(promises);
  },

  down: (queryInterface, Sequelize) => {
    {
      const promises = records.map((r) =>
        queryInterface.sequelize.query(
          `
          UPDATE letters
          SET from_email = null
          WHERE id = '${r}'
        `
        )
      );
      return Promise.all(promises);
    }
  }
};
