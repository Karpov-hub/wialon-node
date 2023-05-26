"use strict";

const oldHtmlForEnVersion = `doctype html
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

const letter = {
  id: "346e05ff-a1a2-449f-9189-7ceeff4090b0",
  html: htmlForEnVersion,
  oldHtml: oldHtmlForEnVersion
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `
          UPDATE letters
          SET html = '${letter.html}' 
          WHERE id = '${letter.id}' 
        `
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `
              UPDATE letters
              SET html = '${letter.oldHtml}' 
              WHERE id = '${letter.id}' 
          `
    );
  }
};
