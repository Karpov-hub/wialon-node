"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "letters",
      [
        {
          id : "29e71b59-f517-41c6-a6d0-90f140a10b9e", 
          realm : "56e4a6bb-8fde-445d-bc73-08c93f3f0e27",         
          code : "InvoiceGenerated",
          letter_name : "Invoice generation email",
          from : "\"Enovate V\" <enovate170@gmail.com>",
          to : "ab198@enovate-it.com",
          subject : "WIALON | INVOICE GENERATED",
          text : "Invoice generation email",
          html : "<!DOCTYPEHTMLPUBLIC\"-\/\/W3C\/\/DTD HTML 4.01 Transitional\/\/EN\"> <html><body><p>Hello, <p>Invoice has been generated.</br> You can find Invoice <a href=\"https://nr.getgps.eu/\">here</a></p> </body></html>",
          transporter : "2d914c50-35d3-11ea-b4b0-d3e77cd96bd1",
          ctime : new Date(),
          mtime : new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("letters", null, {});
  }
};