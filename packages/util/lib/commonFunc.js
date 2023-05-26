const db = require("@lib/db");
const { CONSTANTS } = require("./CONSTANTS");
const config = require("@lib/config");
const axios = require("axios");
const { ERROR_MESSAGES } = require("./Error");
const { randomBytes, pbkdf2Sync } = require("crypto");

const removeTimezoneOffset = function(date, tz = 0) {
  let minusValue = 0;
  if (!isNaN(tz)) {
    minusValue = tz & 0xffff;
    if (Number(tz) < 0) {
      minusValue = minusValue | 0xffff0000;
    }
  }

  return date + new Date().getTimezoneOffset() * 60 + minusValue;
};

function equalsIgnoringCase(text, other) {
  // console.log("@@@@@@@ equalsIgnoringCase text ="+text+" , other = "+other );
  return text.localeCompare(other, undefined, { sensitivity: "base" }) === 0;
}

function toUnderScore(str) {
  return str
    .trim()
    .replace(/ /g, "_")
    .toLowerCase();
}

/**
 * @param {string} userId
 * @param {boolean} throwable
 * @returns {object} { role, user, access: true }
 */
async function findUserRoleAndCheckAccess(userId, throwable = true) {
  try {
    const user = await db.user.findOne({
      attributes: [
        "role_id",
        "organization_id",
        "email",
        "id",
        "preferred_language"
      ],
      where: {
        id: userId
      },
      raw: true
    });
    if (!user) throw "USERNOTFOUND";
    const role = await db.role.findOne({
      attributes: ["role"],
      where: {
        id: user.role_id
      },
      raw: true
    });
    if (
      !!role &&
      equalsIgnoringCase(role.role, CONSTANTS.ROLE_USER) &&
      throwable
    )
      throw "ACCESSDENIED";

    return { access: true, user, role };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function requestToWialon({
  sid = "",
  params = {},
  svc = "",
  host = config.DEFAULT_HOST
}) {
  if (typeof params != "object") {
    throw "PARAMSSHOULDBEJSON";
  }

  if (typeof svc != "string" || !svc) {
    throw "SVCSHOULDBESTRINGANDNOTEMPTY";
  }

  params = JSON.stringify(params);
  if (host != config.DEFAULT_HOST) {
    host += "/wialon/ajax.html?";
  }
  const rawUrl = `${host}&svc=${svc}&params=${params}`;
  let url = encodeURI(`${host}&svc=${svc}&params=${params}`);
  if (sid) {
    url += `&sid=${sid}`;
  }

  const { data } = await axios.post(url);

  await handleWialonResponse(data, rawUrl);

  return data;
}

async function handleWialonResponse(data, url) {
  const result = await _handleWialonError(data);

  if (result) {
    console.error(url);
    throw result;
  }

  return true;
}

async function _handleWialonError(data) {
  if (data.error) {
    return await ERROR_MESSAGES[data.error.toString()];
  } else {
    return false;
  }
}

async function checkParamsPropertiesForAggregator({ aggregator, params }) {
  if (!aggregator) {
    throw "AGGREGATORNOTFOUND";
  }

  if (aggregator && aggregator.api_key_required && !params.api_key) {
    throw "APIKEYISREQUIRED";
  }

  if (
    aggregator &&
    aggregator.log_pas_required &&
    (!params.login || !params.password)
  ) {
    throw "LOGINPASSWORDISREQUIRED";
  }

  if (
    aggregator &&
    aggregator.contract_number_required &&
    !params.contract_number
  ) {
    throw "CONTRACTNUMBERREQUIRED";
  }

  return true;
}

function hashPassword(password, salt) {
  return pbkdf2Sync(
    password,
    salt + process.env.LOCAL_PARAMETER_FOR_SALT,
    1000,
    64,
    "sha512"
  ).toString("hex");
}

function createSalt() {
  return randomBytes(64).toString("hex");
}

module.exports = {
  equalsIgnoringCase,
  findUserRoleAndCheckAccess,
  toUnderScore,
  requestToWialon,
  removeTimezoneOffset,
  handleWialonResponse,
  checkParamsPropertiesForAggregator,
  hashPassword,
  createSalt
};
