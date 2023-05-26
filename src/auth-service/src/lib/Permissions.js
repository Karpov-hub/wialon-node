import db from "@lib/db";
import { CONSTANTS, equalsIgnoringCase } from "./Global";
import User from "./User";

async function getPermissionInfo(data, realmId, userId) {
  try {
    const { start: offset = null, limit = null } = data;
    const { user, role } = await User.findUserRoleAndCheckAccess(userId);
    let showFromType = 1;
    //Checked If user is super admin then show basic permission too
    if (equalsIgnoringCase(role.role, CONSTANTS.ROLE_SUPER_ADMIN)) {
      showFromType = 0;
    }

    await db.Permissions.belongsTo(db.role, {
      targetKey: "id",
      foreignKey: "role_id"
    });
    await db.route.hasMany(db.Permissions, {
      targetKey: "permissions",
      foreignKey: "route_id"
    });

    let { count, rows } = await db.route
      .findAndCountAll({
        attributes: [
          ["id", "route_id"],
          "method",
          "service",
          ["report_name", "report"],
          "description",
          "type",
          "requirements",
          "report_id",
          "original_requirements",
          "maker",
          "ctime"
        ],
        where: {
          type: { [db.Sequelize.Op.gte]: showFromType },
          [db.Sequelize.Op.or]: [
            { organization_id: { [db.Sequelize.Op.eq]: null } },
            { organization_id: user.organization_id }
          ]
        },
        offset,
        limit,
        include: [
          {
            model: db.Permissions,
            attributes: [
              "is_permissible",
              "role_id",
              [
                db.sequelize.literal(
                  '(SELECT role FROM roles where id="role_id")'
                ),
                "role_name"
              ]
            ],
            where: {
              [db.Sequelize.Op.or]: [
                { organization_id: { [db.Sequelize.Op.eq]: null } },
                { organization_id: user.organization_id }
              ]
            }
            //,include: [  {   model: db.role, attributes : ['role', ['id', 'role_id']]} ]
          }
        ],
        order: [["ctime", "asc"]]
      })
      .catch((e) => {
        console.log(
          "auth-service, getPermissionInfo, error on getting data from route error: ",
          e
        );
        throw "SEARCHINGERROR";
      });

    let basic = rows.filter((item) => item.type === 0);
    let generic = rows.filter((item) => item.type === 1);
    let customize = rows.filter((item) => item.type === 2);

    rows = {
      basic: basic,
      generic: generic,
      customize: customize
    };

    return { success: true, routes: rows, count, offset, limit };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function changePermission(data, realmId, userId) {
  //  console.log("@@@@@@@@@@@@@@ changePermission data = "+ JSON.stringify(data));

  const { user } = await User.findUserRoleAndCheckAccess(userId);

  let res;
  const permission = await db.Permissions.findOne({
    where: {
      route_id: data.route_id,
      role_id: data.role_id,
      organization_id: user.organization_id
    }
  });

  if (permission && permission.dataValues) {
    permission.is_permissible = data.is_permissible;
    res = await permission.save();
  } else {
    throw "RECORDNOTFOUND";
  }

  return { success: true, res };
}

async function getRoutesByTypeAndOrganization(data, realmId, userId) {
  const { start: offset = null, limit = null, type, lang = "EN" } = data;
  const { user } = await User.findUserRoleAndCheckAccess(userId);

  const count = await db.route.count({
    where: {
      type,
      [db.Sequelize.Op.or]: [
        { organization_id: { [db.Sequelize.Op.eq]: null } },
        { organization_id: user.organization_id }
      ]
    }
  });

  const routes = await db.route
    .findAll({
      attributes: [
        ["id", "route_id"],
        "method",
        "service",
        ["report_name", "report"],
        "description",
        "type",
        "requirements",
        "report_id",
        "original_requirements",
        "maker",
        "ctime"
      ],
      where: {
        type,
        [db.Sequelize.Op.or]: [
          { organization_id: { [db.Sequelize.Op.eq]: null } },
          { organization_id: user.organization_id }
        ]
      },
      offset,
      limit,
      include: [
        {
          model: db.Permissions,
          attributes: [
            "is_permissible",
            "role_id",
            [
              db.sequelize.literal(
                '(SELECT role FROM roles where id="role_id")'
              ),
              "role_name"
            ]
          ],
          where: {
            [db.Sequelize.Op.or]: [
              { organization_id: { [db.Sequelize.Op.eq]: null } },
              { organization_id: user.organization_id }
            ]
          }
        }
      ],
      order: [["ctime", "asc"]]
    })
    .then(async (rows) => {
      const routeIds = rows.map((row) => row.dataValues.route_id);
      const reportLabels = await db.report_label.findAll({
        where: {
          report_id: routeIds,
          removed: 0
        },
        attributes: ["report_id", "report_name", "description", "lang"]
      });
      for (const route of rows) {
        for (const label of reportLabels) {
          if (
            route.dataValues.route_id === label.report_id &&
            lang === label.lang
          ) {
            route.dataValues.report = label.report_name;
            route.dataValues.description = label.description;
          }
        }
      }
      return { rows };
    })
    .catch((e) => {
      console.log(
        "auth-service, _getRoutesByTypeAndOrganization, error on getting data from route error: ",
        e
      );
      throw "SEARCHINGERROR";
    });

  return { success: true, routes: routes.rows, count, offset, limit };
}

export default {
  getPermissionInfo,
  changePermission,
  getRoutesByTypeAndOrganization
};
