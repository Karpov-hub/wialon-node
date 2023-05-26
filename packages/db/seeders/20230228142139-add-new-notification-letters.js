"use strict";

const htmlHeaderAndStyle = `doctype html
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
`;
const htmlEnCR =
  htmlHeaderAndStyle +
  `table
  tr
    td
      a.logo(target="_blank" href="https://repogen.getgps.pro" style="align-items:center")
        img(src="https://repogen.getgps.pro/logo.png" alt="logo")
  tr
    td
      h1 New customized report request
  tr
    td
      .contact-us Thank you for your request! The administration was notified about your request and will contact you soon.
  tr
    td
      .contact-us This is an automated message - please do not reply directly to this email.   
  tr
    td
      .contact-us
        | - if you have any questions, please contact us 
        a(href="mailto:repogen@getgps.pro") repogen@getgps.pro`;

const htmlRuCR =
  htmlHeaderAndStyle +
  `table
  tr
    td
      a.logo(target="_blank" href="https://repogen.getgps.pro" style="align-items:center")
        img(src="https://repogen.getgps.pro/logo.png" alt="logo")
  tr
    td
      h1 Запрос нового индивидуального отчета
  tr
    td
      .contact-us Спасибо за Ваш запрос! Администрация уведомлена о Вашем запросе и скоро свяжется с Вами.
  tr
    td
      .contact-us Это автоматическое сообщение — пожалуйста, не отвечайте на это письмо.   
  tr
    td
      .contact-us
        | - Если у Вас появились вопросы, пожалуйста, обратитесь к нам 
        a(href="mailto:repogen@getgps.pro") repogen@getgps.pro`;

const dataEnCR = `{"lang":"en","code":"custom_request_report_notification","to":"repogen@getgps.eu","body":{"text":"<html><body>test</html></body>","lang":"EN","code":"custom_request_report_notification","email":"mailrepogentest@maildrop.cc","to":"repogen@getgps.eu"}}`;
const dataRuCR = `{"lang":"ru","code":"custom_request_report_notification","to":"repogen@getgps.eu","body":{"text":"<html><body>test</html></body>","lang":"RU","code":"custom_request_report_notification","email":"mailrepogentest@maildrop.cc","to":"repogen@getgps.eu"}}`;

const htmlEnCT =
  htmlHeaderAndStyle +
  `table
  tr
    td
      a.logo(target="_blank" href="https://repogen.getgps.pro" style="align-items:center")
        img(src="https://repogen.getgps.pro/logo.png" alt="logo")
  tr
    td
      h1 New ticket created
  tr
    td
      .contact-us Thank you for your question! The administration was notified about your ticket and will answer soon.
  tr
    td
      .contact-us This is an automated message - please do not reply directly to this email.   
  tr
    td
      .contact-us
        | - if you have any questions, please contact us 
        a(href="mailto:repogen@getgps.pro") repogen@getgps.pro`;

const htmlRuCT =
  htmlHeaderAndStyle +
  `table
  tr
    td
      a.logo(target="_blank" href="https://repogen.getgps.pro" style="align-items:center")
        img(src="https://repogen.getgps.pro/logo.png" alt="logo")
  tr
    td
      h1 Создан новый вопрос
  tr
    td
      .contact-us Благодарим за Ваш вопрос! Администрация уведомлена о Вашем вопросе и скоро ответит на него.
  tr
    td
      .contact-us Это автоматическое сообщение — пожалуйста, не отвечайте на это письмо.   
  tr
    td
      .contact-us
        | - Если у Вас появились вопросы, пожалуйста, обратитесь к нам 
        a(href="mailto:repogen@getgps.pro") repogen@getgps.pro`;

const dataEnCT = `{"lang":"en","code":"new_ticket_notification","to":"repogen@getgps.eu","body":{"text":"<html><body>test</html></body>","lang":"EN","code":"new_ticket_notification","email":"mailrepogentest@maildrop.cc","to":"repogen@getgps.eu"}}`;
const dataRuCT = `{"lang":"ru","code":"new_ticket_notification","to":"repogen@getgps.eu","body":{"text":"<html><body>test</html></body>","lang":"RU","code":"new_ticket_notification","email":"mailrepogentest@maildrop.cc","to":"repogen@getgps.eu"}}`;

const htmlEnAA =
  htmlHeaderAndStyle +
  `table
  tr
    td
      a.logo(target="_blank" href="https://repogen.getgps.pro" style="align-items:center")
        img(src="https://repogen.getgps.pro/logo.png" alt="logo")
  tr
    td
      h1 New message from the admin in question
  tr
    td
      .contact-us A new message from the admin in question number #{body.ticket_number}! You can view it in your personal Repogen app account on the 'Support' tab.
  tr
    td
      .contact-us This is an automated message - please do not reply directly to this email.   
  tr
    td
      .contact-us
        | - if you have any questions, please contact us 
        a(href="mailto:repogen@getgps.pro") repogen@getgps.pro`;

