import passwordValidator from "password-validator";
import Captcha from "./Captcha";
import MemStore from "@lib/memstore";
import db from "@lib/db";
import Cryptr from "cryptr";
const cryptr = new Cryptr("LJ273L48vaDKkQ6D");
import Queue from "@lib/queue";
import { CONSTANTS } from "./Global";
import passwordGenerator from "generate-password";
import User from "./User";
import { log } from "@lib/log";
import { hashPassword, createSalt } from "@lib/utils";

const passwordSchema = new passwordValidator();

passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(40) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits() // Must have digits
  .has()
  .not()
  .spaces(); // Should not have spaces
//.is().not().oneOf(['Passw0rd', 'Password123']);

function checkPersonalSignupData(data) {
  if (
    !data.email ||
    !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      data.email
    )
  )
    throw "INVALIDEMAIL";

  if (!passwordSchema.validate(data.password)) throw "INVALIDPASSWORD";

  // if (data.type == 1 && !data.legalname) throw "LEGALNAMEISEMPTY"; // id102 comment 26 August 2020: not used currently

  return true;
}

async function checkUniqueUser(data, realmId) {
  return !(await db.user.count({
    where: { email: data.email, realm: realmId, removed: 0 }
  }));
}

async function signupAdmin(data, realmId) {
  try {
    if (!(await Captcha.checkCaptcha(data))) throw "CAPTCHAEXPECTED";

    if (!checkPersonalSignupData(data)) return;

    if (!(await checkUniqueUser(data, realmId))) throw "USEREXISTS";

    data.realm = realmId;
    data.salt = createSalt();
    data.pass = hashPassword(data.password, data.salt);
    const role = await db.role.findOne({
      where: { role: "Admin" }
    });

    data.role_id = role.dataValues.id;

    const organization = await db.organization.create({
      organization_name: data.organization_name
    });

    data.organization_id = organization.dataValues.id;
    if (!data.wialon_username) {
      data.wialon_username = "Wialon Account";
    }
    let lastNumber = await db.wialon_accounts.findOne({
      attributes: [db.sequelize.fn("MAX", db.sequelize.col("id"))],
      raw: true
    });

    let objectForWA = {
      id: lastNumber.max + 1,
      organization_id: organization.dataValues.id,
      wialon_username: data.wialon_username,
      wialon_token: data.wialon_token || null,
      wialon_hosting_url: data.wialon_hosting_url,
      removed: 0
    };
    await db.wialon_accounts.create(objectForWA);

    await addGenericReports(data.organization_id);
    await addDefaultPackage(data.organization_id);

    data.userlevel = 2; //by default giving all userlevel access to admin
    data.is_active = false;
    let user = await db.user.create(data);

    //@Vaibhav Mali @Date:13 Jan 2020...Added code for sending mail.
    data.code = Math.floor(100000 + Math.random() * 900000)
      .toString()
      .substring(0, 4);
    await MemStore.set("usr" + data.email + realmId, data.code, 86400);

    data.to = data.email;
    data.link =
      CONSTANTS.REDIRECT_DOMAIN +
      CONSTANTS.REDIRECT_ACTIVATE_EMAIL_URL +
      `?email=${data.email}&code=${data.code}`;
    data.link = data.link.replace("+", "%2B");

    await MemStore.del("cpt" + data.token);

    data.email_code = "signup-admin";
    sendEmail(data, realmId);
    log("Successful signup request for admin user", arguments, {
      profile: user.id
    });
    return user.toJSON();
  } catch (e) {
    log("Failed to sign up admin user", arguments, {
      level: "error",
      stack: e.stack || e.message || e,
      details: {
        email: data.email
      }
    });
  }
}

async function verifyCode(data, realmId) {
  if (!data.email) throw "EMAILEXPECTED";
  if (!data.code) throw "ACTIVATIONCODEREQUIRED";

  let code = await MemStore.get("usr" + data.email + realmId);
  if (data.code != code) throw "INVALIDACTIVATIONCODE";

  const user = await db.user.findOne({
    where: { email: data.email }
  });

  if (user.is_active) {
    throw "EMAILALREADYVERIFIED";
  } else {
    if (user) {
      await user.update({
        is_active: true
      });
    }

    return { success: true };
  }
}

async function sendEmail(data, realmId) {
  if (data.lang) {
    data.lang = data.lang.toLowerCase();
  }
  Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: data.lang || "en",
      code: data.email_code,
      to: data.email,
      body: data
    },
    realmId
  });
  return data;
}

