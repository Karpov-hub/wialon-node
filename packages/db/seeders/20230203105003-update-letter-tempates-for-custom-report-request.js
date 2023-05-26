"use strict";

const oldDataForEnVersion = `{"lang":"en","code":"custom_request_report","to":"repogen@getgps.eu","body":{"text":"<html><body>test</html></body>","files":[{"name":"6.png","code":"ded38f50-86b6-11ed-9126-37e6b84982fc","size":20139}],"lang":"EN","code":"custom_request_report","email":"mailrepogentest@maildrop.cc","to":"repogen@getgps.eu"}}`;

const oldDataForRuVersion = `{"lang":"ru","code":"custom_request_report","to":"repogen@getgps.eu","body":{"text":"<html><body>test</html></body>","files":[{"name":"6.png","code":"ded38f50-86b6-11ed-9126-37e6b84982fc","size":20139}],"lang":"RU","code":"custom_request_report","email":"mailrepogentest@maildrop.cc","to":"repogen@getgps.eu"}}`;

const oldHtmlForEnVersion = `p Customized request report
p User: #{body.email}
p #{body.html}`;

const oldHtmlForRuVersion = `p Запрос индивидуального отчета
p Пользователь: #{body.email}
p #{body.html}`;

const dataForEnVersion = `{"lang":"en","code":"custom_request_report","to":"repogen@getgps.eu","body":{"text":"<html><body>test</html></body>","files":[{"name":"6.png","code":"ded38f50-86b6-11ed-9126-37e6b84982fc","size":20139}],"lang":"EN","code":"custom_request_report","email":"mailrepogentest@maildrop.cc","to":"repogen@getgps.eu"}}`;
const htmlForEnVersion = `doctype html
head
  meta(charset="UTF-8")
  meta(http-equiv="X-UA-Compatible" content="IE=edge")
  meta(name="viewport" content="width=device-width, initial-scale=1.0")
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
    margin:0 auto;
    position: relative;
    text-decoration: none;
    }
    .logo>img {
     height:70px;
    margin:0 auto
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
      a.logo(target="_blank" href="https://repogen.getgps.pro" style="align-items:center")
        img(src="https://repogen.getgps.pro/logo.png" alt="logo")
  tr
    td
      h1 Customized request report
  tr
    td
      .contact-us User: #{body.email}
      .contact-us Text: #{body.text}
       
  tr
    td
      .contact-us
        | - if you have any questions, please contact us
        a(href="mailto:repogen@getgps.pro") repogen@getgps.pro`;

const dataForRuVersion = `{"lang":"ru","code":"custom_request_report","to":"repogen@getgps.eu","body":{"text":"<html><body>test</html></body>","files":[{"name":"6.png","code":"ded38f50-86b6-11ed-9126-37e6b84982fc","size":20139}],"lang":"RU","code":"custom_request_report","email":"mailrepogentest@maildrop.cc","to":"repogen@getgps.eu"}}`;
const htmlForRuVersion = `doctype html
head
  meta(charset="UTF-8")
  meta(http-equiv="X-UA-Compatible" content="IE=edge")
  meta(name="viewport" content="width=device-width, initial-scale=1.0")
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
    margin:0 auto;
    position: relative;
    text-decoration: none;
    }
    .logo>img {
     height:70px;
    margin:0 auto
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
      a.logo(target="_blank" href="https://repogen.getgps.pro" style="align-items:center")
        img(src="https://repogen.getgps.pro/logo.png" alt="logo")
  tr
    td
      h1 Запрос индивидуального отчёта
  tr
    td
      .contact-us Пользователь: #{body.email}
      .contact-us Сообщение от пользователя: #{body.text}
       
  tr
    td
      .contact-us
        | - Если у Вас появились вопросы, пожалуйста, обратитесь к нам 
        a(href="mailto:repogen@getgps.pro") repogen@getgps.pro`;

const letters = [
  {
    id: "346e05ff-a1a2-449f-9189-7ceeff4090b0",
    data: dataForEnVersion,
    html: htmlForEnVersion
  },
  {
    id: "e0d1eb3a-dca1-493f-89a5-dccb4366389a",
    data: dataForRuVersion,
    html: htmlForRuVersion
  }
];

const oldLetters = [
  {
    id: "346e05ff-a1a2-449f-9189-7ceeff4090b0",
    data: oldDataForEnVersion,
    html: oldHtmlForEnVersion
  },
  {
    id: "e0d1eb3a-dca1-493f-89a5-dccb4366389a",
    data: oldDataForRuVersion,
    html: oldHtmlForRuVersion
  }
];

module.exports = {
  up: (queryInterface, Sequelize) => {
    const promises = letters.map((r) =>
      queryInterface.sequelize.query(
        `
          UPDATE letters
          SET html = '${r.html}', data = '${r.data}', text = null 
          WHERE id = '${r.id}' 
        `
      )
    );
    return Promise.all(promises);
  },

  down: (queryInterface, Sequelize) => {
    const promises = oldLetters.map((r) =>
      queryInterface.sequelize.query(
        `
        UPDATE letters
        SET html = '${r.html}', data = '${r.data}'
        WHERE id = '${r.id}' 
    `
      )
    );
    return Promise.all(promises);
  }
};
