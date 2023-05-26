import db from "@lib/db";
import uuidGenerator from "uuid";
import {
  findUserRoleAndCheckAccess,
  CONSTANTS,
  equalsIgnoringCase
} from "@lib/utils";

const Op = db.Sequelize.Op;

async function getAllAggregators(data, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId);
  const { start: offset = 0, limit = 100 } = data;
  const { rows: aggregators, count } = await db.aggregator.findAndCountAll({
    where: {
      removed: 0
    },
    attributes: [
      "id",
      "name",
      "api_key_required",
      "log_pas_required",
      "contract_number_required"
    ],
    offset,
    limit,
    raw: true
  });
  const organizationPermissions = await db.organization_aggregator_account_permissions.findAll(
    {
      where: {
        organization_id: user.organization_id,
        removed: 0
      },
      attributes: ["aggregator_id"],
      raw: true
    }
  );

  for (let aggregator of aggregators) {
    aggregator.is_organization_has_access = false;
    for (let organizationPermission of organizationPermissions) {
      if (aggregator.id == organizationPermission.aggregator_id) {
        aggregator.is_organization_has_access = true;
      }
    }
  }
  return { success: true, items: aggregators, count, offset, limit };
}

async function getAllAggregatorOrganizationRecords(data, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId);
  const allowedAggregators = await db.organization_aggregator_account_permissions.findAll(
    {
      where: {
        organization_id: user.organization_id,
        removed: 0
      },
      attributes: ["id", "aggregator_id"],
      raw: true
    }
  );

  if (!allowedAggregators.length) {
    throw "NOAVAILABLEAGGREGATORS";
  }
  const allowedAggregatorsIds = allowedAggregators.map(
    (el) => el.aggregator_id
  );

  const { start: offset = 0, limit = 100 } = data;
  const {
    rows: organizationAggregatorAccounts,
    count
  } = await db.organization_aggregator_accounts.findAndCountAll({
    where: {
      organization_id: user.organization_id,
      aggregator_id: {
        [Op.in]: allowedAggregatorsIds
      },
      removed: 0
    },
    offset,
    limit,
    include: [{ model: db.aggregator, attributes: ["id", "name"] }],
    order: [["ctime", "DESC"]]
  });

  return {
    success: true,
    items: organizationAggregatorAccounts,
    count,
    offset,
    limit
  };
}

async function getAllOrganizationAggregatorAccounts(data, realmId, userId) {
  const { user, role } = await findUserRoleAndCheckAccess(userId, false);
  const { start: offset = null, limit = null } = data;
  const allowedAggregators = await db.organization_aggregator_account_permissions.findAll(
    {
      where: {
        organization_id: user.organization_id,
        removed: 0
      },
      attributes: ["id", "aggregator_id"],
      raw: true
    }
  );

  if (!allowedAggregators.length) {
    throw "NOAVAILABLEAGGREGATORS";
  }
  const allowedAggregatorsIds = allowedAggregators.map(
    (el) => el.aggregator_id
  );

  let whereObject = {
    organization_id: user.organization_id,
    aggregator_id: allowedAggregatorsIds
  };

  if (equalsIgnoringCase(role.role, CONSTANTS.ROLE_USER)) {
    const userPermissionsRaw = await db.user_organization_aggregator_account_permissions.findAll(
      {
        attributes: ["id", "organization_aggregator_account_id"],
        raw: true,
        where: {
          user_id: userId
        }
      }
    );

    if (userPermissionsRaw.length === 0) {
      throw "NOONEACCOUNTALLOWEDTOUSER";
    }

    const allowedAccountsForUser = userPermissionsRaw.map(
      (account) => account.organization_aggregator_account_id
    );
    whereObject.id = allowedAccountsForUser;
  }

  const {
    count,
    rows
  } = await db.organization_aggregator_accounts.findAndCountAll({
    attributes: ["id", "name"],
    where: whereObject,
    include: [{ model: db.aggregator, attributes: ["id", "name"] }],
    limit,
    offset,
    order: [["ctime", "DESC"]]
  });

  const response = rows.map((record) => record.dataValues);

  return { count, rows: response, success: true };
}

