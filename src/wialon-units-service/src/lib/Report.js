import Unit from "./Unit";
import { requestToWialon, removeTimezoneOffset } from "@lib/utils";
import db from "@lib/db";
import Queue from "@lib/queue";
import xlsx from "excel4node";
import config from "@lib/config";
import uuid from "uuid/v4";
let row = 1;

async function createGroup({ user, name, sid, host }) {
  const params = {
    creatorId: user.id,
    name,
    dataFlags: 1
  };

  const { item } = await requestToWialon({
    sid,
    params,
    svc: "core/create_unit_group",
    host
  });

  return item;
}

async function addUnitToGroup({ units, itemId, sid, host }) {
  const params = {
    itemId,
    units
  };

  return await requestToWialon({
    sid,
    params,
    svc: "unit_group/update_units",
    host
  });
}

async function deleteGroup({ itemId, sid, host }) {
  const params = {
    itemId
  };

  return await requestToWialon({ sid, params, svc: "item/delete_item", host });
}

async function setLocale({ lang = "en", tz, sid, host }) {
  const params = {
    tzOffset: tz,
    language: lang
  };

  return await requestToWialon({
    sid,
    params,
    svc: "render/set_locale",
    host
  });
}

async function createReport(data, realm, userId) {
  let isGroupObject = null;

  Queue.newJob("auth-service", {
    method: "insertLogs",
    data: {
      user_id: userId,
      action: "CREATE_REPORT",
      message: "User requested a report with parameters:",
      data: {
        ...data
      }
    }
  });

  const wialonAccount = await db.wialon_accounts.findByPk(
    data.wialon_account_id,
    {
      attributes: ["id", "wialon_token", "wialon_hosting_url"],
      raw: true
    }
  );

  const { eid: sid, user: wialonProfile } = await Unit.wialonLogin(
    wialonAccount.wialon_hosting_url,
    wialonAccount.wialon_token
  );

  let aggregators = [];
  if (data.aggregator_ids) {
    aggregators = await db.aggregator.findAll({
      where: {
        removed: 0,
        id: data.aggregator_ids
      },
      raw: true,
      order: [["ctime", "DESC"]]
    });
  }

  let start_date, end_date;
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "localtest"
  ) {
    start_date = data.start_date / 1000;
    end_date = data.end_date / 1000;
  } else {
    start_date =
      removeTimezoneOffset(data.start_date, wialonProfile.prp.tz) / 1000;
    end_date = removeTimezoneOffset(data.end_date, wialonProfile.prp.tz) / 1000;
  }
  let templateId = null;

  const resourceId = wialonProfile.bact;
  try {
    if (data.unit_ids.length == 1) {
      data.group_id = data.unit_ids[0];
    } else if (data.unit_ids.length > 1 && data.type_report == "UNITS") {
      const group = await createGroup({
        user,
        name: `${new Date().getTime().toString()}_REPOGEN_FUEL`,
        sid
      });

      data.group_id = group.id;
      isGroupObject = group;
      await addUnitToGroup({
        itemId: group.id,
        units: data.unit_ids,
        sid
      });
    }

    await setLocale({
      sid,
      lang: data.lang ? data.lang.toLowerCase() : "en",
      tz: wialonProfile.prp.tz,
      host: wialonAccount.wialon_hosting_url
    });

    const reportTemplate = await generateReportTemplate({
      resourceId,
      sid,
      host: wialonAccount.wialon_hosting_url
    });

    templateId = reportTemplate[0];

    await cleanUpResult({
      sid,
      host: wialonAccount.wialon_hosting_url
    });

    await getDataAboutReport({
      sid,
      resourceId,
      templateId,
      host: wialonAccount.wialon_hosting_url
    });

    let resultExecReport = await execReport({
      sid,
      group_id: data.group_id,
      start_date,
      end_date,
      resourceId,
      templateId,
      host: wialonAccount.wialon_hosting_url
    });

    if (
      resultExecReport.reportResult &&
      resultExecReport.reportResult.tables &&
      !resultExecReport.reportResult.tables.length
    ) {
      throw "FOUNDNOONERECORDFORREPORT";
    }

    let allData = await getAllDataFromReport({
      sid,
      resultExecReport,
      host: wialonAccount.wialon_hosting_url
    });

    for (const aggregator of aggregators) {
      allData[0].headers.push(`${aggregator.name}(fueled)`);
    }
    allData[0].headers.push(`Заправлено(карты).`);
    allData[0].headers.push(`Разница(ДУТ-Карты)`);
    let sumAllUnitsByAggregator;
    if (allData.length < 3) {
      sumAllUnitsByAggregator = await forEmptyThirdTable(
        allData[0].data,
        aggregators
      );
    } else if (allData.length == 3) {
      sumAllUnitsByAggregator = await sumEachAggregator(
        allData[2].data,
        aggregators
      );
    }

    await transferSumFromObjectToMainArray(
      allData[0].data,
      sumAllUnitsByAggregator,
      aggregators
    );

    if (allData[2] && allData[2].data.length < allData[0].data.length) {
      for (let unit of allData[0].data.filter((el) => !el.general_sum)) {
        for (const aggregator of aggregators) {
          unit.c.push(
            Number(0)
              .toFixed(2)
              .toString() + " л"
          );
        }
        unit.c.push("0.00 л");
        const regex = new RegExp("( л)", "gm");
        unit.c.push(
          (Number(unit.c[6].replace(regex, "")) - 0).toFixed(2).toString() +
            " л"
        );
      }
    }

    Queue.newJob("auth-service", {
      method: "insertLogs",
      data: {
        user_id: userId,
        action: "CREATED_REPORT",
        message:
          "The user has successfully generated a report with the following parameters:",
        data: {
          ...data
        }
      }
    });

    const { file_name } = await storeFile(allData);

    allData[0].file_name = file_name;
    return { report: allData[0], success: true };
  } catch (e) {
    Queue.newJob("auth-service", {
      method: "insertLogs",
      data: {
        user_id: userId,
        action: "ERROR_CREATE_REPORT",
        message: "An error occurred while generating the report:",
        data: {
          error:
            typeof e == "object" ? JSON.stringify(e) : "Error with code:" + e
        }
      }
    });

    throw e;
  } finally {
    if (resourceId && templateId) {
      await deleteReportTemplate({
        resourceId,
        templateId,
        sid,
        host: wialonAccount.wialon_hosting_url
      });
    }

    if (isGroupObject && isGroupObject.id) {
      await deleteGroup({
        sid,
        itemId: isGroupObject.id,
        host: wialonAccount.wialon_hosting_url
      });
    }
  }
}

