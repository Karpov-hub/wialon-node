"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "letters",
      [
        {
          id: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2bdcce6",
          transporter: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2ddcce6",
          realm: "2b4c01ca-2749-11eb-adc1-0242ac120002",
          code: "CHARTS",
          letter_name: "Daily charts",
          from: "wialon.charts@gmail.com",
          to: "",
          subject: "",
          text: "Ежедневный отчет",
          html: `doctype html
            head
            p Добрый день!
            p Во вложении ежедневный отчет Wialon-charts.`,
          lang: "ru"
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("letters", null, {});
  }
};
