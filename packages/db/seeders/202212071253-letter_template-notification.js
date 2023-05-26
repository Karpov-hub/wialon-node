"use strict";
const id = "bfc94d12-7084-4442-a8ab-188f808527b6";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "letters",
      [
        {
          id,
          realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
          code: "dev-notification",
          letter_name: "Repogen technical issue notification",
          from: "repogen@getgps.pro",
          to: "dm112@tadbox.com",
          lang: "en",
          subject: "REPOGEN | TECH ISSUE NOTIFICATION",
          text: "Alarm notification",
          html: `p Hi! Informing you about a significant issue in Repogen project on the #{body.env} server. Please, inform the team and apply the required actions immediately.
p Level: "#{body.level}".
p Timestamp: "#{body.timestamp}".
p Message: "#{body.message}".
p Debug information: "#{body.debug}"
p Stack: "#{body.stack}"`,
          transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
          data: JSON.stringify({
            lang: "en",
            body: {
              from: "repogen@getgps.pro",
              to: "dm112@tadbox.com",
              env: "staging",
              message: "Error: Wrong http request [INPDATAFORMAT]",
              level: "http",
              app: "Repogen",
              server_ip: "172.21.0.2",
              timestamp: "Wed Dec 07 2022 15:10:48 GMT+0400",
              debug:
                '{"requestId":null,"request":{"headers":{"host":"89.221.54.198","connection":"upgrade","x-real-ip":"45.185.153.34","x-forwarded-for":"45.185.153.34","user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36","accept-encoding":"gzip"},"body":{}},"response":{"header":{"id":null,"status":"ERROR"},"error":{"code":"INPDATAFORMAT","message":"Error in input format."}}}',
              stack: ""
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
    return queryInterface.bulkDelete("letters", { id }, {});
  }
};
