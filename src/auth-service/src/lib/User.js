import db from "@lib/db";
import crypto from "crypto";
import MemStore from "@lib/memstore";
import { equalsIgnoringCase, CONSTANTS } from "./Global";
import Signup from "./Signup";
import {
  findUserRoleAndCheckAccess,
  hashPassword,
  createSalt
} from "@lib/utils";

const Op = db.Sequelize.Op;

async function getProfileDetails(data, realmId, userId) {
  const user = await db.user.findOne({
    attributes: [
      "role_id",
      "organization_id",
      "id",
      "name",
      "email",
      "preferred_language"
    ],
    where: { id: userId, realm: realmId },
    raw: true
  });
  const role = await db.role.findOne({
    attributes: ["role"],
    where: { id: user.role_id },
    raw: true
  });
  const organization = await db.organization.findByPk(user.organization_id, {
    raw: true,
    attributes: [
      "is_billing_enabled",
      "is_report_template_generator_enabled",
      "sandbox_access_status"
    ]
  });

  let is_billing_enabled = false,
    is_report_template_generator_enabled = false;

  if (organization) {
    is_billing_enabled = organization.is_billing_enabled;
    is_report_template_generator_enabled =
      organization.is_report_template_generator_enabled &&
      organization.sandbox_access_status === 3
        ? true
        : false;
  }

  let access_level;
  if (
    equalsIgnoringCase(role.role, CONSTANTS.ROLE_ADMIN) ||
    equalsIgnoringCase(role.role, CONSTANTS.ROLE_SUPER_ADMIN)
  ) {
    const wialonAccounts = await db.wialon_accounts.findAll({
      where: {
        organization_id: user.organization_id,
        wialon_token: {
          [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }]
        }
      },
      raw: true,
      attributes: ["id", "wialon_token"]
    });
    if (wialonAccounts.length) {
      access_level = 0;
    } else {
      access_level = 1;
    }
  } else {
    const wialonAccountAccesses = await db.wialon_account_accesses.findAll({
      where: {
        user_id: userId
      },
      raw: true
    });

    if (!wialonAccountAccesses.length) {
      access_level = 1;
    } else {
      const wialonAccountIds = wialonAccountAccesses.map(
        (el) => el.wialon_acc_id
      );
      const wialonAccounts = await db.wialon_accounts.findAll({
        where: {
          id: {
            [Op.in]: wialonAccountIds
          },
          wialon_token: {
            [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }]
          }
        },
        raw: true
      });
      if (!wialonAccounts.length) {
        access_level = 1;
      } else {
        access_level = 0;
      }
    }
  }
  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role.role,
      access_level,
      is_billing_enabled,
      is_report_template_generator_enabled,
      preferred_language: user.preferred_language
    };
  }
  throw "USERNOTFOUND";
}

async function updateProfile(data, realmId, userId) {
  if (!data.name && !data.password) {
    throw "NAMEORPASSWORDEXPECTED";
  }

  const user = await db.user.findOne({
    where: { id: userId, realm: realmId }
  });

  if (data.name) {
    user.name = data.name;
  }

  if (data.password) {
    const newSalt = createSalt();
    user.salt = newSalt;
    user.pass = hashPassword(data.password, newSalt);
  }

  const res = await user.save();

  if (res) {
    return (
      true,
      {
        success: true,
        id: res.dataValues.id,
        name: res.dataValues.name,
        email: res.dataValues.email
      }
    );
  }

  throw "USERNOTFOUND";
}

async function changePassword(data, realmId, userId) {
  const res = await db.user.findOne({
    raw: true,
    where: { id: userId, realm: realmId },
    attributes: ["id", "pass", "salt"]
  });

  if (res) {
    if (res.pass == hashPassword(data.password, res.salt)) {
      const newSalt = createSalt();
      await db.user.update(
        { pass: hashPassword(data.new_password, newSalt), salt: newSalt },
        {
          where: { id: userId, realm: realmId }
        }
      );

      return { success: true };
    }
    throw "PASSWORDSDONOTMATCH";
  }
  throw "ERROR";
}

async function passwordReminder(data, realmId) {
  if (!data.email) throw "EMAILEXPECTED";

  const token = crypto.randomBytes(12).toString("hex");

  const user = await db.user.findOne({
    where: { email: data.email, realm: realmId, removed: 0 }
  });

  if (user != null) {
    const newSalt = createSalt();
    await user.update({
      salt: newSalt,
      pass: hashPassword(token, newSalt)
    });

    data.email_code = "remind-password";
    data.token = token;
    Signup.sendEmail(data, realmId);
  }
  // let transporter = await nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   auth: {
  //     user: "rosina.romaguera@ethereal.email",
  //     pass: "Ssx1mr99V51aWZmp5v"
  //   }
  // });

  // let info = await transporter.sendMail({
  //   from: "rosina.romaguera@ethereal.email",
  //   to: data.email,
  //   subject: "Password reminder",
  //   text: `New password: ${token}`
  // });
  return { success: true };
}

