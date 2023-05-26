// const FileProvider = require("@lib/fileprovider");
// const config = require("@lib/config");
const request = require("request");
const { ERROR_MESSAGES } = require("./wialon-error-codes");

async function _getJasperReport(data, realmId, userId) {
  let opts = {
    uri: `${data.jasperUrl}/jasperService/getReportInBase64`,
    method: "POST",
    json: data.requestParams,
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
  };
  return new Promise(async (resolve, reject) => {
    request(opts, async (err, res) => {
      if (err) {
        console.log(err);
        return resolve({
          success: false,
          error: err.code
        });
      }

      let fileProvider = null;
      if (res && res.body && !res.body.file && res.body.code) {
        resolve({ error: res.body.code });
      }

      if (res && res.body && res.body.file_extension) {
        data.filename += `.${res.body.file_extension}`;
        let file = {};
        file.data = `data:application/${res.body.file_extension};base64,${res.body.file}`;
        file.name = data.filename || "report.xlsx";

        resolve(file);
        // fileProvider = await FileProvider.push(file, 300);
      }

      // fileProvider ? resolve(fileProvider) : resolve(null);
    });
  });
}

async function _getReport({ report, jasper_url }, realmId, userId) {
  let filename = report.filename;
  let requestParams = {
    report_name: report.report_name,
    report_data: { data: report.data, lang: report.lang },
    report_format: report.format
  };

  const res = await _getJasperReport(
    { filename: filename, requestParams: requestParams, jasperUrl: jasper_url },
    realmId,
    userId
  );

  return res ? res : null;
}

async function generateReport(data, realmId, userId) {
  if (!data || !Object.keys(data).length)
    return { success: false, error: "No data for generate report" };
  const report = {};
  report.data = data.report_data;
  report.report_name = data.report_name;
  report.format = data.format;
  report.lang = data.lang;

  if (report.error || report.data.error) {
    const error = report.error || report.data.error;
    console.log("Report index.js catch the error: ", error);
    return {
      success: false,
      error: ERROR_MESSAGES[error] || error
    };
  }
  if (report.data.code) {
    return { success: true, code: report.data.code, exist: true };
  }

  const resReport = await _getReport({
    report,
    jasper_url: data.jasper_url
  });

  if (!resReport) return { success: false };
  if (resReport.error) {
    return {
      success: false,
      error: ERROR_MESSAGES[resReport.error] || ""
    };
  }

  return {
    success: true,
    code: resReport.code,
    data: resReport.data
  };
}

module.exports = {
  generateReport
};