const htmlRuAA =
  htmlHeaderAndStyle +
  `table
  tr
    td
      a.logo(target="_blank" href="https://repogen.getgps.pro" style="align-items:center")
        img(src="https://repogen.getgps.pro/logo.png" alt="logo")
  tr
    td
      h1 Новое сообщение от администратора в вопросе
  tr
    td
      .contact-us Новое сообщение от администратора в вопросе под номером #{body.ticket_number}! Вы можете его просмотреть в Вашем личном кабинете приложения Repogen во вкладке 'Поддержка'.
  tr
    td
      .contact-us Это автоматическое сообщение — пожалуйста, не отвечайте на это письмо.   
  tr
    td
      .contact-us
        | - Если у Вас появились вопросы, пожалуйста, обратитесь к нам 
        a(href="mailto:repogen@getgps.pro") repogen@getgps.pro`;

const dataEnAA = `{"lang":"en","code":"admin_ticket_answer_notification","to":"repogen@getgps.eu","body":{"ticket_number": "123", "text":"<html><body>test</html></body>","lang":"EN","code":"admin_ticket_answer_notification","email":"mailrepogentest@maildrop.cc","to":"repogen@getgps.eu"}}`;
const dataRuAA = `{"lang":"ru","code":"admin_ticket_answer_notification","to":"repogen@getgps.eu","body":{"ticket_number": "123", "text":"<html><body>test</html></body>","lang":"RU","code":"admin_ticket_answer_notification","email":"mailrepogentest@maildrop.cc","to":"repogen@getgps.eu"}}`;

const letterIds = [
  "070bc5e4-73e5-4631-86a5-572e199c8d69",
  "010c7811-934a-4b1d-a44a-908a4c317325",
  "d0407412-c9f1-44a3-bc28-106902df3334",
  "afa0ed8d-9f9f-454b-9e9f-cde042e85ea8",
  "7e17844b-a5d4-44aa-b374-5b80e95d22fd",
  "d2069bb2-de7b-4cf8-9910-b6ea17b94e51"
];
const letters = [
  {
    id: letterIds[0],
    realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
    code: "custom_request_report_notification",
    letter_name: "Запрос нового индивидуального отчета",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "",
    lang: "ru",
    subject: "Repogen | Запрос нового индивидуального отчета",
    text: "",
    data: dataRuCR,
    html: htmlRuCR,
    transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
    ctime: new Date(),
    mtime: new Date()
  },
  {
    id: letterIds[1],
    realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
    code: "custom_request_report_notification",
    letter_name: "New customized report request",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "",
    lang: "en",
    subject: "Repogen | New customized report request",
    text: "",
    data: dataEnCR,
    html: htmlEnCR,
    transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
    ctime: new Date(),
    mtime: new Date()
  },
  {
    id: letterIds[2],
    realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
    code: "new_ticket_notification",
    letter_name: "Создан новый вопрос",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "",
    lang: "ru",
    subject: "Repogen | Создан новый вопрос",
    text: "",
    data: dataRuCT,
    html: htmlRuCT,
    transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
    ctime: new Date(),
    mtime: new Date()
  },
  {
    id: letterIds[3],
    realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
    code: "new_ticket_notification",
    letter_name: "New ticket created",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "",
    lang: "en",
    subject: "Repogen | New ticket created",
    text: "",
    data: dataEnCT,
    html: htmlEnCT,
    transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
    ctime: new Date(),
    mtime: new Date()
  },
  {
    id: letterIds[4],
    realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
    code: "admin_ticket_answer_notification",
    letter_name: "Новое сообщение от администратора в вопросе",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "",
    lang: "ru",
    subject: "Repogen | Новое сообщение от администратора в вопросе",
    text: "",
    data: dataRuAA,
    html: htmlRuAA,
    transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
    ctime: new Date(),
    mtime: new Date()
  },
  {
    id: letterIds[5],
    realm: "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",
    code: "admin_ticket_answer_notification",
    letter_name: "New message from admin in ticket",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "",
    lang: "en",
    subject: "Repogen | New message from admin in ticket",
    text: "",
    data: dataEnAA,
    html: htmlEnAA,
    transporter: "21efa1a9-5dd0-4279-a796-9acb8014fe43",
    ctime: new Date(),
    mtime: new Date()
  }
];

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("letters", letters, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("letters", { id: letterIds }, {});
  }
};
