import Docker from "dockerode";
import db from "@lib/db";
import fs from "promise-fs";
import config from "@lib/config";
import rimraf from "rimraf";
import FileProvider from "@lib/fileprovider";
import commonMethods from "./common-methods";
import MemStore from "@lib/memstore";
import file from "fs";
import filesName from "./getFilesName";
import Queue from "@lib/queue";

const docker = new Docker(config.dockerd_config);

async function getAccount(accountId) {
  const account = await db.wialon_accounts.findByPk(accountId);
  if (account) return account.toJSON();
  throw "WIALONACCOUNTNOTFOUND";
}

async function writeCodeFile(path, code) {
  code = `
  ${code}
  module.exports = Report;
  `;
  await fs.writeFile(path + "/code.js", code);
}

function prepareCodeInData(data) {
  if (data.codeInBase64)
    data.code = Buffer.from(data.code, "base64").toString("utf8");
}

async function build(data, realm, user) {
  const reportRoute = await db.route.findOne({
    where: { id: data.routeId }
  });

  const reportName = data.name.toLowerCase();
  if (!data.code) {
    const code = file.readFileSync(
      __dirname + "/./../reports/" + reportName + ".js"
    );
    data.code = code;
  }

  prepareCodeInData(data);

  const res = await db.customreport.create({
    owner: user,
    name: data.name,
    description: data.description,
    code: data.code
  });

  const path = config.custom_reports_dir + "/" + res.get("id");

  // update custom report id in routes table
  reportRoute.report_id = res.get("id");
  await reportRoute.save();

  await fs.mkdir(path);
  await fs.mkdir(path + "/results");
  await writeCodeFile(path, data.code);

  return {
    id: res.get("id")
  };
}

async function update(data, realm, user) {
  const reportName = data.name.toLowerCase();
  if (!data.code) {
    const code = file.readFileSync(
      __dirname + "/./../reports/" + reportName + ".js"
    );
    data.code = code;
  }

  const reportRoute = await db.route.findOne({
    where: { id: data.routeId }
  });

  prepareCodeInData(data);

  const res = await db.customreport.update(
    {
      name: data.name,
      description: data.description,
      code: data.code
    },
    {
      where: {
        id: data.id,
        owner: user
      }
    }
  );

  if (!(res && res[0])) return { success: false };

  reportRoute.report_id = data.id;
  await reportRoute.save();

  const path = config.custom_reports_dir + "/" + data.id;
  await writeCodeFile(path, data.code);

  return {
    success: true
  };
}

function removeFolder(path) {
  return new Promise((resolve) => {
    fs.rm(path, { recursive: true, force: true }, (res) => {
      if (res) {
        console.error(res);
      }
      resolve(true);
    });
  });
}

async function remove(data, realm, user) {
  const route = await db.route.findByPk(data.route_id, {
    attributes: ["id", "report_id", "maker"]
  });
  if (!route) {
    throw "CUSTOMREPORTNOTFOUND";
  }

  if (route) {
    if (user === route.dataValues.maker) {
      await route.destroy();
    } else {
      throw "YOUARENOTOWNER";
    }
  }

  await removeFolder(`${config.custom_reports_dir}/${route.report_id}`);
  return {
    success: true,
    report_id: route.dataValues.report_id,
    route_id: route.dataValues.id
  };
}

async function getAll(user, data) {
  let { start: offset = null, limit = null } = data;
  const { count, rows } = await db.customreport.findAndCountAll({
    where: {
      owner: user
    },
    offset,
    limit,
    attributes: ["id", "name", "description"]
  });
  return { res: rows, count, offset, limit };
}

async function insertDataInReportStat(requestOpt) {
  var reportStatData = {
    organization_id: requestOpt.organizationId,
    user_id: requestOpt.userId,
    route_id: requestOpt.routeId,
    provider_id: null,
    report_generation_time: 0,
    report_size: 0,
    report_params: JSON.stringify(requestOpt),
    status: 0
  };
  let reportStat = await commonMethods.insertInReportStats(reportStatData);
  return reportStat;
}