async function transferSumFromObjectToMainArray(data, sumAll, aggregators) {
  for (let unit of data) {
    for (const sumOfUnit of sumAll) {
      for (const aggregator of aggregators) {
        for (let key of Object.keys(sumOfUnit)) {
          if (
            unit.c[1] == sumOfUnit.unit_name &&
            key.indexOf(aggregator.name) > -1
          ) {
            unit.c.push(
              Number(sumOfUnit[key])
                .toFixed(2)
                .toString() + " л"
            );
          }
        }
      }
      if (unit.c[1] == sumOfUnit.unit_name) {
        unit.c.push(sumOfUnit.general_sum);
        const regex = new RegExp("( л)", "gm");
        unit.c.push(
          (
            Number(unit.c[6].replace(regex, "")) -
            Number(sumOfUnit.general_sum.replace(regex, ""))
          )
            .toFixed(2)
            .toString() + " л"
        );
      }
    }
  }
  return;
}

async function sumEachAggregator(data, aggregators) {
  let res = [],
    objectToPush = {};
  for (let unit of data) {
    objectToPush = {};
    objectToPush.unit_name = unit.c[1];
    objectToPush.general_sum = 0;
    for (const aggregator of aggregators) {
      objectToPush[aggregator.name + "_sum"] = 0;
      for (let transaction of unit.r) {
        if (
          typeof transaction.c[3] == "string"
            ? transaction.c[3].indexOf("Aggregator name:" + aggregator.name) >
              -1
            : transaction.c[3].t.indexOf("Aggregator name:" + aggregator.name) >
              -1
        ) {
          const allValues =
            typeof transaction.c[3] == "string"
              ? transaction.c[3].split(";")
              : transaction.c[3].t.split(";");
          for (const value of allValues) {
            if (value.indexOf("Fuel amount") > -1) {
              const splitedValue = value.split(":");
              if (splitedValue && splitedValue[1]) {
                objectToPush.general_sum += Number(splitedValue[1]);
                objectToPush[aggregator.name + "_sum"] += Number(
                  splitedValue[1]
                );
              }
            }
          }
        }
      }
    }
    objectToPush.general_sum =
      Number(objectToPush.general_sum)
        .toFixed(2)
        .toString() + " л";
    res.push(objectToPush);
  }
  return res;
}