async function attachApiKeyLoginPasswordToOrganization(data, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId);
  const aggregator = await db.aggregator.findOne({
    where: {
      id: data.aggregator_id
    },
    raw: true
  });
  if (!aggregator) {
    throw "AGGREGATORNOTFOUND";
  }
  const allowedAggregator = await db.organization_aggregator_account_permissions.findOne(
    {
      where: {
        organization_id: user.organization_id,
        aggregator_id: aggregator.id
      },
      attributes: ["id"],
      raw: true
    }
  );
  if (!allowedAggregator) {
    throw "NOAVAILABLEAGGREGATOR";
  }

  if (
    aggregator &&
    aggregator.log_pas_required &&
    (!data.login || !data.password)
  ) {
    throw "LOGINPASSWORDISREQUIRED";
  }

  if (aggregator && aggregator.api_key_required && !data.api_key) {
    throw "APIKEYISREQUIRED";
  }

  if (
    aggregator &&
    aggregator.contract_number_required &&
    !data.contract_number
  ) {
    throw "CONTRACTNUMBERISREQUIRED";
  }
  const queryData = {
    organization_id: user.organization_id,
    aggregator_id: data.aggregator_id,
    contract_number: data.contract_number,
    name: data.name,
    api_key: data.api_key,
    login: data.login,
    password: data.password,
    removed: 0,
    maker: userId
  };
  if (data.record_id) {
    queryData.id = data.record_id;
    queryData.mtime = new Date();
  } else {
    queryData.id = uuidGenerator.v4();
    queryData.ctime = new Date();
  }
  await db.organization_aggregator_accounts.upsert(queryData);

  return { success: true };
}

async function deleteCredentialsForAggregator(data, realmId, userId) {
  await findUserRoleAndCheckAccess(userId);
  await db.organization_aggregator_accounts.destroy({
    where: {
      id: data.organization_aggregator_account_id
    }
  });

  return { success: true };
}

async function updateStatusOrganizationAggregatorAccount(data) {
  await db.organization_aggregator_accounts.update(
    {
      status: data.status,
      mtime: new Date()
    },
    {
      where: {
        id: data.organization_aggregator_account_id
      },
      raw: true
    }
  );
  return {
    success: true
  };
}

async function setUserAccess(data, realmId, userId) {
  await findUserRoleAndCheckAccess(userId);
  const setAccessData = [];
  const revokeAccessIds = [];
  data.organization_aggregator_account_permissions.map(
    (organization_aggregator_account) => {
      if (organization_aggregator_account.is_user_has_access) {
        setAccessData.push({
          user_id: data.user_id,
          organization_aggregator_account_id:
            organization_aggregator_account.organization_aggregator_account_id,
          maker: userId
        });
      } else {
        revokeAccessIds.push(
          organization_aggregator_account.organization_aggregator_account_id
        );
      }
    }
  );
  if (setAccessData.length) {
    await db.user_organization_aggregator_account_permissions.bulkCreate(
      setAccessData,
      { ignoreDuplicates: true }
    );
  }
  if (revokeAccessIds.length) {
    await db.user_organization_aggregator_account_permissions.destroy({
      where: {
        user_id: data.user_id,
        organization_aggregator_account_id: revokeAccessIds
      }
    });
  }
  return { success: true };
}

async function getUserAggregatorAccountPermissions(data, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(data.user_id, false);
  const { start: offset = 0, limit = 100 } = data;
  const {
    rows: organizationAggregatorAccounts,
    count
  } = await db.organization_aggregator_accounts.findAndCountAll({
    where: {
      organization_id: user.organization_id,
      removed: 0
    },
    attributes: ["id", "name"],
    offset,
    limit,
    raw: true
  });
  const userPermissions = await db.user_organization_aggregator_account_permissions.findAll(
    {
      where: {
        user_id: data.user_id,
        removed: 0
      },
      raw: true
    }
  );
  for (let organizationAggregatorAccount of organizationAggregatorAccounts) {
    organizationAggregatorAccount.is_user_has_access = false;
    for (let permission of userPermissions) {
      if (
        permission.organization_aggregator_account_id ==
        organizationAggregatorAccount.id
      ) {
        organizationAggregatorAccount.is_user_has_access = true;
      }
    }
  }
  return {
    success: true,
    items: organizationAggregatorAccounts,
    count,
    offset,
    limit
  };
}

export default {
  getAllAggregators,
  getAllAggregatorOrganizationRecords,
  attachApiKeyLoginPasswordToOrganization,
  deleteCredentialsForAggregator,
  updateStatusOrganizationAggregatorAccount,
  setUserAccess,
  getUserAggregatorAccountPermissions,
  getAllOrganizationAggregatorAccounts
};