async function make(params, realm, user) {
  let isJasperReport = false;

  params.fileType = params.fileType ? params.fileType.toLowerCase() : "xlsx";

  const route = await db.route.findByPk(params.params.routeId, {
    raw: true,
    attributes: ["id", "jasper_report_code", "formats"]
  });

  if (!route) {
    throw "REPORTNOTFOUND";
  }
  let formats = ["xlsx"];
  if (route.formats && route.formats._arr) {
    formats = route.formats._arr;
  }
  if (
    route.jasper_report_code &&
    route.formats &&
    formats &&
    formats.includes(params.fileType)
  ) {
    isJasperReport = true;
  }

  const account = await getAccount(params.wialonAccountId);

  let insertData = {},
    status;
  insertData.organizationId = account.organization_id;
  insertData.routeId = params.params.routeId;
  insertData.userId = user;
  let reportStat = await insertDataInReportStat(insertData);
  params.params.lang = params.lang.toLowerCase();
  let requestParams = params.params || {};

  const fileName = await filesName.getFileName(params);

  params.fileType = "xlsx";

  const filePath = `${config.custom_reports_dir}/${params.report_id}/results/${fileName}.${params.fileType}`;

  let stringProccessReport = await MemStore.get("generatingReports");
  if (stringProccessReport == null || stringProccessReport == "") {
    await MemStore.set("generatingReports", user + ":" + params.report_id);
  } else if (stringProccessReport && stringProccessReport.length > 0) {
    await MemStore.set(
      "generatingReports",
      stringProccessReport + ";" + user + ":" + params.report_id
    );
  }

  const opts = {
    Image: "customreport",
    // Cmd: ["node", "src/index"],
    Binds: [`${config.custom_reports_dir}/${params.report_id}:/app/src/report`],
    Env: [
      "NODE_TLS_REJECT_UNAUTHORIZED=0",
      `wialon_outfile=${fileName}.${params.fileType}`,
      "wialon_request_params=" +
        Buffer.from(JSON.stringify(requestParams)).toString("base64"),
      "organization_id=" + account.organization_id,
      "wialon_hosting_url=" + account.wialon_hosting_url,
      "wialon_token=" + account.wialon_token,
      "wialon_username=" + account.wialon_username,
      "lang=" + params.lang,
      "format=" + (params.fileType ? params.fileType : "xlsx"),
      "jasper=" + isJasperReport,
      "jasper_code=" + route.jasper_report_code,
      "jasper_url=" + config.jasperURL
    ]
  };
  const container = await docker.createContainer(opts);
  await container.start();

  let stats = await container.stats({ stream: false });
  await container.wait();

  let logs = await container.logs({ stderr: true, stdout: true });
  logs = logs.toString();
  if (logs) {
    console.log("Logs From Docker: ", logs);
  }

  try {
    await container.stop();
  } catch (e) {}

  await container.remove();
  let stringProccessReportAfterCreate = await MemStore.get("generatingReports");
  if (!!stringProccessReport && typeof stringProccessReport == "string") {
    let arrayProccessReportAfterCreate = stringProccessReportAfterCreate.split(
      ";"
    );
    let finalArrayProccessReportAfterCreate = stringProccessReportAfterCreate.split(
      ";"
    );
    for (let i = 0; i < arrayProccessReportAfterCreate.length; i++) {
      if (
        arrayProccessReportAfterCreate[i].indexOf(
          user + ":" + params.report_id
        ) > -1
      ) {
        finalArrayProccessReportAfterCreate.splice(
          finalArrayProccessReportAfterCreate.indexOf(
            user + ":" + params.report_id
          ),
          1
        );
      }
    }
    let finalString = finalArrayProccessReportAfterCreate.join(";");
    await MemStore.set("generatingReports", finalString, 300);
  }
  let logFilePath = `${config.custom_reports_dir}/${params.report_id}/log.json`;
  let logData = null;
  try {
    logData = await fs.readFile(logFilePath);
  } catch (e) {
    console.log("Logfile not found: e = ", e);
  }

  logData = logData ? JSON.parse(logData.toString()) : {};
  if (logData && logData.code) {
    // reportStat
    await commonMethods.updateReportStats(reportStat, logData, "error");
    status = false;
    return {
      message: "error generating report",
      code: logData.code,
      logs: logs || "Something went wrong"
    };
  } else {
    try {
      const res = await storeFile(
        params.fileName || `${fileName}.${params.fileType}`,
        filePath
      );
      await fs.unlink(filePath);
      res.cpu_status = {
        cpu: stats.cpu_stats.cpu_usage.total_usage,
        precpu: stats.precpu_stats.cpu_usage.total_usage
      };
      res.memory_status = {
        usage: stats.memory_stats.usage,
        max_usage: stats.memory_stats.max_usage
      };
      res.net_status = stats.networks.eth0;
      let timeInMiliSeconds = res.cpu_status.precpu / 10000;
      let timeInSeconds = timeInMiliSeconds / 1000;
      let reportStatData = {
        sizeOfDataFromWialon: res.net_status.rx_bytes,
        diff: timeInSeconds,
        code: res.code
      };
      let dataForSendGroupReprot = await commonMethods.updateReportStats(
        reportStat,
        reportStatData,
        "success"
      );

      res.realm = realm;
      res.user = user;
      res.dataForGroupReport = dataForSendGroupReprot;
      res.logs = logs;
      status = true;
      return res;
    } catch (e) {
      status = false;
      console.log("Xlsx file Error = ", e);
      let errorData = {
        code: 0,
        message: "Error generating report. Please contact admin."
      };
      await commonMethods.updateReportStats(reportStat, errorData, "error");
      return {
        message: "error generating report",
        logs: logs || "Someting went wrong..."
      };
    } finally {
      if (reportStat && reportStat.status !== 2 && !!status) {
        await informFrontAboutExecuteMethod(
          { reportStat, status, requestParams },
          realm,
          user
        );
      }
    }
  }
}

async function informFrontAboutExecuteMethod(data, realmId, userId) {
  let linkToDownloadReport = null;
  if (
    data &&
    data.reportStat &&
    data.reportStat.dataValues &&
    data.reportStat.dataValues.id
  ) {
    linkToDownloadReport = await Queue.newJob("auth-service", {
      method: "downloadReport",
      data: {
        reportId: data.reportStat.dataValues.id
      },
      realmId,
      userId
    });
  }

  await Queue.broadcastJob("runOnClient", {
    method: "informAboutReportDone",
    realmId,
    userId,
    data: {
      status: data.status,
      linkToDownloadReport,
      uid: data.requestParams.uid
    }
  });
}

async function storeFile(fileName, path) {
  let b64 = null;
  let buffer = await fs.readFile(path);
  b64 = buffer.toString("base64"); // convert buffer to base64
  b64 =
    "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
    b64;
  const result = await FileProvider.push({
    name: fileName,
    data: b64
  });

  result.fileName = fileName;
  if (result && result.code) return result;
  throw "ERRORINCREATEFILE";
}

async function getReportsInProcess() {
  let reportsList = await MemStore.get("generatingReports");
  return { success: true, reports: reportsList };
}

export default {
  build,
  update,
  remove,
  getAll,
  make,
  getReportsInProcess
};
