import chai from "chai";
let should = chai.should();
import pretest from "@lib/pretest";
import db from "@lib/db";

import Service from "../src/Service.js";
const service = new Service({ name: "mail-service" });

let ENV;

describe("Mail service", async () => {
  before(async () => {
    ENV = await pretest.before();
    await db.transporter.truncate();
    // await db.letter.truncate();

    await db.transporter.create({
      id: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2ddcce4",
      host_transporter: "smtp.ethereal.email",
      port_transporter: 587,
      secure_transporter: false,
      user_transporter: "roderick.yundt@ethereal.email",
      password_transporter: "JZd1xTh14p1H4yKJnq"
    });

    await db.letter.create({
      id: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2bdcce4",
      transporter: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2ddcce4",
      realm: ENV.realmId,
      code: "TXLIST",
      letter_name: "Транзакции",
      from: "roderick.yundt@ethereal.email",
      to: "ag103@tadbox.com",
      subject: "Транзакции пользователя ",
      text: "Ваши транзакции",
      html: `doctype html
head
p Ваши транзакции
table.table
thead
  tr
  each columnName in data.body.list[0]
    th= columnName
tbody
each row in data.body.list
  tr
    td= row.tx_date
    td= row.tx_acc
    td= row.tx_amount`
    });
  });

  after(async () => {
    await db.transporter.truncate();
    // await db.letter.truncate();
  });

  describe("Mail service", () => {
    it("Should send data to user", async () => {
      const data = {
        code: "TXLIST",
        to: "id102@tadbox.com",
        body: {
          username: "Alex",
          date: "01.01.2019",
          list: [
            {
              tx_date: "01.01.2019",
              tx_acc: "12321",
              tx_amount: 111
            },
            {
              tx_date: "01.01.2019",
              tx_acc: "12321",
              tx_amount: 111
            },
            {
              tx_date: "01.01.2019",
              tx_acc: "12321",
              tx_amount: 111
            }
          ]
        }
      };
      const res = await service.runServiceMethod({
        method: "send",
        data,
        realmId: ENV.realmId
      });
      res.should.have.deep.property("success", true);
    });
  });
});