async function confirmEmail(data, realmId) {
  // if (!data.email) throw "EMAILEXPECTED";
  // const user = await db.user.findOne({
  //   where: { email: data.email, realm: realmId }
  // });
  // if (user != null) {
  //   let transporter = await nodemailer.createTransport({
  //     host: "smtp.ethereal.email",
  //     port: 587,
  //     auth: {
  //       user: "rosina.romaguera@ethereal.email",
  //       pass: "Ssx1mr99V51aWZmp5v"
  //     }
  //   });
  //   let verificationCode = Math.floor(100000 + Math.random() * 900000);
  //   let info = await transporter.sendMail({
  //     from: "jrosina.romaguera@ethereal.email",
  //     to: user.dataValues.email,
  //     subject: "Confirm Email",
  //     text: `${verificationCode}`
  //   });
  //   await MemStore.set("usr" + data.email + realmId, verificationCode, 600);
  //   return { success: !!info.messageId };
  // }
  // throw "USERNOTFOUND";
}

// async function verifyCode(data, realmId) {
//   if (!data.email) throw "EMAILEXPECTED";
//   if (!data.code) throw "ACTIVATIONCODEREQUIRED";

//   const user = await db.user.findOne({
//     where: { email: data.email }
//   });
//   if (user.is_active) {
//     throw "EMAILALREADYVERIFIED";
//   } else {
//     if (user) {
//       await user.update({
//         is_active: true
//       });
//     }

//     return { success: true };
//   }
// }

async function toggleUserStatus(data, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId);

  if (data.user_id == userId) throw "USERCANNOTBLOCKTHEMSELF";

  let res;
  const oneUser = await db.user.findOne({
    where: {
      id: data.user_id,
      organization_id: user.organization_id
    }
  });

  if (oneUser && oneUser.dataValues) {
    oneUser.is_active = !oneUser.is_active;
    if (!oneUser.is_active) {
      oneUser.is_blocked_by_admin = true;
    } else {
      oneUser.is_blocked_by_admin = false;
    }
    res = await oneUser.save();
  } else {
    throw "USERNOTFOUND";
  }

  return { success: true, res };
}

async function changeUserAccessLevel(data, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId);

  let res;
  const oneUser = await db.user.findOne({
    where: {
      id: data.user_id,
      organization_id: user.organization_id
    }
  });

  if (oneUser && oneUser.dataValues) {
    oneUser.userlevel = data.access_level;
    res = await oneUser.save();
  } else {
    throw "USERNOTFOUND";
  }

  return { success: true, res };
}

async function getLoginedUsers() {
  let userList = await MemStore.get("users");
  let result = await checkLoginedUsers(userList);
  if (result.finalString && result.finalString.length > 0) {
    return { success: true, users: userList };
  }
}

async function checkLoginedUsers(userList) {
  if (!userList) return {};
  let arrayWithValues = userList.split(";");
  let arrayWithNewValues = userList.split(";");
  for (let i = 0; i < arrayWithValues.length; i++) {
    let idAndToken = arrayWithValues[i].split(":");
    let resultOfFind = await MemStore.get("usr" + idAndToken[1]);
    if (
      resultOfFind == null &&
      arrayWithNewValues.indexOf(idAndToken[0] + ":" + idAndToken[1]) > -1
    ) {
      arrayWithNewValues.splice(
        arrayWithNewValues.indexOf(idAndToken[0] + ":" + idAndToken[1]),
        1
      );
    }
  }
  let finalString = arrayWithNewValues.join(";");
  await MemStore.set("users", finalString);
  return { finalString };
}

async function getCustomReportAccess(data, realmId, userId) {
  const user = await db.user.findOne({
    where: { id: userId },
    attributes: ["custom_report_access"],
    raw: true
  });

  if (user) {
    return { success: true, customReportAccess: user.custom_report_access };
  }

  throw "USERNOTFOUND";
}

async function setCustomReportAccess(data, realmId, userId) {
  let res = {};
  const user = await db.user.findOne({
    where: { id: userId }
  });

  if (user) {
    user.custom_report_access = data.customReportAccess;
    res = await user.save();
  } else {
    throw "USERNOTFOUND";
  }

  return { success: true, res };
}

async function updatePreferredLang({ lang }, realmId, userId) {
  await db.user.update(
    {
      preferred_language: lang
    },
    {
      where: {
        id: userId
      }
    }
  );

  return { success: true };
}

export default {
  getProfileDetails,
  updateProfile,
  changePassword,
  passwordReminder,
  confirmEmail,
  // verifyCode,
  toggleUserStatus,
  changeUserAccessLevel,
  getLoginedUsers,
  getCustomReportAccess,
  setCustomReportAccess,
  findUserRoleAndCheckAccess,
  updatePreferredLang
};
