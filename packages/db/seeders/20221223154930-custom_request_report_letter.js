"use strict";
const letterIds = [
  "346e05ff-a1a2-449f-9189-7ceeff4090b0",
  "e0d1eb3a-dca1-493f-89a5-dccb4366389a"
];
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "letters",
      [
        {
          id: letterIds[0],
          realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
          code: "custom_request_report",
          letter_name: "Request Customized Report",
          from: "repogen@getgps.pro",
          to: "repogen@getgps.eu",
          lang: "en",
          subject: "REPOGEN | Request Customized Report",
          text: "Request Customized Report",
          html: `p Customized request report
p User: #{body.email}
p #{body.html}`,
          transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
          data: JSON.stringify({
            lang: "en",
            code: "custom_request_report",
            to: "repogen@getgps.eu",
            body: {
              html: "<html><body>test</html></body>",
              files: [
                {
                  "name": "6.png",
                  "code": "ded38f50-86b6-11ed-9126-37e6b84982fc",
                  "size": 20139
                }
              ],
              lang: "EN",
              code: "custom_request_report",
              email: "mailrepogentest@maildrop.cc",
              to: "repogen@getgps.eu"
            }
          }),
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: letterIds[1],
          realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
          code: "custom_request_report",
          letter_name: "Запрос индивидуального отчета",
          from: "repogen@getgps.pro",
          to: "repogen@getgps.eu",
          lang: "ru",
          subject: "REPOGEN | Запрос индивидуального отчета",
          text: "Запрос индивидуального отчета",
          html: `p Запрос индивидуального отчета
p Пользователь: #{body.email}
p #{body.html}`,
          transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
          data: JSON.stringify({
            lang: "ru",
            code: "custom_request_report",
            to: "repogen@getgps.eu",
            body: {
              html: "<html><body>test</html></body>",
              files: [
                {
                  "name": "6.png",
                  "code": "ded38f50-86b6-11ed-9126-37e6b84982fc",
                  "size": 20139
                }
              ],
              lang: "RU",
              code: "custom_request_report",
              email: "mailrepogentest@maildrop.cc",
              to: "repogen@getgps.eu"
            }
          }),
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },


  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete("letters", { id: { [Op.in]: letterIds } }, {});
  }
};