async function forEmptyThirdTable(data, aggregators) {
  let res = [],
    objectToPush = {};
  for (let unit of data) {
    objectToPush = {};
    objectToPush.unit_name = unit.c[1];
    for (const aggregator of aggregators) {
      objectToPush[aggregator.name + "_sum"] = 0;
    }
    objectToPush.general_sum =
      Number(0)
        .toFixed(2)
        .toString() + " л";
    res.push(objectToPush);
  }

  return res;
}

async function getAllDataFromReport({ sid, resultExecReport, host }) {
  let allData = [];
  let i = 0;
  for (const element of resultExecReport.reportResult.tables) {
    let objectToPush = {};
    objectToPush.headers = element.header;
    let dataOfTable = await selectRows(
      sid,
      i,
      element.rows,
      element.level,
      host
    );
    // await getAllDataFromObject(dataOfTable);
    objectToPush.data = dataOfTable;
    objectToPush.total = element.total;
    allData.push(objectToPush);

    i++;
  }
  return allData;
}

async function selectRows(sid, page, to, level, host) {
  const params = {
    tableIndex: page,
    config: {
      type: "range",
      data: {
        from: 0,
        to: to,
        level: level + 1,
        unitInfo: 1
      }
    }
  };
  return await requestToWialon({
    sid,
    params,
    svc: "report/select_result_rows",
    host
  });
}

