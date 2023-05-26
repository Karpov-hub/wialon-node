"use strict";
// const records = [
//   { id: '580f07da-5a3a-4c3d-968b-ae2c5c96c87b', report_id: '449ea2ca-0192-4ddc-a631-eb1ee763e2f4' },
//   { id: '00c07ba3-580a-4a5b-b699-b53f737a3bca', report_id: 'd45185e9-5a53-4146-b657-a792f308807b' },
//   { id: '980f07da-5a3a-4c3d-968b-ae2c5c96c87b', report_id: '57802189-f51d-4ec5-89d6-8faf3e2bf82d' },
// ];
const records = [
  { report_name: "generic", report_id: "449ea2ca-0192-4ddc-a631-eb1ee763e2f4" },
  { report_name: "kazan", report_id: "d45185e9-5a53-4146-b657-a792f308807b" },
  { report_name: "vesta", report_id: "57802189-f51d-4ec5-89d6-8faf3e2bf82d" }
];
module.exports = {
  up: (queryInterface, Sequelize) => {
    const promises = records.map((r) =>
      queryInterface.sequelize.query(
        `
      UPDATE routes
      SET report_id = :report_id
      WHERE report_name = :report_name
    `,
        {
          replacements: r
        }
      )
    );
    return Promise.all(promises);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([]);
  //   const promises = records.map((r) =>
  //     queryInterface.sequelize.query(
  //       `
  //   UPDATE routes
  //   SET report_id = null
  //   WHERE report_name = :report_name
  // `,
  //       {
  //         replacements: r
  //       }
  //     )
  //   );
  //   return Promise.all(promises);
  }
};
