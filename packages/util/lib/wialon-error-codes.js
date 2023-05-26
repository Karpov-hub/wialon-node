const errorCodes = [
  { code: "1", message: "Invalid session. Please, contact to Admin/Dev Team." },
  {
    code: "2",
    message: "Invalid service name. Please, contact to Admin/Dev Team."
  },
  { code: "3", message: "Invalid result. Please, contact to Admin/Dev Team." },
  { code: "4", message: "Invalid input. Please, contact to Admin/Dev Team." },
  {
    code: "5",
    message: "Error performing request. Please, contact to Admin/Dev Team."
  },
  { code: "6", message: "Unknown error. Please, contact to Admin/Dev Team." },
  { code: "7", message: "Access denied. Please, contact to Admin/Dev Team." },
  { code: "8", message: "Please update token and create a new report." },
  { code: "9", message: "Authorization server is unavailable" },
  { code: "10", message: "Reached limit of concurrent requests" },
  { code: "11", message: "Password reset error" },
  { code: "14", message: "Billing error" },
  { code: "1005", message: "Execution time exceeded" }
];

module.exports = {
  errorCodes
};