async function generateReportTemplate({ resourceId, sid, host }) {
  const params = {
    id: 0,
    itemId: resourceId,
    callMode: "create",
    n: "2. Сводный группа",
    ct: "avl_unit_group",
    p: '{"descr":"","bind":{"avl_unit_group":[]}}',
    tbl: [
      {
        n: "unit_group_thefts",
        l: "Сливы",
        c: "",
        cl: "",
        cp: "",
        s: '["render_theft_markers"]',
        sl: '["Маркеры сливов"]',
        filter_order: [],
        p: "",
        sch: {
          f1: 0,
          f2: 0,
          t1: 0,
          t2: 0,
          m: 0,
          y: 0,
          w: 0,
          fl: 0
        },
        f: 0
      },
      {
        n: "unit_group_fillings",
        l: "Заправки",
        c: "",
        cl: "",
        cp: "",
        s: '["render_filling_markers"]',
        sl: '["Маркеры заправок"]',
        filter_order: [],
        p: "",
        sch: {
          f1: 0,
          f2: 0,
          t1: 0,
          t2: 0,
          m: 0,
          y: 0,
          w: 0,
          fl: 0
        },
        f: 0
      },
      {
        n: "unit_group_stats",
        l: "Статистика",
        c: "",
        cl: "",
        cp: "",
        s:
          '["address_format","time_format","us_units","skip_empty_rows","exclude_thefts","trips_mileage","precise_calculations"]',
        sl:
          '["Address","Time Format","Measure","Пропускать пустые строки","Исключить сливы из расхода топлива","Считать пробег только по поездкам","Пробег и топливо с точностью до сотых"]',
        filter_order: [],
        p:
          '{"address_format":"1255211008_10_5","time_format":"%Y-%m-%E_%H:%M:%S","us_units":0}',
        sch: {
          f1: 0,
          f2: 0,
          t1: 0,
          t2: 0,
          m: 0,
          y: 0,
          w: 0,
          fl: 0
        },
        f: 0
      },
      {
        n: "unit_group_generic",
        l: "Сводка",
        c:
          '["correct_mileage","in_motion","eh","thefted","filled","fuel_consumption_fls","avg_fuel_consumption_fls","avg_fuel_consumption_rates","user_column"]',
        cl:
          '["Пробег","Время в движении","Моточасы","Слито","Заправлено(ДУТ)","Потрачено","Ср. расход по ДУТ","Ср. расход по нормам","Разница"]',
        cp:
          '[{},{},{},{},{},{},{},{},{"p":"(avg_fuel_consumption_rates) - (avg_fuel_consumption_fls)","m":"л","vt":"0"}]',
        s: "",
        sl: "",
        filter_order: ["base_eh_sensor", "sensor_name", "custom_sensors_col"],
        p:
          '{"grouping":"{\\"type\\":\\"unit\\"}","custom_interval":{"type":0},"duration_format":"1","custom_sensors_col":[""]}',
        sch: {
          f1: 0,
          f2: 0,
          t1: 0,
          t2: 0,
          m: 0,
          y: 0,
          w: 0,
          fl: 0
        },
        f: 4112
      },
      {
        n: "unit_group_fillings",
        l: "Заправки",
        c: '["time_end","location_end","filled","registered","difference"]',
        cl:
          '["Время","Положение","Заправлено(ДУТ)","Заправлено(Карты)","Разница"]',
        cp: "[{},{},{},{},{}]",
        s: "",
        sl: "",
        filter_order: [
          "geozones_ex",
          "fillings",
          "driver",
          "trailer",
          "sensor_name",
          "custom_sensors_col"
        ],
        p: '{"grouping":"{\\"type\\":\\"unit\\"}","custom_sensors_col":[""]}',
        sch: {
          f1: 0,
          f2: 0,
          t1: 0,
          t2: 0,
          m: 0,
          y: 0,
          w: 0,
          fl: 0
        },
        f: 4368
      },
      {
        n: "unit_group_events",
        l: "События",
        c: '["time","evt_text","evt_type","events_count"]',
        cl: '["Время события","Текст события","Тип события","Кол-во"]',
        cp: "[{},{},{},{}]",
        s: "",
        sl: "",
        filter_order: ["event_mask", "driver"],
        p: '{"grouping":"{\\"type\\":\\"unit\\"}","event_mask":"*транзакц*"}',
        sch: {
          f1: 0,
          f2: 0,
          t1: 0,
          t2: 0,
          m: 0,
          y: 0,
          w: 0,
          fl: 0
        },
        f: 4352
      }
    ]
  };
  return await requestToWialon({
    sid,
    params,
    svc: "report/update_report",
    host
  });
}

async function execReport({
  sid,
  group_id,
  start_date,
  end_date,
  resourceId,
  templateId,
  host
}) {
  const params = {
    reportResourceId: resourceId,
    reportTemplateId: templateId,
    reportTemplate: null,
    reportObjectId: Number(group_id),
    reportObjectSecId: 0,
    interval: {
      flags: 16777216,
      from: Number(start_date),
      to: Number(end_date)
    }
  };
  return await requestToWialon({
    sid,
    params,
    svc: "report/exec_report",
    host
  });
}

async function cleanUpResult({ sid, host }) {
  return await requestToWialon({
    sid,
    params: {},
    svc: "report/cleanup_result",
    host
  });
}

async function deleteReportTemplate({ templateId, resourceId, sid, host }) {
  const params = {
    id: templateId,
    itemId: resourceId,
    callMode: "delete"
  };

  return await requestToWialon({
    sid,
    params,
    svc: "report/update_report",
    host
  });
}

async function getDataAboutReport({ resourceId, templateId, sid, host }) {
  const params = {
    itemId: resourceId,
    col: [templateId],
    flags: 0
  };

  return await requestToWialon({
    sid,
    params,
    svc: "report/get_report_data",
    host
  });
}

