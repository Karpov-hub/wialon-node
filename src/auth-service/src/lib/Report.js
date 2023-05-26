import db from "@lib/db";
import FileProvider from "@lib/fileprovider";
import Queue from "@lib/queue";
import { CONSTANTS } from "./Global";
import { REPORT_ERROR_STRING } from "./Strings";
import { customizedRequestReportHtml } from "./customized_request_report_html";

const Op = db.Sequelize.Op;

async function customizedRequestReport(data, realmId, userId) {
  let attachment_name = null;
  let file = null;
  if (data.files) {
    attachment_name = data.files[0].code;
    file = await FileProvider.pull({ code: attachment_name });
  }

  let emailTo = CONSTANTS.REPORT_REQ_EMAIL_TO;
  const emailCC = CONSTANTS.REPORT_REQ_EMAIL_CC;

  if (data.isTest) {
    console.log("data.isTest = " + data.isTest);
    emailTo = "mailrepogentest@maildrop.cc";
  }

  const user = await db.user
    .findOne({
      where: { id: userId, realm: realmId },
      raw: true,
      parameters: ["id", "email", "name", "organization_id"]
    })
    .catch((e) => {
      console.log(
        "auth-service, customizedRequestReport, error on getting data from user error: ",
        e
      );
      throw "SEARCHINGERROR";
    });

  data.code = "custom_request_report";
  data.email = user.email;
  data.to = emailTo;
  if (attachment_name) {
    data.attachments = [
      {
        filename: file.name,
        path: file.data
      }
    ];
  }
  // уведомление админу
  Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: data.lang,
      code: data.code,
      to: data.to,
      body: data,
      cc: emailCC,
      attachments: data.attachments
    },
    realmId: realmId
  }).catch((e) => {
    console.log(
      "auth-service, customizedRequestReport, error on Queue.newJob, error: ",
      e
    );
    throw "MAILSENDINGERROR";
  });

  data.code = "custom_request_report_notification";
  data.to = user.email;
  delete data.email;
  delete data.files;
  //уведомление пользователю
  Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: data.lang,
      code: data.code,
      to: data.to,
      body: data
    },
    realmId: realmId
  }).catch((e) => {
    console.log(
      "auth-service, customizedRequestReport, error on Queue.newJob, error: ",
      e
    );
    throw "MAILSENDINGERROR";
  });

  let reportHtml = customizedRequestReportHtml;
  reportHtml = reportHtml.replace("{#body.text}", data.text);
  reportHtml = reportHtml.replace("{#body.id}", user.id);
  reportHtml = reportHtml.replace("{#body.email}", user.email);
  reportHtml = reportHtml.replace("{#body.name}", user.name);

  await db.custom_report_request
    .create({
      user_id: userId,
      user_email: user.email,
      organization_id: user.organization_id,
      attachment_name: attachment_name,
      html: reportHtml
    })
    .catch((e) => {
      console.log(
        "auth-service, customizedRequestReport, error entering data into custom_report_request, error: ",
        e
      );
      throw "CHANGEDBRECORDERROR";
    });

  return { success: true };
}

async function getReportRoutes(data, realmId, userId) {
  let { start: offset = null, limit = null } = data;
  const user = await db.user.findByPk(userId);

  let showFromType = 1;
  await db.route.hasMany(db.Permissions, {
    targetKey: "permissions",
    foreignKey: "route_id"
  });

  let notAllowedRoutesForUser = await checkAllowToUser({
    userId,
    type_restriction: CONSTANTS.RESTRICTION_TYPE.CREATE
  });

  let { count, rows } = await db.route
    .findAndCountAll({
      attributes: [
        ["id", "route_id"],
        "method",
        ["report_name", "report"],
        "report_id",
        "service",
        "description",
        "type",
        "requirements",
        "original_requirements",
        "maker",
        "ctime",
        "formats"
      ],
      where: {
        type: { [db.Sequelize.Op.gte]: showFromType },
        [db.Sequelize.Op.or]: [
          { organization_id: { [db.Sequelize.Op.eq]: null } },
          { organization_id: user.dataValues.organization_id }
        ],
        [db.Sequelize.Op.and]: [
          { id: { [db.Sequelize.Op.notIn]: notAllowedRoutesForUser } }
        ]
      },
      offset,
      limit,
      include: [
        {
          model: db.Permissions,
          attributes: [],
          where: {
            organization_id: user.dataValues.organization_id,
            role_id: user.dataValues.role_id,
            is_permissible: true
          }
        },
        {
          model: db.references_report,
          attributes: ["id", "lang"]
        }
      ],
      order: [["ctime", "asc"]]
    })
    .catch((e) => {
      console.log(
        "auth-service, getReportRoutes, error on getting data from route error: ",
        e
      );
      throw "SEARCHINGERROR";
    });
  if (count) {
    let routes_ids = rows.map((el) => el.dataValues.route_id);
    let translations = await _getTranslations(routes_ids);
    rows = rows.map((el) =>
      _buildOutputReportRouteObject(el, translations, data.lang || "en")
    );
  }
  return { success: true, routes: rows, count, offset, limit };
}

function _buildOutputReportRouteObject(el, translations, lang) {
  const defaultFormats = ["xlsx"];

  if (el?.dataValues?.formats?._arr) {
    el.dataValues.formats = el.dataValues.formats._arr;
  } else {
    el.dataValues.formats = defaultFormats;
  }

  let output_object = {
    ...el.dataValues,
    translations: {
      default: {
        report_name: el.dataValues.report,
        description: el.dataValues.description
      }
    }
  };
  if (translations.length)
    for (let translation of translations)
      if (output_object.route_id == translation.report_id)
        output_object.translations[translation.lang] = {
          report_name: translation.report_name,
          description: translation.description
        };
  if (
    Array.isArray(output_object.references_reports) &&
    output_object.references_reports.length > 0
  ) {
    for (const reference of output_object.references_reports) {
      if (reference.lang === lang.toUpperCase()) {
        output_object.is_reference_available = true;
        break;
      } else {
        output_object.is_reference_available = false;
      }
    }
    delete output_object.references_reports;
  }

  return output_object;
}

