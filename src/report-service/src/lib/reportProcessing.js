import Provider from "@lib/fileprovider";
import xlsx from "node-xlsx";
import db from "@lib/db";
import config from "@lib/config";

async function getReportCode(report_id, user_id) {
  let { provider_id } = await db.report_stats
    .findOne({
      where: {
        id: report_id,
        user_id
      },
      attributes: ["provider_id"],
      raw: true
    })
    .catch((e) => {
      console.log(
        "report-service, getReportCode, error on getting data from reports_starts error: ",
        e
      );
      throw "REPORTSEARCHINGERROR";
    });
  if (!provider_id) throw "FILEREFERENCENOTFOUND";
  return provider_id;
}

async function previewReport({ report_id }, realm, user) {
  report_id = await getReportCode(report_id, user).catch((e) => {
    throw e;
  });
  let report_buff = await prepareReport(report_id).catch((e) => {
    throw e;
  });
  let raw_report_data = xlsx.parse(report_buff, {});

  let tables_arr = [];
  for (let idx = 0; idx < raw_report_data.length; idx++)
    tables_arr.push(
      await buildTableData(raw_report_data[idx]).catch((e) => {
        console.log(e);
        throw "BUILDINGPREVIEWERROR";
      })
    );

  return tables_arr;
}

async function buildTableData({ name, data }) {
  let headers = [];
  let rows = [];
  for (let row_idx = 0; row_idx < data.length; row_idx++) {
    if (row_idx >= config.MAX_PREVIEW_TABLE_LENGTH + 1) break; // +1 is a header, leave it as it is
    let row_object = {};
    for (let col_idx = 0; col_idx < data[row_idx].length; col_idx++) {
      row_object[`field_${col_idx}`] = data[row_idx][col_idx];
    }
    if (row_idx == 0) headers.push(row_object);
    else rows.push(row_object);
  }
  return { title: name, headers, data: rows };
}

async function prepareReport(report_id) {
  let file = await Provider.pull({ code: report_id }).catch((e) => {
    console.log(e);
    throw "REPORTCORRUPTEDORNOTEXISTS";
  });
  if (!file.data) throw "REPORTNOTFOUND";
  file.data = file.data.substring(file.data.indexOf(",") + 1);
  return Buffer.from(file.data, "base64");
}

export default {
  previewReport
};
