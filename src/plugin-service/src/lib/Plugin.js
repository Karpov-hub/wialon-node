import db from "@lib/db";
import { CONSTANTS, findUserRoleAndCheckAccess } from "@lib/utils";
import Queue from "@lib/queue";
import uuid from "uuid/v4";

const plugin_status = {
  new: 0,
  pending: 1,
  approved: 2,
  rejected: 3,
  deactivated: 4
};

async function getPlugin(pluginId) {
  const plugin = await db.plugin.findOne({
    where: {
      id: pluginId
    },
    attributes: ["id", "name"],
    raw: true
  });
  if (!plugin) {
    throw "PLUGINNOTFOUND";
  }
  return plugin;
}

async function getOrganization(organizationId) {
  const organization = await db.organization.findOne({
    where: {
      id: organizationId
    },
    attributes: ["id", "organization_name"],
    raw: true
  });
  if (!organization) {
    throw "ORGANIZATIONNOTFOUND";
  }
  return organization;
}

async function getAllPlugins(data, realm, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId);
  const { start: offset = 0, limit = 100 } = data;
  const { rows: plugins, count } = await db.plugin.findAndCountAll({
    attributes: ["id", "name"],
    where: {
      removed: 0
    },
    offset,
    limit,
    raw: true
  });
  const organizationPlugins = await db.organization_plugin.findAll({
    where: {
      organization_id: user.organization_id,
      removed: 0
    },
    attributes: [
      "id",
      "plugin_id",
      "status",
      "is_cron_enabled",
      "reject_reason",
      "plugin_fees"
    ],
    raw: true
  });
  for (let plugin of plugins) {
    plugin.status = 0;
    plugin.is_cron_enabled = false;
    plugin.reject_reason = null;
    for (let organizationPlugin of organizationPlugins) {
      if (plugin.id === organizationPlugin.plugin_id) {
        plugin.status = organizationPlugin.status;
        plugin.is_cron_enabled = organizationPlugin.is_cron_enabled;
        plugin.reject_reason = organizationPlugin.reject_reason;
      }
    }
  }
  return { success: true, items: plugins, count, offset, limit };
}

async function getApprovedOrganizationPlugins(data, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId, false);
  const { start: offset = 0, limit = 100 } = data;
  const {
    rows: organizationPlugins,
    count
  } = await db.vw_organization_plugins.findAndCountAll({
    where: {
      organization_id: user.organization_id,
      status: plugin_status.approved,
      removed: 0
    },
    attributes: ["id", "plugin_id", "plugin_name"],
    offset,
    limit,
    raw: true
  });

  return { success: true, items: organizationPlugins, count, offset, limit };
}

async function pluginConnectionRequest(data, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId);
  const plugin = await getPlugin(data.plugin_id);
  const organization = await getOrganization(user.organization_id);
  const organizationPlugin = await db.organization_plugin.findOne({
    where: {
      organization_id: user.organization_id,
      plugin_id: data.plugin_id,
      removed: 0
    },
    raw: true
  });
  if (
    organizationPlugin &&
    organizationPlugin.status == plugin_status.pending
  ) {
    throw "PLUGINALREADYREQUESTED";
  }
  if (
    organizationPlugin &&
    organizationPlugin.status == plugin_status.approved
  ) {
    throw "PLUGINALREADYCONNECTED";
  }
  const organizationPluginId = organizationPlugin
    ? organizationPlugin.id
    : uuid();
  await db.organization_plugin.upsert({
    id: organizationPluginId,
    organization_id: user.organization_id,
    plugin_id: data.plugin_id,
    status: plugin_status.pending,
    reject_reason: null,
    maker: userId
  });
  Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: data.lang || "en",
      code: "plugin-request",
      to: CONSTANTS.PLUGIN_REQ_EMAIL_TO,
      body: {
        ...data,
        organization_name: organization.organization_name,
        plugin_name: plugin.name
      }
    },
    realmId: realmId
  }).catch((e) => {
    console.log(
      "plugin-service, pluginConnectionRequest, error on Queue.newJob, error: ",
      e
    );
    throw "MAILSENDINGERROR";
  });
  return { success: true };
}

