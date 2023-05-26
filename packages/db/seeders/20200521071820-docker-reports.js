"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const file = require("fs");
    /*
    let kazan = file.readFileSync(
      "../../preset_reports/d45185e9-5a53-4146-b657-a792f308807b/code.js"
    );
    let generic = file.readFileSync(
      "../../preset_reports/449ea2ca-0192-4ddc-a631-eb1ee763e2f4/code.js"
    );
    let vesta = file.readFileSync(
      "../../preset_reports/57802189-f51d-4ec5-89d6-8faf3e2bf82d/code.js"
    );
    let kazanCode = Buffer.from(kazan, "base64").toString("utf8");
    let genericCode = Buffer.from(generic, "base64").toString("utf8");
    let vestaCode = Buffer.from(vesta, "base64").toString("utf8");
*/
    return queryInterface.bulkInsert(
      "customreports",
      [
        {
          id: "449ea2ca-0192-4ddc-a631-eb1ee763e2f5",
          description: "generic report",
          name: "generic",
          code: "", //genericCode,
          ctime: new Date(),
          mtime: new Date()
        },
        // {
        //   id: "d45185e9-5a53-4146-b657-a792f308807b",
        //   description: "kazan report",
        //   name: "kazan",
        //   code: "", //kazanCode,
        //   ctime: new Date(),
        //   mtime: new Date()
        // },
        // {
        //   id: "57802189-f51d-4ec5-89d6-8faf3e2bf82d",
        //   description: "vesta report",
        //   name: "vesta",
        //   code: "", //vestaCode,
        //   ctime: new Date(),
        //   mtime: new Date()
        // }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("customreports", null, {});
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
