const axios = require("axios");
const db = require("@lib/db");
const _ = require("lodash");
const { isUndefined } = require("lodash");
const Queue = require("@lib/queue");
const moment = require("moment");

const { _generate, _pdf } = require("./generate");

async function _createOrUpdateUser(res, token, host) {
  const newUserData = {
    wialon_id: res.user.id,
    token,
    host
  };

  let user = await db.charts_users.findOne({
    where: { wialon_id: res.user.id }
  });

  // console.log(user.toJSON());

  if (!user) {
    // If the user not exist, create one
    user = await db.charts_users.create(newUserData);
  } else {
    // If user found, update the DB data
    user.token = token;
    user.host = host;
    await user.save();
  }
  return { user: user || newUserData, wUser: res };
}

async function _signInWithToken(host, token) {
  const res = await _token_login(host, token);
  return await _createOrUpdateUser(res, token, host);
}

async function _signInWithHash(host, hash) {
  const res = await _duplicate(host, hash);
  const sid = res.eid;
  const token = await _update_token(host, sid);
  return await _createOrUpdateUser(res, token, host);
}

function _getItems(items, classes, _class) {
  if (!classes[_class]) throw `Can't find class ${_class} in the account!`;
  return items.filter((item) => item.d.cls == classes[_class]);
}

function _getGroups(items, classes) {
  const groups = _getItems(items, classes, "avl_unit_group");
  const filteredGroups = groups.map((group) => {
    return {
      id: group.i,
      name: group.d.nm,
      count: group.d.u.length
    };
  });
  return filteredGroups;
}

function _getResources(items, classes) {
  const resources = _getItems(items, classes, "avl_resource");
  // console.log(resources);
  const filteredResources = resources.map((resource) => {
    return {
      id: resource.i,
      name: resource.d.nm
    };
  });
  return filteredResources;
}

async function _email(email) {
  const result = await Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: "ru",
      code: "CHARTS",
      to: "redsight@mail.ru"
    },
    realmId: "2b4c01ca-2749-11eb-adc1-0242ac120002"
  });
  return result;
}

async function _handleAPIRequest(URL) {
  try {
    const response = await axios.post(URL);
    if (response.data.error) throw response.data.error;
    return response.data;
  } catch (error) {
    throw error;
  }
}

function _compileURL(host = "https://hst-api.wialon.com", svc, sid, params) {
  const JSONparams = JSON.stringify(params);
  return `${host}/wialon/ajax.html?svc=${svc}&sid=${sid}&params=${JSONparams}`;
}

async function _callAPI({ host, svc, sid, params }) {
  const URL = _compileURL(host, svc, sid, params);
  // console.log(URL);
  const data = await _handleAPIRequest(URL);
  return data;
}

async function _duplicate(host, hash) {
  const data = await _callAPI({
    host,
    svc: "core/duplicate",
    sid: hash,
    params: {
      continueCurrentSession: true
    }
  });
  return data;
}

async function _update_token(host, sid) {
  const res = await _callAPI({
    host,
    svc: "token/update",
    sid,
    params: {
      callMode: "create",
      app: "charts",
      at: 0,
      dur: 0,
      fl: -1,
      p: "{}"
    }
  });

  await _deleteUnusedTokens(host, sid, res.h);

  return res.h;
}

async function _token_login(host, token) {
  const params = JSON.stringify({ token });
  const URL = `${host}/wialon/ajax.html?svc=token/login&params=${params}`;
  const user = _handleAPIRequest(URL);
  return user;
}

async function _update_data_flags(host, sid) {
  const params = {
    spec: [
      {
        type: "type",
        data: "avl_resource",
        flags: 1,
        mode: 0
      },
      {
        type: "type",
        data: "avl_unit",
        flags: 0x411,
        mode: 0
      },
      {
        type: "type",
        data: "avl_unit_group",
        flags: 0x411,
        mode: 0
      }
    ]
  };
  const res = await _callAPI({
    host,
    svc: "core/update_data_flags",
    sid,
    params
  });
  return res;
}

async function _getTemplates(host, sid, resources) {
  const params = {
    spec: {
      itemsType: "avl_resource",
      propName: "reporttemplates",
      propValueMask: "*",
      sortType: "0"
    },
    force: "1",
    flags: "8192",
    from: "0",
    to: "0"
  };
  const res = await _callAPI({
    host,
    svc: "core/search_items",
    sid,
    params
  });
  // console.log(res.items[0]);
  // let templates = Object.values(res.items[0].rep);
  const resourcesTemplates = resources.map((resource, index) => {
    resource.templates = Object.values(res.items[index].rep).map((template) => {
      return {
        id: template.id,
        name: template.n
      };
    });
    return resource;
  });
  return resourcesTemplates;
}