async function updateStatusOrganizationPlugin(data) {
  const queryUpdate = {
    status: data.status,
    reject_reason: data.reject_reason,
    mtime: new Date()
  };
  switch (data.status) {
    case plugin_status.approved:
      queryUpdate.last_activated_date = new Date();
      queryUpdate.plugin_fees = data.plugin_fees;
      break;
    case plugin_status.deactivated:
      queryUpdate.last_deactivated_date = new Date();
      break;
    case plugin_status.rejected:
      queryUpdate.reject_reason = data.reject_reason;
      break;
  }
  await db.organization_plugin.update(queryUpdate, {
    where: {
      organization_id: data.organization_id,
      plugin_id: data.plugin_id
    },
    raw: true
  });
  const plugin = await getPlugin(data.plugin_id);
  const adminRole = await db.role.findOne({ where: { role: "Admin" } });
  const adminRecipients = await db.user.findAll({
    where: {
      organization_id: data.organization_id,
      role_id: adminRole.id
    },
    raw: true,
    attributes: ["email", "realm"]
  });

  if (data.status == plugin_status.approved) {
    adminRecipients.map((recipient) => {
      Queue.newJob("mail-service", {
        method: "send",
        data: {
          lang: data.lang || "en",
          code: "plugin-request-approve",
          to: recipient.email,
          body: {
            plugin_name: plugin.name
          }
        },
        realmId: recipient.realm
      }).catch((e) => {
        console.log(
          "plugin-service, updateStatusOrganizationPlugin, error on Queue.newJob, error: ",
          e
        );
        throw "MAILSENDINGERROR";
      });
    });
  } else if (data.status == plugin_status.rejected) {
    adminRecipients.map((recipient) => {
      Queue.newJob("mail-service", {
        method: "send",
        data: {
          lang: data.lang || "en",
          code: "plugin-request-reject",
          to: recipient.email,
          body: {
            plugin_name: plugin.name,
            reject_reason: data.reject_reason
          }
        },
        realmId: recipient.realm
      }).catch((e) => {
        console.log(
          "plugin-service, updateStatusOrganizationPlugin, error on Queue.newJob, error: ",
          e
        );
        throw "MAILSENDINGERROR";
      });
    });
  }
  return { success: true };
}

async function toggleCronOrganizationPlugin(data, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId);
  const organizationPlugin = await db.organization_plugin.findOne({
    where: {
      organization_id: user.organization_id,
      plugin_id: data.plugin_id
    },
    raw: true,
    attributes: ["status", "is_cron_enabled"]
  });
  if (!organizationPlugin) {
    throw "ORGANIZATIONPLUGINNOTFOUND";
  }
  if (organizationPlugin.status !== plugin_status.approved) {
    throw "ORGANIZATIONPLUGINNOTAPPROVED";
  }
  const new_cron_status = !organizationPlugin.is_cron_enabled;
  await db.organization_plugin.update(
    {
      is_cron_enabled: new_cron_status,
      mtime: new Date()
    },
    {
      where: {
        organization_id: user.organization_id,
        plugin_id: data.plugin_id
      },
      raw: true
    }
  );
  return { success: true, enabled: new_cron_status };
}

