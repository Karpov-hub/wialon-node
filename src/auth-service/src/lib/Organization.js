import db from "@lib/db";
import User from "./User";
import { findUserRoleAndCheckAccess, CONSTANTS } from "@lib/utils";
import Queue from "@lib/queue";

async function getOrganizationDetails(data, realmId, userId) {
  const user = await db.user.findOne({
    attributes: ["organization_id"],
    where: { id: userId, removed: 0 },
    raw: true
  });

  const organization = await db.organization.findOne({
    where: { id: user.organization_id, removed: 0 },
    raw: true
  });

  return { success: true, organization };
}

async function updateOrganizationDetails(data, realmId, userId) {
  //console.log("@@@@@@@@ updateOrganizationDetails data = ", JSON.stringify(data));

  const { user } = await User.findUserRoleAndCheckAccess(userId);

  let oldOrganization = await db.organization.findOne({
    where: { id: user.organization_id }
  });

  if (oldOrganization) {
    if (data.organization_name) {
      oldOrganization.organization_name = data.organization_name;
    }

    const organization = await oldOrganization.save();

    return { success: true, organization };
  }

  throw "RECORDNOTFOUND";
}

async function getOrganizationUsers(data, realmId, userId) {
  let { start: offset = null, limit = null } = data;
  const { user } = await User.findUserRoleAndCheckAccess(userId);

  await db.user.belongsTo(db.role, { targetKey: "id", foreignKey: "role_id" });

  let { count, rows } = await db.user.findAndCountAll({
    attributes: [
      "id",
      "name",
      "email",
      "organization_id",
      "is_active",
      "userlevel"
    ],
    where: { organization_id: user.organization_id, removed: 0 },
    offset,
    limit,
    include: [{ model: db.role, attributes: ["role", ["id", "role_id"]] }],
    order: [
      ["role_id", "asc"],
      ["name", "asc"]
    ]
  });

  return { success: true, users: rows, count, offset, limit };
}

async function requestToGetSandboxAccess(data, realmId, userId) {
  const throwStatuses = [
    { status: 2, throw: "ORGANIZATIONALREADYREQUESTEDSANDBOXACCESS" },
    { status: 3, throw: "ORGANIZATIONALREADYHASSANDBOXACCESS" },
    { status: 4, throw: "ORGANIZATIONSANDBOXREQUESTWASREJECTED" },
    { status: 5, throw: "ORGANIZATIONSANDBOXACCESSWASDEACTIVATED" }
  ];
  const { user } = await findUserRoleAndCheckAccess(userId);

  const organization = await db.organization.findOne({
    where: {
      id: user.organization_id
    }
  });

  if (!organization) {
    throw "USERHASNOORGANIZATION";
  }

  const throwObject = throwStatuses.find(
    (obj) => obj.status === organization.sandbox_access_status
  );
  if (throwObject) {
    throw throwObject.throw;
  }

  organization.sandbox_access_status = 2;
  await organization.save();

  Queue.broadcastJob("call-admin", {
    model: "Crm.modules.organizations.model.OrganizationsModel",
    method: "onChange",
    data: {}
  });

  Queue.newJob("mail-service", {
    method: "send",
    data: {
      to: CONSTANTS.REPORT_REQ_EMAIL_TO,
      cc: CONSTANTS.REPORT_REQ_EMAIL_CC,
      code: "notify-admin-about-request-on-sandbox",
      lang: data.lang,
      body: {
        user_id: user.id,
        user_email: user.email,
        organization_name: organization.organization_name
      }
    },
    realmId,
    userId
  });

  return {
    success: true,
    currentStatus: organization.sandbox_access_status
  };
}

async function notifyOrganizationAdminsAboutAccessToSandbox(data) {
  const adminRole = await db.role.findOne({
    attributes: ["id"],
    raw: true,
    where: {
      role: CONSTANTS.ROLE_ADMIN
    }
  });

  const organizationAdmins = await db.user.findAll({
    where: {
      organization_id: data.organization_id,
      removed: 0,
      is_blocked_by_admin: false,
      is_active: true,
      role_id: adminRole.id
    }
  });

  _filterUsersByLanguageAndSendThemEmail(organizationAdmins, "EN");
  _filterUsersByLanguageAndSendThemEmail(organizationAdmins, "RU");
}

function _filterUsersByLanguageAndSendThemEmail(organizationAdmins, language) {
  const admins = organizationAdmins.filter(
    (admin) => admin.preferred_language === language
  );

  let emailsAdmins = [],
    stringEmailsAdmins = "";

  if (!!admins && admins.length > 0) {
    emailsAdmins = admins.map((admin) => admin.email);
    stringEmailsAdmins = emailsAdmins.join(",");
  }

  if (stringEmailsAdmins && stringEmailsAdmins.length > 0) {
    Queue.newJob("mail-service", {
      method: "send",
      data: {
        lang: language,
        code: "notify-organization-admin-about-approve-sandbox-request",
        to: stringEmailsAdmins
      },
      realmId: organizationAdmins[0].realm
    });
  }

  return true;
}

export default {
  getOrganizationDetails,
  updateOrganizationDetails,
  getOrganizationUsers,
  requestToGetSandboxAccess,
  notifyOrganizationAdminsAboutAccessToSandbox
};
