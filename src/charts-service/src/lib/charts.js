import {
  _signInWithToken,
  _signInWithHash,
  _update_data_flags,
  _getGroups,
  _getTemplates,
  _getResources,
  _setLocale,
  _execReport,
  _selectResultRows,
  _chartsData,
  _token_login,
  _sheduledMailings
} from "./wialon";
import Queue from "@lib/queue";
const db = require("@lib/db");

async function sign_in({ host, token, hash }) {
  let { user, wUser } = !!token
    ? await _signInWithToken(host, token)
    : await _signInWithHash(host, hash);

  const sid = wUser.eid;
  const items = await _update_data_flags(host, sid);

  const classes = wUser.classes;
  const groups = _getGroups(items, classes);
  // Setting the default group
  if (!user.defaultGroup) {
    await db.charts_users.update(
      {
        defaultGroup: groups[0].id
      },
      {
        where: {
          id: user.id
        }
      }
    );
    user.defaultGroup = groups[0].id;
  }
  const resources = await _getResources(items, classes);
  const resourcesTemplates = await _getTemplates(host, sid, resources);

  return {
    wUser: wUser,
    user,
    groups,
    resources: resourcesTemplates,
    items,
    token: user.token
  };
}

async function set_templates({
  host,
  token,
  engineReportResource,
  engineReportTemplate,
  ecoReportResource,
  ecoReportTemplate
}) {
  const wUser = await _token_login(host, token);
  // console.log(wUser);

  const savedUser = await db.charts_users.update(
    {
      engineReportResource,
      engineReportTemplate,
      ecoReportResource,
      ecoReportTemplate
    },
    {
      where: {
        wialon_id: wUser.user.id
      },
      returning: true
    }
  );
  // console.log(savedUser.toJSON());
  return savedUser[1][0];
}

async function charts_data({ host, token, group, from, to }) {
  const { user, wUser } = await _signInWithToken(host, token);
  const sid = wUser.eid;
  const locale = await _setLocale(host, sid, wUser);
  // const items = await _update_data_flags(host, sid);
  // const classes = wUser.classes;
  // const templates = await _getTemplates(host, sid);
  // const resources = await _getResources(items, classes);

  // const resourceId = resources[0].id;
  const paramsForExecReport = {
    host,
    sid,
    resourceId: Number(user.engineReportResource),
    templateId: Number(user.engineReportTemplate),
    group: Number(group),
    from: Number(from),
    to: Number(to)
  };

  const execReportResult = await _execReport(paramsForExecReport);

  const rows = await _selectResultRows(host, sid, execReportResult);

  const ecoReportResult = await _execReport(paramsForExecReport);

  const ecoRows = await _selectResultRows(host, sid, ecoReportResult);

  const chartsData = _chartsData(rows, ecoRows);

  return { table: execReportResult, chartsData };
}

async function getMailingList({ host, token }) {
  const { user } = await _signInWithToken(host, token);

  const list = await db.charts_mailings.findAll({
    where: {
      user_id: user.id
    }
  });
  return list;
}

async function addMailing({ host, token, email, hour }) {
  const { user } = await _signInWithToken(host, token);

  const mailing = await db.charts_mailings.create({
    user_id: user.id,
    email,
    hour
  });
  return mailing;
}

async function updateMailing({ host, token, id, email, hour }) {
  const { user } = await _signInWithToken(host, token);

  const result = await db.charts_mailings.update(
    {
      email,
      hour
    },
    {
      where: {
        id,
        user_id: user.id
      },
      returning: true
    }
  );
  return result[1][0];
}

async function removeMailing({ host, token, id }) {
  const { user } = await _signInWithToken(host, token);

  const result = await db.charts_mailings.destroy({
    where: {
      id,
      user_id: user.id
    }
  });

  return result;
}

async function switchMailings({ host, token, mailing }) {
  const { user } = await _signInWithToken(host, token);

  const result = await db.charts_users.update(
    { mailing },
    { where: { id: user.id } }
  );
  return result;
}

async function setMailingGroup({ host, token, defaultGroup }) {
  const { user } = await _signInWithToken(host, token);

  const result = await db.charts_users.update(
    { defaultGroup },
    {
      where: {
        id: user.id
      }
    }
  );
  return result;
}

async function scheduledMailings() {
  return await _sheduledMailings();
}

async function ping() {
  console.log("Ping income request");
  return true;
}

/* async function testMailings() {
  const data = await _sheduledMailings();
  return data;
} */

export default {
  sign_in,
  set_templates,
  charts_data,
  ping,
  getMailingList,
  updateMailing,
  addMailing,
  removeMailing,
  switchMailings,
  setMailingGroup,
  scheduledMailings
  // testMailings
};
