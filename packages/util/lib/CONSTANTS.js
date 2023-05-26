const config = require("@lib/config");

module.exports = {
  CONSTANTS: {
    ROLE_USER: "user",
    ROLE_ADMIN: "Admin",
    ROLE_SUPER_ADMIN: "SuperAdmin",

    USER_TYPE_WEB: "web",
    USER_TYPE_MOBILE: "mobile",

    // For Production
    DOWNLOAD_DOMAIN: config.DOWNLOAD_DOMAIN,
    REDIRECT_DOMAIN: config.REDIRECT_DOMAIN,

    //For Test Server
    // DOWNLOAD_DOMAIN: 'http://84.201.184.53:8012/',
    // REDIRECT_DOMAIN: 'https://nr.getgps.eu/',

    //REDIRECT_DOMAIN: 'http://84.201.184.53/',
    REDIRECT_ACTIVATE_EMAIL_URL: "auth/activate-email",
    REDIRECT_INVITE_USER_URL: "auth/invited-signup",
    REPORT_DOWLOAD_PATH: "download/",

    EMAIL_FROM: "repogen@getgps.pro",
    TRANSPORTER: "21efa1a9-5dd0-4279-a796-9acb8014fe43",

    REPORT_REQ_EMAIL_TO: config.REPORT_REQ_EMAIL_TO,
    REPORT_REQ_EMAIL_CC: config.REPORT_REQ_EMAIL_CC,
    REPORT_REQ_LETTER_NAME: "Request Customized Report",
    REPORT_REQ_SUBJECT: "REPOGEN | Request Customized Report",

    ACTIVATE_CODE_LETTER_NAME: "Activate code email",
    ACTIVATE_CODE_SUBJECT: "WIALON | ACTIVATION CODE",

    INVITE_USER_LETTER_NAME: "Invite User",
    INVITE_USER_SUBJECT: "WIALON | Invite User",

    PLUGIN_REQ_EMAIL_TO: "repogen@getgps.eu",
    PLUGIN_FUEL_CARDS_ID: "ee7c4508-7c45-11ed-a1eb-0242ac120002",

    RESTRICTION_TYPE: {
      CREATE: "CREATE",
      DOWNLOAD: "DOWNLOAD"
    },

    MS_ON_DAY: 86400000, //1000 * 60 * 60 * 24
    UUIDV4REGEX: /^[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[89ab][0-9a-f]{3}\-[0-9a-f]{12}$/,
    LOCAL_PARAMETER_FOR_SALT: config.LOCAL_PARAMETER_FOR_SALT
  }
};