async function _deleteUnusedTokens(host, sid, currentToken = null) {
  // Getting the token list
  const tokens = await _callAPI({
    host,
    svc: "token/list",
    sid,
    params: {}
  });
  const tokensToDelete = tokens
    .filter(
      (tokenObj) => tokenObj.h !== currentToken && tokenObj.app === "charts"
    )
    .map((tokenObj) => tokenObj.h);

  // Function to delete the single token
  async function deleteToken(token) {
    await _callAPI({
      host,
      svc: "token/update",
      sid,
      params: {
        callMode: "delete",
        h: token,
        app: "charts"
      }
    });
  }

  //Async loop to delete all of the tokens simultaneously
  for (const token of tokensToDelete) {
    await deleteToken(token);
  }

  return true;
}

async function _setLocale(host, sid, wUser) {
  // const tz = parseInt(wUser.user.prp.tz);
  return await _callAPI({
    host,
    sid,
    svc: "render/set_locale",
    params: {
      tzOffset: 10800,
      flags: 256,
      language: "ru"
      // formatDate: "%Y-%m-%E %H:%M:%S"
    }
  });
}

async function _execReport({
  host,
  sid,
  resourceId,
  templateId,
  group,
  from,
  to
}) {
  const params = {
    reportResourceId: resourceId,
    reportTemplateId: templateId,
    reportObjectId: group,
    reportObjectSecId: 0,
    interval: {
      from,
      to,
      flags: 16777216
    },
    reportObjectIdList: [group]
  };

  const execReportResult = await _callAPI({
    host,
    svc: "report/exec_report",
    sid,
    params
  });

  return execReportResult;
}

async function _selectResultRows(host, sid, execReportResult) {
  const table = execReportResult.reportResult.tables[0];
  if (!table) return "No rows";
  const to = execReportResult.reportResult.tables[0].rows;
  const params = {
    tableIndex: 0,
    config: {
      type: "range",
      data: {
        from: 0,
        to,
        level: 3,
        unitInfo: 1
      }
    }
  };
  const rows = await _callAPI({
    host,
    sid,
    svc: "report/select_result_rows",
    params
  });
  return rows;
}

function _chartsData(rows, ecoRows) {
  if (rows == "No rows" || ecoRows == "No rows") {
    return [];
  }
  const dates = rows[0].r;
  const shifts = [];
  const ecoShifts = [];
  const unifiedShifts = [];
  /* function extractDate(str) {
    return str.match(/\d{4}-\d{2}-\d{2}/)[0];
  } */

  dates.forEach((date) => {
    shifts.push(...date.r);
  });

  ecoRows.forEach((date) => {
    ecoShifts.push(...date.r);
  });

  // ------------------------ Extracting reports data ----------------------------------------

  shifts.forEach((shift, index) => {
    const prevShift = shifts[index - 1];
    if (!!prevShift && prevShift.c[1] === shift.c[1]) {
      /* const allUnits = _.concat(prevShift.r, shift.r);
      const unifiedUnits = _.uniqBy(allUnits, "uid");
      const unitsCount = unifiedUnits.length;
      prevShift.data = [unitsCount]; */

      // Setting the units count (Chart 1)
      const unifiedUnits = _.unionBy(prevShift.r, shift.r, "uid");
      const uniShift = unifiedShifts[unifiedShifts.length - 1];
      uniShift.data[0] = unifiedUnits.length;

      // Setting the average engine hours (Chart 2)
      const engineHours = (parseFloat(shift.c[6]) / shift.r.length).toFixed(2);
      uniShift.data[1] = (
        (parseFloat(uniShift.data[1]) + parseFloat(engineHours)) /
        2
      ).toFixed(2);

      // Average idling hours (Chart 3)
      const idlingHours = (parseFloat(shift.c[8]) / shift.r.length).toFixed(2);
      uniShift.data[2] = (
        (parseFloat(uniShift.data[2]) + parseFloat(idlingHours)) /
        2
      ).toFixed(2);

      // Average fuel consumed (Chart 4)
      const consumeFuel = (
        parseFloat(shift.c[11]) / parseFloat(shift.c[6])
      ).toFixed(2);
      uniShift.data[3] = (
        (parseFloat(uniShift.data[3]) + parseFloat(consumeFuel)) /
        2
      ).toFixed(2);

      // Average eco rank (Chart 5)
      const ecoRank = parseFloat(ecoShifts[index].c[6]);
      uniShift.data[4] = ((parseFloat(uniShift.data[4]) + ecoRank) / 2).toFixed(
        2
      );
    } else {
      const length = shift.r.length; // Chart 1
      const engineHours = (parseFloat(shift.c[6]) / length).toFixed(2); //Chart 2
      const idlingHours = (parseFloat(shift.c[8]) / length).toFixed(2); // Chart 3
      // const consumeFuel = (parseFloat(shift.c[11]) / length).toFixed(2); // Chart 4
      const consumeFuel = (
        parseFloat(shift.c[11]) / parseFloat(shift.c[6])
      ).toFixed(2); // Chart 4
      const ecoRank = parseFloat(ecoShifts[index].c[6]).toFixed(2);
      unifiedShifts.push({
        name: shift.c[1],
        data: [length, engineHours, idlingHours, consumeFuel, ecoRank]
      });
    }
  });

  // ---------------------- Adding the average extra column ----------------------------------------
  const reducer = (accumulator, currentValue) =>
    parseFloat(accumulator) + parseFloat(currentValue);

  const averageValues = [];

  for (let i = 0; i < 5; i++) {
    const values = unifiedShifts.map((shift) => shift.data[i]);
    const averageValue = (values.reduce(reducer) / values.length).toFixed(2);
    averageValues.push(averageValue);
  }

  // Rounding the average units count
  averageValues[0] = parseFloat(averageValues[0]).toFixed(0);

  unifiedShifts.push({
    name: "Среднее за период",
    data: averageValues
  });

  return unifiedShifts;
}