async function addGenericReports(organization_id) {
  //Get all generic routes
  const routes = await db.route.findAll({ where: { type: 1 } });

  const roles = await db.role.findAll({
    where: {
      role: { [db.Sequelize.Op.ne]: "SuperAdmin" }
    }
  });

  let lastNumber = await db.Permissions.findOne({
    attributes: [db.sequelize.fn("MAX", db.sequelize.col("id"))],
    raw: true
  });

  lastNumber = lastNumber.max;
  routes.forEach((route) => {
    roles.forEach((role) => {
      lastNumber++;
      let permission = db.Permissions.build({
        id: lastNumber,
        route_id: route.id,
        role_id: role.id,
        organization_id: organization_id,
        is_permissible: true,
        ctime: new Date(),
        mtime: new Date()
      });
      permission = permission.save();
    });
  });
  return true;
}

async function addDefaultPackage(organization_id) {
  let defaultPkg = await db.rates_package.findOne({
    where: {
      package_name: { [db.Sequelize.Op.eq]: "Default_Package" }
    }
  });

  if (defaultPkg != null) {
    await db.package_subscription.create({
      organization_id: organization_id,
      rates_package_id: defaultPkg.dataValues.id,
      from_date: new Date()
    });
  }

  return true;
}

async function signupUser(data, realmId) {
  if (!(await Captcha.checkCaptcha(data))) throw "CAPTCHAEXPECTED";

  try {
    if (!checkPersonalSignupData(data)) return;
    if (!(await checkUniqueUser(data, realmId))) throw "USEREXISTS";

    data.realm = realmId;
    data.salt = createSalt();
    data.pass = hashPassword(data.password, data.salt);
    const role = await db.role.findOne({
      where: { role: "User" }
    });

    let user;

    const organization = await db.organization.findOne({
      where: { id: data.organization_id }
    });

    if (!organization) throw "ORGANIZATIONNOTFOUND";

    data.role_id = role.dataValues.id;
    data.is_active = true;

    user = await db.user.create(data);

    await MemStore.del("cpt" + data.token);

    log("Successful signup request for a user", arguments, {
      profile: user.id
    });
    user = user.toJSON();
    user.success = true;
    return user;
  } catch (e) {
    log("Failed to sign up a user", arguments, {
      level: "error",
      stack: e.stack || e.message || e,
      details: {
        data
      }
    });
    return e;
  }
}

async function userVerification(data, realmId) {
  let decryptedString;
  try {
    decryptedString = cryptr.decrypt(data.hash);
  } catch (err) {
    throw "INVALIDURL";
  }

  let emailIndex = decryptedString.lastIndexOf("+");
  let orgIndex = decryptedString.lastIndexOf("+") + 1;

  data.email = decryptedString.slice(0, emailIndex);
  data.organization_id = decryptedString.substr(orgIndex);

  const organisation = await db.organization.findOne({
    where: { id: data.organization_id }
  });

  if (!organisation) throw "INVALIDURL";

  if (!(await checkUniqueUser(data, realmId))) throw "USEREXISTS";

  return { success: true, data: data };
}

async function inviteUser(data, realmId, userId) {
  //console.log("@@@@@inviteUser data= "+ JSON.stringify(data));

  await User.findUserRoleAndCheckAccess(userId);

  if (!(await checkUniqueUser(data, realmId))) throw "USEREXISTS";

  const res = await db.user.findOne({
    where: { id: userId, realm: realmId }
  });

  data.organization_id = res.dataValues.organization_id;
  data.to = data.email;
  const encryptedString = cryptr.encrypt(
    `${data.email}+${data.organization_id}`
  );

  data.code = `${res.dataValues.email}+${data.email}+${new Date().getTime()}`;
  data.link =
    CONSTANTS.REDIRECT_DOMAIN +
    CONSTANTS.REDIRECT_INVITE_USER_URL +
    "?id=" +
    encryptedString;
  data.to = data.email;

  data.email_code = "invite-user";
  sendEmail(data, realmId);

  // console.log("Email Status: " + JSON.stringify(result || {}));
  // await MemStore.del("cpt" + data.token);
  return { success: true, encrypted_string: encryptedString };
}