async function storeFile(data) {
  const fileName = uuid();
  const wb = new xlsx.Workbook();
  const path = config.upload_dir + `/${fileName}.xlsx`;
  await make(data, wb);
  await createFile(path, wb);

  return { file_name: fileName };
}

async function createFile(path, wb) {
  return new Promise((res, rej) => {
    wb.write(path, function(err, stats) {
      if (err) {
        console.error(err);
      } else {
        res(stats);
      }
    });
  });
}

async function addWorksheet(title, wb) {
  return await wb.addWorksheet(title);
}

async function insertOneTable(
  nameOfSheets,
  tableData,
  headers,
  total,
  styles,
  wb
) {
  let page = await addWorksheet(nameOfSheets, wb);
  let column = 1;
  let style;
  style = styles.cellContent;
  style = styles.headers;

  headers.forEach((chs) => {
    page.column(column).setWidth(14);
    page
      .cell(row, column)
      .string(chs.toString())
      .style(style);
    column++;
  });
  row++;
  column = 1;
  tableData.forEach((csvRow) => {
    insertOneObject(headers.length, csvRow, styles, page, 1);
  });
  column = 1;
  row = 1;
  page.column(1).setWidth(5);
  page.column(2).setWidth(16);
  page.column(3).setWidth(10);
  page.column(4).setWidth(12);
  page.column(5).setWidth(11);
  page.column(6).setWidth(8);
  page.column(7).setWidth(12);
  page.column(8).setWidth(9);
  page.column(9).setWidth(12);
  page.column(10).setWidth(17);
  page.column(11).setWidth(10);
  page.column(12).setWidth(10);
  page.column(13).setWidth(12);
  page.row(1).freeze();
  page.column(2).freeze();
}

async function insertOneObject(
  headersLength,
  inputObject,
  styles,
  ws,
  groupName
) {
  let column = 1,
    style;
  style = styles.cellContent;
  for (let element of inputObject.c) {
    let value = !element ? "-----" : element.toString();
    if (value.length == 0) {
      value = "-----";
    }
    ws.cell(row, column)
      .string(value)
      .style(style);
    column++;
    if (column > headersLength) {
      break;
    }
  }
  row++;
  if (inputObject.r) {
    inputObject.r.forEach((element) => {
      ws.row(row).group(groupName, true);
      insertOneObject(element, styles, ws, groupName + 1);
    });
  }
}

async function make(xlsxData, wb) {
  let defaultAlignment = {
    horizontal: "center",
    vertical: "center"
  };
  let defaultborder = {
    left: {
      style: "thin",
      color: "#000000"
    },
    right: {
      style: "thin",
      color: "#000000"
    },
    top: {
      style: "thin",
      color: "#000000"
    },
    bottom: {
      style: "thin",
      color: "#000000"
    }
  };

  var styles = {
    stats: wb.createStyle({
      font: {
        size: 10,
        color: "464646",
        name: "Times New Roman"
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#F2F2F2",
        fgColor: "#F2F2F2"
      },
      border: defaultborder
    }),
    cellContent: wb.createStyle({
      font: {
        size: 10,
        color: "464646",
        name: "Times New Roman"
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#F2F2F2",
        fgColor: "#F2F2F2"
      },
      border: defaultborder,
      alignment: defaultAlignment
    }),
    contentStyle: wb.createStyle({
      font: {
        size: 10,
        color: "464646",
        name: "Times New Roman",
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#F2F2F2",
          fgColor: "#C0C0C0"
        }
      },
      border: defaultborder
    }),
    headers: wb.createStyle({
      font: {
        size: 10,
        color: "#464646",
        name: "Times New Roman"
      },
      fill: {
        type: "pattern",
        patternType: "solid",
        bgColor: "#E1E1E1",
        fgColor: "#E1E1E1"
      },
      border: defaultborder,
      alignment: defaultAlignment
    })
  };

  xlsxData = [xlsxData[0]];
  xlsxData.forEach(async (row) => {
    await insertOneTable(
      "Отчёт - топливные карты",
      row.data,
      row.headers,
      row.total,
      styles,
      wb
    );
  });
}

export default {
  createReport
};