async function _sheduledMailings() {
  try {
    console.log("📊 In hourly charts-service mailing schedule CRON job...");
    const users = await db.charts_users.findAll({
      where: {
        mailing: true
      },
      raw: true,
      nest: true
    });

    for (let user of users) {
      const wUser = await _token_login(user.host, user.token);
      console.log(`📊   Mailing to user ${wUser.user.nm}...`);
      const tz = parseInt(wUser.user.prp.tz);
      let tzOffset = tz & 0xffff;
      if (tz < 0) tzOffset = tzOffset | 0xffff0000;
      const hour = parseInt(
        moment()
          .utcOffset(tzOffset / 60)
          .format("k")
      );
      const serverTimeZone = moment()
        .utcOffset(tzOffset / 60)
        .format("Z");
      console.log(`📊   User's timezone: ${serverTimeZone}`);
      // Generating the charts data
      const from = moment()
        .utc()
        .utcOffset(tzOffset / 60)
        .subtract(2, "days")
        .hour(8)
        .minute(0)
        .second(0)
        .unix();
      // console.log(`from: ${from}`);

      const to =
        moment()
          .utc()
          .utcOffset(tzOffset / 60)
          .hour(8)
          .minute(0)
          .second(0)
          .unix() - 1;
      // console.log(`to: ${from}`);

      const sid = wUser.eid;
      await _setLocale(user.host, sid, wUser);
      const items = await _update_data_flags(user.host, sid);
      const classes = wUser.classes;
      const groups = _getGroups(items, classes);
      // const groupCount = groups[0].count; // Temp
      // const group = groups[0].id; // Temp
      const defaultGroup = groups.find(
        (group) => group.id == user.defaultGroup
      );
      const group = defaultGroup.id;
      const groupCount = defaultGroup.count;
      const execReportResult = await _execReport({
        host: user.host,
        sid,
        resourceId: user.engineReportResource,
        templateId: user.engineReportTemplate,
        group,
        from,
        to
      });
      const rows = await _selectResultRows(user.host, sid, execReportResult);

      const ecoReportResult = await _execReport({
        host: user.host,
        sid,
        resourceId: user.ecoReportResource,
        templateId: user.ecoReportTemplate,
        group,
        from,
        to
      });
      const ecoRows = await _selectResultRows(user.host, sid, ecoReportResult);

      const shifts = _chartsData(rows, ecoRows);

      const pdf = await _pdf(shifts, groupCount, {
        username: wUser.au,
        host: user.host,
        groupName: defaultGroup.name,
        period: `${moment(from, "X")
          .utc()
          .utcOffset(tzOffset / 60)
          .format("HH:mm DD.MM.YYYY")} - ${moment(to, "X")
          .utc()
          .utcOffset(tzOffset / 60)
          .format("HH:mm DD.MM.YYYY")}`,
        serverTimeZone
      });

      const result = await db.charts_mailings.findAll({
        where: {
          user_id: user.id,
          hour
        },
        raw: true,
        nest: true
      });

      console.log(
        `📊   Found ${result.length} emails for sending in current hour`
      );

      for (let mailing of result) {
        const sendingResult = await _send(mailing.email, pdf);
        if (sendingResult.result.success)
          console.log(`📊     Successfully sent to ${mailing.email}`);
      }
    }

    console.log(`📊 Shutting down...`);

    return true;
  } catch (e) {
    console.log(e);
  }
}

async function _send(email, attachment) {
  try {
    const result = await Queue.newJob("mail-service", {
      method: "send",
      data: {
        lang: "ru",
        code: "CHARTS",
        to: email,
        attachments: [
          {
            filename: "charts.pdf",
            content: attachment,
            encoding: "base64"
          }
        ]
      },
      realmId: "2b4c01ca-2749-11eb-adc1-0242ac120002"
    });
    return result;
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  _signInWithToken,
  _signInWithHash,
  _update_data_flags,
  _getGroups,
  _getTemplates,
  _token_login,
  _getResources,
  _setLocale,
  _execReport,
  _selectResultRows,
  _chartsData,
  _sheduledMailings
};
