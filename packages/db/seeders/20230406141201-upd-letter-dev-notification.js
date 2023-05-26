"use strict";

const id = "bfc94d12-7084-4442-a8ab-188f808527b6";

const oldHtml = `p Hi! Informing you about a significant issue in Repogen project on the #{body.env} server. Please, inform the team and apply the required actions immediately.
p Level: "#{body.level}".
p Timestamp: "#{body.timestamp}".
p Message: "#{body.message}".
p Debug information: "#{body.debug}"
p Stack: "#{body.stack}"`;

const newHtml = `p Hi! Informing you about a significant issue in Repogen project on the #{body.env} server. Please, inform the team and apply the required actions immediately.
p Level: "#{body.level}".
p Timestamp: "#{body.timestamp}".
p Message: "#{body.message}".
p Debug information: "#{body.debug}"
p Stack: "#{body.stack}"
p Details: "#{body.details}"`;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkUpdate("letters", { html: newHtml }, { id });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkUpdate("letters", { html: oldHtml }, { id });
  }
};
