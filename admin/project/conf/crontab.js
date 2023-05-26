/**
 * include cans be a js file
 * ATTENTION!!!
 * crontab should be activated just on one application node
 */

exports.crontab = [
  //"1 1 * * * Crm.Reports.DebtCalculator.dailyCalculate",
];

exports.filesTmpDir = __dirname + "/../../tmp/";
exports.userFilesDir = __dirname + "/../../userdocs";
exports.userDocsDir = __dirname + "/../../userdocs";
exports.adminModulesDir = __dirname + "/../static/admin/crm/modules";