async function downloadReport(data, realmId, userId) {
  let res;
  const reportStats = await db.report_stats.findOne({
    where: {
      id: data.reportId,
      user_id: userId
      //  organization_id: user.dataValues.organization_id,
    },
    raw: true,
    attributes: ["route_id", "provider_id", "organization_id", "user_id", "id"]
  });

  if (!reportStats) {
    throw "REPORTNOTFOUND";
  }

  const notAllowedRoutesForUser = await checkAllowToUser({
    userId,
    route_id: reportStats.route_id,
    type_restriction: CONSTANTS.RESTRICTION_TYPE.DOWNLOAD
  });

  if (notAllowedRoutesForUser && notAllowedRoutesForUser.length)
    throw "CERTAINPERMISSIONERROR";
  const providerData = await db.provider.findOne({
    where: {
      code: reportStats.provider_id
    },
    raw: true,
    attributes: ["file_size", "code"]
  });

  if (!providerData) {
    throw "FILENOTFOUND";
  }

  const lastNumber = await db.download_stats.findOne({
    attributes: [db.sequelize.fn("MAX", db.sequelize.col("id"))],
    raw: true
  });
  const lastId = lastNumber.max + 1;
  await db.download_stats.create({
    id: lastId,
    org_id: reportStats.organization_id,
    user_id: reportStats.user_id,
    route_id: reportStats.route_id,
    provider_id: reportStats.provider_id,
    report_log_id: reportStats.id,
    report_size: providerData.file_size
  });

  res = {
    downloadUrl:
      CONSTANTS.DOWNLOAD_DOMAIN +
      CONSTANTS.REPORT_DOWLOAD_PATH +
      providerData.code
  };

  return { success: true, res };
}

async function hideRecordOfGeneratedReport(data, realmId, userId) {
  const record = await db.report_stats.findByPk(data.id);

  if (!record) throw "REPORTNOTFOUND";

  await db.report_stats.update(
    {
      removed: 1
    },
    {
      where: {
        id: data.id
      }
    }
  );
  return { success: true, res: {} };
}

async function listGenertatedReports(data, realmId, userId) {
  let { start: offset = null, limit = null } = data;

  await db.report_stats.belongsTo(db.route, {
    targetKey: "id",
    foreignKey: "route_id"
  });

  let notAllowedRoutesForUser = await checkAllowToUser({
    userId,
    type_restriction: CONSTANTS.RESTRICTION_TYPE.DOWNLOAD
  });

  let { count, rows } = await db.report_stats
    .findAndCountAll({
      attributes: [
        ["id", "reportId"],
        ["mtime", "generated_date"],
        "status",
        "error_message",
        "wialon_error_code"
        //, [db.sequelize.literal(`(SELECT filename FROM "routes" where "routes"."id"="report_stats"."provider_id")`), 'file_name']
      ],
      where: {
        user_id: userId,
        status: {
          [db.Sequelize.Op.or]: [1, 2]
        },
        removed: 0,
        route_id: {
          [db.Sequelize.Op.notIn]: notAllowedRoutesForUser
        }
        //  organization_id: user.dataValues.organization_id,
      },
      offset,
      limit,

      include: [
        {
          model: db.route,
          attributes: [
            ["id", "route_id"],
            "method",
            ["report_name", "report"],
            "service",
            "description"
          ]
        }
      ],
      order: [["mtime", "desc"]]
    })
    .catch((e) => {
      console.log(
        "auth-service, listGenertatedReports, error on getting data from report_stats error: ",
        e
      );
      throw "SEARCHINGERROR";
    });
  const routes_ids = rows.map((el) => el.dataValues.route.dataValues.route_id);
  const translations = await _getTranslations(routes_ids);
  for (let i = 0; i < rows.length; i++) {
    rows[i].dataValues.route = _buildOutputReportRouteObject(
      rows[i].dataValues.route,
      translations
    );
    if (
      rows[i].wialon_error_code != null &&
      REPORT_ERROR_STRING.hasOwnProperty(rows[i].wialon_error_code.toString())
    ) {
      rows[i].error_message =
        REPORT_ERROR_STRING[rows[i].wialon_error_code.toString()][data.lang];
    } else {
      rows[i].error_message = REPORT_ERROR_STRING["0"][data.lang];
    }
  }

  return { success: true, res: rows, count, offset, limit };
}

async function checkAllowToUser(params) {
  let paramsForSelection = {
    attributes: ["route_id"],
    where: {
      user_id: params.userId,
      allow_user: false,
      type_restriction: params.type_restriction
    },
    raw: true
  };
  if (params && params.route_id) {
    paramsForSelection.where.route_id = params.route_id;
  }
  let notAllowedRoutesForUser = await db.certain_permissions.findAll(
    paramsForSelection
  );
  notAllowedRoutesForUser = notAllowedRoutesForUser.map((el) => el.route_id);
  return notAllowedRoutesForUser;
}

async function _getTranslations(routes_ids) {
  return await db.report_label.findAll({
    where: {
      report_id: { [Op.in]: routes_ids }
    },
    attributes: ["report_id", "lang", "report_name", "description"],
    raw: true
  });
}

export default {
  customizedRequestReport,
  getReportRoutes,
  downloadReport,
  listGenertatedReports,
  hideRecordOfGeneratedReport
};
