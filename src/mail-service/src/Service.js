import Base from "@lib/base";
import db from "@lib/db";
import nodemailer from "nodemailer";
const pug = require("pug");
import FileProvider from "@lib/fileprovider";

export default class Service extends Base {
  publicMethods() {
    return {
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods"
      },
      preview: {
        description: "preview mail body"
      },
      send: {
        realm: true,
        method: this.send,
        description: "send mail"
      }
    };
  }

  async preview(data) {
    const html = await pug.render(data.tpl, data.data);
    return { html };
  }

  async createMailTpl(data, realmId) {
    const transporter = await db.transporter.findOne({ attributes: ["id"] });

    const dd = {
      transporter: transporter.get("id"),
      realm: realmId,
      code: data.code,
      name: data.code,
      lang: "en",
      data: JSON.stringify(data, null, 4)
    };

    await db.letter.create(dd);
  }

  async send(data, realmId) {
    if (process.env.NODE_ENV === "localtest") {
      return { success: true };
    }
    if (!!data.preferred_language) {
      data.lang = data.preferred_language;
    }

    const lang = data.lang ? data.lang.toLowerCase() : "en";

    const attributes = [
      "id",
      "from_email",
      "subject",
      "text",
      "html",
      "transporter",
      "data",
      "attachment_name"
    ];

    let letterDetails = await db.letter.findOne({
      where: {
        realm: realmId,
        code: data.code,
        lang
      },
      attributes
    });

    if (!letterDetails) {
      letterDetails = await db.letter.findOne({
        where: {
          realm: realmId,
          code: data.code,
          lang: "en"
        },
        attributes
      });
    }

    if (!letterDetails) {
      await this.createMailTpl(data, realmId);
      throw "MAILTEMPLATENOTFOUND";
    }
    if (!letterDetails.get("data")) {
      await db.letter.update(
        {
          data: JSON.stringify(data, null, 4)
        },
        { where: { id: letterDetails.get("id") } }
      );
    }

    let transporterData = await db.transporter.findOne({
      where: {
        id: letterDetails.get("transporter")
      }
    });

    let html = await pug.render(letterDetails.get("html"), data);
    let text = await pug.render(letterDetails.get("text"), data);

    if (letterDetails == null) throw "NOLETTERDETAILS";

    const opt = {
      host: transporterData.get("host_transporter"),
      port: transporterData.get("port_transporter"),
      // secure: transporterData.get("secure_transporter"),
      auth: {
        user: transporterData.get("user_transporter"),
        pass: transporterData.get("password_transporter")
      }
    };

    // if (!transporterData.get("secure_transporter")) {
    //   opt.tls = {
    //     rejectUnauthorized: false
    //   };
    // }

    let transporter = await nodemailer.createTransport(opt);

    if (letterDetails.get("attachment_name") != null) {
      let fileBase64 = await FileProvider.pull({
        code: letterDetails.get("attachment_name")
      });
      data.attachments = [
        {
          filename: `${fileBase64.name}`,
          path: fileBase64.data
        }
      ];
    }

    let info = await transporter.sendMail({
      from: letterDetails.get("from_email"),
      to: data.to,
      subject: data.subject || letterDetails.get("subject"),
      text,
      html,
      attachments: data.attachments || [],
      cc: data.cc ? data.cc : ""
    });

    return { success: !!info.messageId };
  }
}