async function registrationForPresentation(data, realmId, userId) {
  if (data.lang) {
    data.lang = data.lang.toLowerCase();
  }
  if (
    !data.lang ||
    typeof data.lang != "string" ||
    (data.lang != "ru" && data.lang != "en")
  ) {
    data.lang = "en";
  }

  data.email = data.email.toLowerCase().trim();

  const requestRecord = await db.request_to_registration.create({
    name: data.name,
    company: data.company,
    website: data.website,
    is_wialon_accounts_exists: data.is_wialon_accounts_exists,
    wishes: data.wishes,
    phone_number: data.phone_number,
    email: data.email,
    realm_id: realmId,
    lang: data.lang,
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });

  // data.email_code = "registration-for-presentation";
  // data.to = data.email;
  // sendEmail(data, realmId);

  const emailForNotification = await db.system_variable.findOne({
    where: {
      code: "EMAIL_FOR_NOTIFICATIONS_ABOUT_REGISTRATION"
    },
    raw: true
  });

  if (emailForNotification) {
    data.email_code = "notification-for-admin-about-request";
    data.userEmail = data.email;
    data.email = emailForNotification.value;

    sendEmail(data, realmId);
  }

  return { success: true, id: requestRecord.id };
}

async function resendVerifyCode(data, realmId) {
  const user = await db.user.findOne({
    where: {
      removed: 0,
      realm: realmId,
      email: data.email
    },
    raw: true
  });

  if (!user) {
    throw "USERNOTREGISTERED";
  }

  if (user.is_blocked_by_admin) {
    throw "USERHASBENNBLOCKEDBYADMIN";
  }

  if (user.is_active) {
    throw "USERALREADYACTIVATED";
  }

  data.code = Math.floor(100000 + Math.random() * 900000)
    .toString()
    .substring(0, 4);
  if (!data.is_test) {
    if (await MemStore.get("usr" + data.email + realmId)) {
      throw "ALOTOFREQUESTSRESENDCODE";
    }
  }
  await MemStore.set("usr" + data.email + realmId, data.code, 86400);
  data.to = data.email;
  data.link =
    CONSTANTS.REDIRECT_DOMAIN +
    CONSTANTS.REDIRECT_ACTIVATE_EMAIL_URL +
    `?email=${data.email}&code=${data.code}`;
  data.link = data.link.replace("+", "%2B");

  data.email_code = "signup-admin";
  sendEmail(data, realmId);
  return { success: true };
}

async function signupAdminFromAdminPanel(data) {
  const pass = passwordGenerator.generate({
    length: 16,
    numbers: true,
    symbols: true,
    strict: true
  });
  data.password = pass;

  try {
    checkPersonalSignupData(data);
  } catch (e) {
    return { success: false, title: e, message: "Invalid passed data." };
  }

  if (!(await checkUniqueUser(data, data.realm_id)))
    return {
      success: false,
      title: "USEREXISTS",
      message: "User with passed email already exists in the system!"
    };
  data.salt = createSalt();
  data.pass = hashPassword(data.password, data.salt);
  data.realm = data.realm_id;
  data.is_active = true;

  const role = await db.role.findOne({
    where: { role: "Admin" },
    raw: true,
    attributes: ["id"]
  });

  data.role_id = role.id;

  const organization = await db.organization.create({
    organization_name: data.organization_name
  });
  data.organization_id = organization.dataValues.id;

  await addGenericReports(data.organization_id);
  await addDefaultPackage(data.organization_id);

  data.userlevel = 2; //by default giving all userlevel access to admin
  const user = await db.user.create(data);

  await db.request_to_registration.update(
    {
      status: 1,
      mtime: new Date()
    },
    {
      where: {
        id: data.id_of_record
      }
    }
  );

  data.to = data.email;
  data.email_code = "inform-user-about-success-registration";
  sendEmail(data, data.realm_id);
  return { success: true, id: user.id };
}

async function rejectUserRequest(data) {
  const request = await db.request_to_registration.findByPk(data.id, {
    raw: true
  });

  if (request) {
    await db.request_to_registration.update(
      { status: 2 },
      {
        where: { id: data.id }
      }
    );

    data.email_code = "inform-user-about-reject-request";
    data.to = data.email;

    sendEmail(data, data.realm_id);

    return { success: true };
  } else {
    return {
      success: false,
      message: "Request not found",
      title: "USERNOTFOUND"
    };
  }
}

export default {
  signupAdmin,
  signupUser,
  inviteUser,
  userVerification,
  verifyCode,
  sendEmail,
  registrationForPresentation,
  resendVerifyCode,
  signupAdminFromAdminPanel,
  rejectUserRequest
};
