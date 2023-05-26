"use strict";
const letterIds = [
  "65d4c9ea-5f2f-4aff-8988-49c63e3edb39",
  "2559d031-a6bb-4542-8fcf-af00c6a36c80",
  "3b694583-6391-4eab-973b-3d2f20cb0474",
  "57b7a95f-91e6-48ef-b4ab-4fecbad5cecd",
  "10d8ebda-daeb-4e9f-ad7b-dc2261c747dc",
  "ed3c6635-0145-4fb9-9201-4b10004ddc82"
];
module.exports = {
  up: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    queryInterface.bulkDelete("letters", { id: { [Op.in]: letterIds } }, {});
    return queryInterface.bulkInsert(
      "letters",
      [
        {
          id: letterIds[0],
          realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
          code: "plugin-request",
          letter_name: "plugin request from company",
          from: "repogen@getgps.pro",
          from_email: "repogen@getgps.pro",
          to: "",
          lang: "en",
          subject: "Company has requested access to plugin ",
          text: "",
          html: `p Company #{body.organization_name} has requested access to plugin #{body.plugin_name}`,
          transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
          data: JSON.stringify({
            lang: "EN",
            code: "plugin-request",
            to: "repogen@getgps.eu",
            body: {
              organization_id: "144513a0-70bb-11ed-b2c1-fb5e93cdeb88",
              plugin_id: "ee7c4508-7c45-11ed-a1eb-0242ac120002",
              lang: "EN",
              organization_name: "Test",
              plugin_name: "Fuel Cards"
            }
          }),
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: letterIds[1],
          realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
          code: "plugin-request",
          letter_name: "plugin request from company",
          from: "repogen@getgps.pro",
          from_email: "repogen@getgps.pro",
          to: "",
          lang: "ru",
          subject: "Компания запросила доступ к плагину",
          text: "",
          html: `p Компания #{body.organization_name} запросила доступ к плагину #{body.plugin_name}`,
          transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
          data: JSON.stringify({
            lang: "RU",
            code: "plugin-request",
            to: "repogen@getgps.eu",
            body: {
              organization_id: "144513a0-70bb-11ed-b2c1-fb5e93cdeb88",
              plugin_id: "ee7c4508-7c45-11ed-a1eb-0242ac120002",
              lang: "RU",
              organization_name: "Test",
              plugin_name: "Fuel Cards"
            }
          }),
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: letterIds[2],
          realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
          code: "plugin-request-approve",
          letter_name: "Plugin connection request approved",
          from: "repogen@getgps.pro",
          from_email: "repogen@getgps.pro",
          to: "",
          lang: "en",
          subject:
            "REPOGEN | Notification about plugin connection request approved",
          text: "",
          html: `doctype html
head
  meta(charset='UTF-8')
  meta(http-equiv='X-UA-Compatible' content='IE=edge')
  meta(name='viewport' content='width=device-width, initial-scale=1.0')
  title Letter
  style.
      body {
      }

      table {
          color: #031a23;
          width: 100%;
          text-align: center;
          vertical-align: middle;
      }

      h1 {
          color: #031a23;
          font-style: normal;
          font-weight: 400;
          font-size: 48px;
          line-height: 56.25px;
      }

      .logo {
          text-align: left;
          display: flex;
          margin: 0 auto;
          position: relative;
          text-decoration: none;
      }

      .logo > img {
          height: 70px;
          margin: 0 auto
      }

      .logo > span {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: #031a23;
          text-transform: uppercase;
          font-weight: 500;
          font-size: 36px;
          line-height: 42px;
          letter-spacing: 0.02em;
          text-decoration: none;
      }

      .contact-us,
      .link {
          color: #031a23;
          font-weight: 300;
          font-size: 24px;
          line-height: 33px;
      }
table
  tr
    td
      a.logo(target='_blank' href='https://repogen.getgps.pro')
        img(src='https://repogen.getgps.pro/logo.png' alt='logo')
  tr
    td
      h1 Plugin connection request approved
  tr
    td
      .link
       | #{body.plugin_name} plugin is connected to your organization
  tr
    td
      .contact-us
        | - if you have any questions, please contact us
        a(href='mailto:repogen@getgps.pro') repogen@getgps.pro
`,
          transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
          data: JSON.stringify({
            lang: "en",
            code: "plugin-request-approve",
            to: "test@test.test",
            body: {
              plugin_name: "Test"
            }
          }),
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: letterIds[3],
          realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
          code: "plugin-request-approve",
          letter_name: "Заявка на подключение плагина одобрена",
          from: "repogen@getgps.pro",
          from_email: "repogen@getgps.pro",
          to: "",
          lang: "ru",
          subject:
            "REPOGEN | Уведомление об одобрении заявки на подключение плагина",
          text: "",
          html: `doctype html
head
  meta(charset='UTF-8')
  meta(http-equiv='X-UA-Compatible' content='IE=edge')
  meta(name='viewport' content='width=device-width, initial-scale=1.0')
  title Letter
  style.
      body {
      }

      table {
          color: #031a23;
          width: 100%;
          text-align: center;
          vertical-align: middle;
      }

      h1 {
          color: #031a23;
          font-style: normal;
          font-weight: 400;
          font-size: 48px;
          line-height: 56.25px;
      }

      .logo {
          text-align: left;
          display: flex;
          margin: 0 auto;
          position: relative;
          text-decoration: none;
      }

      .logo > img {
          height: 70px;
          margin: 0 auto
      }

      .logo > span {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: #031a23;
          text-transform: uppercase;
          font-weight: 500;
          font-size: 36px;
          line-height: 42px;
          letter-spacing: 0.02em;
          text-decoration: none;
      }

      .contact-us,
      .link {
          color: #031a23;
          font-weight: 300;
          font-size: 24px;
          line-height: 33px;
      }
table
  tr
    td
      a.logo(target='_blank' href='https://repogen.getgps.pro')
        img(src='https://repogen.getgps.pro/logo.png' alt='logo')
  tr
    td
      h1 Заявка на подключение плагина одобрена
  tr
    td
      .link
       | Плагин #{body.plugin_name} успешно подключен к вашей организации.
  tr
    td
      .contact-us
        | - Если у Вас появились вопросы, пожалуйста, обратитесь к нам 
        a(href='mailto:repogen@getgps.pro') repogen@getgps.pro
`,
          transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
          data: JSON.stringify({
            lang: "ru",
            code: "plugin-request-approve",
            to: "test@test.test",
            body: {
              plugin_name: "Test"
            }
          }),
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: letterIds[4],
          realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
          code: "plugin-request-reject",
          letter_name: "Plugin connection request rejected",
          from: "repogen@getgps.pro",
          from_email: "repogen@getgps.pro",
          to: "",
          lang: "en",
          subject:
            "REPOGEN | Notification about plugin connection request rejected",
          text: "",
          html: `doctype html
head
  meta(charset='UTF-8')
  meta(http-equiv='X-UA-Compatible' content='IE=edge')
  meta(name='viewport' content='width=device-width, initial-scale=1.0')
  title Letter
  style.
      body {
      }

      table {
          color: #031a23;
          width: 100%;
          text-align: center;
          vertical-align: middle;
      }

      h1 {
          color: #031a23;
          font-style: normal;
          font-weight: 400;
          font-size: 48px;
          line-height: 56.25px;
      }

      .logo {
          text-align: left;
          display: flex;
          margin: 0 auto;
          position: relative;
          text-decoration: none;
      }

      .logo > img {
          height: 70px;
          margin: 0 auto
      }

      .logo > span {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: #031a23;
          text-transform: uppercase;
          font-weight: 500;
          font-size: 36px;
          line-height: 42px;
          letter-spacing: 0.02em;
          text-decoration: none;
      }

      .contact-us,
      .link {
          color: #031a23;
          font-weight: 300;
          font-size: 24px;
          line-height: 33px;
      }
table
  tr
    td
      a.logo(target='_blank' href='https://repogen.getgps.pro')
        img(src='https://repogen.getgps.pro/logo.png' alt='logo')
  tr
    td
      h1 Plugin connection request rejected
  tr
    td
      .link
       | Request to connect plugin #{body.plugin_name} rejected.
  tr
    td
      .link
       | Reason: #{body.reject_reason}.     
       
  tr
    td
      .contact-us
        | - if you have any questions, please contact us
        a(href='mailto:repogen@getgps.pro') repogen@getgps.pro
`,
          transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
          data: JSON.stringify({
            lang: "en",
            code: "plugin-request-reject",
            to: "test@test.test",
            body: {
              plugin_name: "Test",
              reject_reason: "Test reason"
            }
          }),
          ctime: new Date(),
          mtime: new Date()
        },
        {
          id: letterIds[5],
          realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
          code: "plugin-request-approve",
          letter_name: "Заявка на подключение плагина отклонена",
          from: "repogen@getgps.pro",
          from_email: "repogen@getgps.pro",
          to: "",
          lang: "ru",
          subject:
            "REPOGEN | Уведомление об отклонении заявки на подключение плагина",
          text: "",
          html: `doctype html
head
  meta(charset='UTF-8')
  meta(http-equiv='X-UA-Compatible' content='IE=edge')
  meta(name='viewport' content='width=device-width, initial-scale=1.0')
  title Letter
  style.
      body {
      }

      table {
          color: #031a23;
          width: 100%;
          text-align: center;
          vertical-align: middle;
      }

      h1 {
          color: #031a23;
          font-style: normal;
          font-weight: 400;
          font-size: 48px;
          line-height: 56.25px;
      }

      .logo {
          text-align: left;
          display: flex;
          margin: 0 auto;
          position: relative;
          text-decoration: none;
      }

      .logo > img {
          height: 70px;
          margin: 0 auto
      }

      .logo > span {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: #031a23;
          text-transform: uppercase;
          font-weight: 500;
          font-size: 36px;
          line-height: 42px;
          letter-spacing: 0.02em;
          text-decoration: none;
      }

      .contact-us,
      .link {
          color: #031a23;
          font-weight: 300;
          font-size: 24px;
          line-height: 33px;
      }
table
  tr
    td
      a.logo(target='_blank' href='https://repogen.getgps.pro')
        img(src='https://repogen.getgps.pro/logo.png' alt='logo')
  tr
    td
      h1 Заявка на подключение плагина отклонена
  tr
    td
      .link
       | Запрос на подключение плагина #{body.plugin_name} отклонен.
  tr
    td
      .link
       | Причина: #{body.reject_reason}.
  tr
    td
      .contact-us
        | - Если у Вас появились вопросы, пожалуйста, обратитесь к нам 
        a(href='mailto:repogen@getgps.pro') repogen@getgps.pro
`,
          transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
          data: JSON.stringify({
            lang: "ru",
            code: "plugin-request-reject",
            to: "test@test.test",
            body: {
              plugin_name: "Тест",
              reject_reason: "Тестовая причина"
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
    return queryInterface.bulkDelete(
      "letters",
      { id: { [Op.in]: letterIds } },
      {}
    );
  }
};