async function calculatePluginsFees(data) {
  let { from_date: fromDate, to_date: toDate } = data;
  fromDate = new Date(fromDate);
  toDate = new Date(toDate);
  const daysOnLastPeriod = Math.ceil((toDate - fromDate) / CONSTANTS.MS_ON_DAY);
  const pluginsFeesArray = [];
  let pluginFeesAmount = 0;
  const {
    rows: organizationPlugins
  } = await db.organization_plugin.findAndCountAll({
    where: {
      organization_id: data.organization_id,
      removed: 0
    },
    include: [{ model: db.plugin, attributes: ["id", "name"] }]
  });

  organizationPlugins.map((organization_plugin) => {
    let pluginFee = 0;
    let daysUnused = 0;
    let daysUsed = 0;
    let lastActivatedDate = null;
    let lastDeactivatedDate = null;

    if (
      organization_plugin.status === plugin_status.approved &&
      organization_plugin.last_deactivated_date
    ) {
      lastDeactivatedDate = new Date(organization_plugin.last_deactivated_date);
      lastActivatedDate = new Date(organization_plugin.last_activated_date);
      daysUnused = Math.ceil(
        (toDate - lastDeactivatedDate) / CONSTANTS.MS_ON_DAY
      );
      daysUnused = getUnusedDays(lastDeactivatedDate, toDate);
      if (daysUnused >= daysOnLastPeriod && lastActivatedDate < fromDate) {
        // if the plugin was deactivated a long time ago, and reactivated again (not in this period) full fees
        pluginFee = organization_plugin.plugin_fees;
      } else if (daysUnused >= daysOnLastPeriod && lastActivatedDate < toDate) {
        // if the plugin was deactivated a long time ago and reactivated in the current period
        daysUsed = getUsedDays(daysOnLastPeriod, fromDate, lastActivatedDate);
        pluginFee =
          (organization_plugin.plugin_fees / daysOnLastPeriod) * daysUsed;
      } else {
        daysUsed = getUsedDays(
          daysOnLastPeriod,
          lastDeactivatedDate,
          lastActivatedDate
        );
        if (daysOnLastPeriod > daysUsed) {
          // if the plugin was deactivated in this period and reactivated again
          pluginFee =
            (organization_plugin.plugin_fees / daysOnLastPeriod) * daysUsed;
        }
      }
    } else if (
      organization_plugin.status === plugin_status.approved &&
      !organization_plugin.last_deactivated_date
    ) {
      // if the plugin is activated and never deactivated
      lastActivatedDate = new Date(organization_plugin.last_activated_date);
      daysUsed = getUsedDays(daysOnLastPeriod, fromDate, lastActivatedDate);
      if (daysOnLastPeriod > daysUsed) {
        // if the plugin is connected in this period
        pluginFee =
          (organization_plugin.plugin_fees / daysOnLastPeriod) * daysUsed;
      } else {
        // if the plugin has been connected for a long time, pay the full commission
        pluginFee = organization_plugin.plugin_fees;
      }
    } else if (
      organization_plugin.last_deactivated_date &&
      organization_plugin.last_activated_date
    ) {
      lastDeactivatedDate = new Date(organization_plugin.last_deactivated_date);
      daysUsed = getUsedDays(daysOnLastPeriod, fromDate, lastDeactivatedDate);
      if (fromDate < lastDeactivatedDate) {
        // if the plugin is deactivated but was used in the last period
        pluginFee =
          (organization_plugin.plugin_fees / daysOnLastPeriod) * daysUsed;
      }
    }
    if (pluginFee) {
      pluginFeesAmount += +pluginFee.toFixed(2);
      pluginsFeesArray.push({
        name: organization_plugin.plugin.name,
        fee: pluginFee.toFixed(2)
      });
    }
  });

  return {
    success: true,
    plugin_fees: pluginsFeesArray,
    plugin_fees_amount: pluginFeesAmount
  };
}
function getUsedDays(daysOnLastPeriod, fromDate, toDate) {
  return (
    daysOnLastPeriod - Math.floor((toDate - fromDate) / CONSTANTS.MS_ON_DAY)
  );
}
function getUnusedDays(fromDate, toDate) {
  return Math.ceil((toDate - fromDate) / CONSTANTS.MS_ON_DAY);
}

export default {
  getAllPlugins,
  getApprovedOrganizationPlugins,
  pluginConnectionRequest,
  updateStatusOrganizationPlugin,
  toggleCronOrganizationPlugin,
  calculatePluginsFees
};
