const Base = require("../lib/base");
let lang = "en";
let row = 2;

const index_keys = [
  {
    table_index: 0,
    0: "number",
    1: "grouping",
    2: "location_begin",
    3: "time",
    4: "location_end",
    5: "duration",
    6: "mileage",
    7: "avg_speed",
    8: "max_speed"
  },
  {
    table_index: 1,
    0: "number",
    1: "grouping",
    2: "begin",
    3: "time",
    4: "duration",
    5: "location",
    6: "count"
  },
  {
    table_index: 2,
    0: "number",
    1: "grouping",
    2: "begin",
    3: "time",
    4: "duration",
    5: "location",
    6: "count"
  }
];

const h_t = {
  statistics: {
    en: "Statistics",
    ru: "Статистика"
  },
  report_name: {
    en: "Report name",
    ru: "Отчет"
  },
  unit_group_name: {
    en: "Unit group name",
    ru: "Группа"
  },
  time_begin: {
    en: "Interval start",
    ru: "Начало интервала"
  },
  time_end: {
    en: "Interval end",
    ru: "Окончание интервала"
  },
  current_time: {
    en: "Report processing time",
    ru: "Время выполнения отчета"
  },
  fuelings: {
    en: "Fuelings",
    ru: "Заправки"
  },
  fuel_level_begin: {
    en: "Fuel level start",
    ru: "Нач. уровень"
  },
  filled: {
    en: "Filled",
    ru: "Заправлено"
  },
  fuel_level_filled: {
    en: "Fuel level filled",
    ru: "Кон. уровень"
  },
  count: {
    en: "Count",
    ru: "Кол-во"
  },
  thefts: {
    en: "Thefts",
    ru: "Сливы"
  },
  time_begin: {
    en: "Begin",
    ru: "Начало"
  },
  location_begin: {
    en: "Location begin",
    ru: "Нач. положение"
  },
  time_end: {
    en: "Time",
    ru: "Время"
  },
  location_end: {
    en: "Location end",
    ru: "Кон. положение"
  },
  thefted: {
    en: "Thefted",
    ru: "Слито"
  },
  fuel_level_thefted: {
    en: "Fuel level after thefted",
    ru: "Кон. уровень"
  },
  unit_name: {
    en: "Unit name",
    ru: "Название объекта"
  },
  duration: {
    en: "Duration",
    ru: "Длительность"
  },
  mileage: {
    en: "Mileage",
    ru: "Пробег"
  },
  avg_speed: {
    en: "Avg. speed",
    ru: "Ср. скорость"
  },
  max_speed: {
    en: "Max speed",
    ru: "Макс. скорость"
  },
  trips: {
    en: "Trips",
    ru: "Поездки"
  },
  stops: {
    en: "Stops(less than 10 mins)",
    ru: "Остановки(менее 10 минут)"
  },
  location: {
    en: "Location",
    ru: "Положение"
  },
  stays: {
    en: "Stays(more than 10 mins)",
    ru: "Стоянки(более 10 минут)"
  },
  content: {
    en: "Content",
    ru: "Содержание"
  },
  name_of_report: {
    en: "Stops and Stays Group Report",
    ru: "Остановки и Стоянки Групповой Отчёт"
  }
};

class Report extends Base {
  //3. Create report template on the Wialon Account
  //4. Get headers and name of the report
  //5. Generate report
  //6. Parse report
  //7. Delete report template
  //6. Make xlsx file
  async getData(params) {
    let resourceId, templateId;
    try {
      lang = params.lang.toLowerCase() || "en";
      const tz =
        this.loginData.user.prp.tz < 0
          ? (this.loginData.user.prp.tz & 0xffff) | 0xffff0000
          : this.loginData.user.prp.tz & 0xffff;

      const startDate =
        (params.startDateMill -
          tz * 1000) /*+ new Date().getTimezoneOffset() * 60000*/ /
        1000;
      const endDate =
        (params.endDateMill -
          tz * 1000) /*+ new Date().getTimezoneOffset() * 60000*/ /
        1000;

      // Clean up before reports - done
      const cleanUpResult = await this.cleanUpResult();

      // Get id of resource - done
      resourceId = await this.getIdOfResource();

      //Create report template on the Wialon Account - done
      const updateReportCreate = await this.createTemplateReportOnWialon(
        resourceId
      );

      //Get template Id
      templateId = updateReportCreate[0];
      //Get headers and name of the report

      const execReport = await this.execReport(
        params.group_name,
        startDate,
        endDate,
        resourceId,
        templateId
      );

      const allData = await this.getAllDataFromReport(execReport);
      const jasperData = await this.convertToJasperFormat(
        allData,
        execReport.reportResult.stats
      );

      allData.push({ header: [], data: execReport.reportResult.stats });

      const response = { xlsxData: allData, jasperData };

      return response;
    } finally {
      if (resourceId && templateId) {
        await this.deleteReportTemplate(resourceId, templateId);
      }
    }
  }

  async convertToJasperFormat(data, stats) {
    const responseArr = {};

    responseArr.statistics = {
      headers: [],
      data: {
        report_name: stats[0][1],
        group_name: stats[1][1],
        begin: stats[2][1],
        time: stats[3][1],
        report_time_processing: stats[4][1]
      },
      total: null
    };

    for (let i = 0; i < data.length; i++) {
      const tableIndex = index_keys.find((table) => table.table_index === i);

      const headers = {};
      for (let x = 0; x < data[i].headers.length; x++) {
        headers[tableIndex[x]] = data[i].headers[x];
      }

      responseArr["table" + i] = { headers, data: [], total: null };

      for (let j = 0; j < data[i].data.length; j++) {
        await this.convertCObjectToJasperFormat(
          data[i].data[j],
          tableIndex,
          1,
          responseArr["table" + i].data,
          null
        );
      }

      const recordToPush = {};
      for (let j = 0; j < data[i].total.length; j++) {
        let value = data[i].total[j].toString();
        if (!value) {
          value = "-----";
        }

        recordToPush[tableIndex[j]] = value;
        recordToPush.group = 1;
      }
      responseArr["table" + i].total = recordToPush;
    }
    return responseArr;
  }

  async convertCObjectToJasperFormat(
    record,
    tableIndex,
    group,
    arrayToPush,
    date
  ) {
    const recordToPush = {};
    for (let i = 0; i < record.c.length; i++) {
      let value =
        typeof record.c[i] == "object"
          ? record.c[i].t.toString()
          : record.c[i].toString();
      if (!value) {
        value = "-----";
      }
      recordToPush[tableIndex[i]] = value;

      if (group === 1) {
        date = null;
      }

      if (group === 2 && tableIndex[i] == "grouping") {
        date = value;
      }

      if (
        (group == 2 || group == 3) &&
        tableIndex[i] == "grouping" &&
        !!recordToPush.number
      ) {
        const rec = arrayToPush.find(
          (item) => item.number === recordToPush.number.split(".")[0]
        );

        recordToPush.grouping = rec.grouping;
        recordToPush.date = date;
      }
      recordToPush.group = group;
    }

    record.group = group;

    arrayToPush.push(recordToPush);
    if (record.r) {
      for (let i = 0; i < record.r.length; i++) {
        await this.convertCObjectToJasperFormat(
          record.r[i],
          tableIndex,
          group + 1,
          arrayToPush,
          date
        );
      }
    }
  }

  async cleanUpResult() {
    return await this.callService("report/cleanup_result", {});
  }

  async getIdOfResource() {
    const params = {
      spec: {
        itemsType: "avl_resource",
        propName: "reporttemplates",
        propValueMask: "",
        sortType: "sys_name",
        propType: "propitemname"
      },
      force: 0,
      flags: 1,
      from: 0,
      to: 0
    };
    const result = await this.callService("core/search_items", params);
    if (result && result.items && result.items.length) {
      return result.items[0].id;
    } else {
      return this.loginData.user.bact;
    }
  }

  async createTemplateReportOnWialon(resourceId) {
    const params = {
      id: 0,
      callMode: "create",
      itemId: resourceId,
      n: h_t.name_of_report[lang],
      ct: "avl_unit_group",
      p: '{"descr":"","bind":{"avl_unit_group":[]}}',
      tbl: [
        {
          n: "unit_group_stats",
          l: "Statistics",
          c: "",
          cl: "",
          cp: "",
          s: '["address_format","time_format","us_units"]',
          sl: '["Address","Time Format","Measure"]',
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
          n: "unit_group_stats",
          l: h_t.statistics[lang],
          c: "",
          cl: "",
          cp: "",
          s:
            '["report_name","unit_group_name","time_begin","time_end","current_time"]',
          sl: `["${h_t.report_name[lang]}","${h_t.unit_group_name[lang]}","${h_t.time_begin[lang]}","${h_t.time_end[lang]}","${h_t.current_time[lang]}"]`,
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
          n: "unit_group_trips",
          l: h_t.trips[lang],
          c:
            '["location_begin","time_end","location_end","duration","mileage","avg_speed","max_speed"]',
          cl: `["${h_t.location_begin[lang]}","${h_t.time_end[lang]}","${h_t.location_end[lang]}","${h_t.duration[lang]}","${h_t.mileage[lang]}","${h_t.avg_speed[lang]}","${h_t.max_speed[lang]}"]`,
          cp: "[{},{},{},{},{},{},{}]",
          s: "",
          sl: "",
          filter_order: [
            "duration",
            "mileage",
            "base_eh_sensor",
            "engine_hours",
            "speed",
            "stops",
            "sensors",
            "sensor_name",
            "driver",
            "trailer",
            "geozones_ex"
          ],
          p:
            '{"grouping":"{\\"type\\":\\"unit\\",\\"nested\\":{\\"type\\":\\"day\\"}}"}',
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
          f: 4369
        },
        {
          n: "unit_group_stops",
          l: h_t.stops[lang],
          c: '["time_begin","time_end","duration","location","stops_count"]',
          cl: `["${h_t.time_begin[lang]}","${h_t.time_end[lang]}","${h_t.duration[lang]}","${h_t.location[lang]}","${h_t.count[lang]}"]`,
          cp: "[{},{},{},{},{}]",
          s: "",
          sl: "",
          filter_order: [
            "duration",
            "sensors",
            "sensor_name",
            "driver",
            "trailer",
            "fillings",
            "thefts",
            "geozones_ex"
          ],
          p:
            '{"grouping":"{\\"type\\":\\"unit\\",\\"nested\\":{\\"type\\":\\"day\\"}}","duration_format":"1","duration":{"max":599,"flags":1}}',
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
          f: 4369
        },
        {
          n: "unit_group_stays",
          l: h_t.stays[lang],
          c: '["time_begin","time_end","duration","location","stays_count"]',
          cl: `["${h_t.time_begin[lang]}","${h_t.time_end[lang]}","${h_t.duration[lang]}","${h_t.location[lang]}","${h_t.count[lang]}"]`,
          cp: "[{},{},{},{},{}]",
          s: "",
          sl: "",
          filter_order: [
            "duration",
            "sensors",
            "sensor_name",
            "fillings",
            "thefts",
            "driver",
            "trailer",
            "geozones_ex"
          ],
          p:
            '{"grouping":"{\\"type\\":\\"unit\\",\\"nested\\":{\\"type\\":\\"day\\"}}","duration_format":"1","duration":{"min":600,"flags":1}}',
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
          f: 4369
        }
      ]
    };
    let reportTemplateGeneratedData = await this.callService(
      "report/update_report",
      params
    );
    return reportTemplateGeneratedData;
  }

  async requestToCreateReport(idOfResource, idTemplate) {
    let params = {
      itemId: idOfResource,
      col: [idTemplate],
      flags: 0
    };
    return await this.callService("report/get_report_data", params);
  }

  async execReport(reportObjId, dateFrom, dateTo, idOfResource, idTemplate) {
    let params = {
      reportResourceId: idOfResource,
      reportTemplateId: idTemplate,
      reportTemplate: null,
      reportObjectId: Number(reportObjId),
      reportObjectSecId: 0,
      interval: {
        flags: 16777216,
        from: Number(dateFrom),
        to: Number(dateTo)
      },
      reportObjectIdList: []
    };
    return await this.callService("report/exec_report", params);
  }

  async deleteReportTemplate(resourceId, templateId) {
    var setLocaleParams = {
      id: templateId,
      itemId: resourceId,
      callMode: "delete"
    };

    return await this.callService("report/update_report", setLocaleParams);
  }

  async selectRows(page, to, level) {
    let params = {
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
    return await this.callService("report/select_result_rows", params);
  }

  async getAllDataFromReport(resultExecReport) {
    let allData = [];
    let i = 0;
    for (const element of resultExecReport.reportResult.tables) {
      let objectToPush = {};
      objectToPush.headers = element.header;
      let dataOfTable = await this.selectRows(i, element.rows, element.level);

      this.getAllDataFromObject(dataOfTable);
      objectToPush.data = dataOfTable;
      objectToPush.total = element.total;
      allData.push(objectToPush);

      i++;
    }
    return allData;
  }

  getAllDataFromObject(arr) {
    arr.forEach((item) => {
      delete item.n;
      delete item.i1;
      delete item.i2;
      delete item.t1;
      delete item.t2;
      delete item.d;
      delete item.uid;
      if (item.r && item.r.length) this.getAllDataFromObject(item.r);
    });
  }

  insertOneTable(nameOfSheets, tableData, headers, total, styles) {
    let ws = this.addWorksheet(nameOfSheets);
    let column = 1;
    let style;
    style = styles.headers;
    headers.forEach((chs) => {
      ws.column(column).setWidth(14);
      ws.cell(1, column)
        .string(chs.toString())
        .style(style);
      column++;
    });
    tableData.forEach((csvRow) => {
      this.insertOneObject(csvRow, styles, ws, 1);
    });
    column = 1;
    total.forEach((totalRow) => {
      if (totalRow.length == 0) {
        totalRow = "-----";
      }
      ws.cell(row, column)
        .string(totalRow.toString())
        .style(style);
      column++;
    });
    row = 2;
    if (nameOfSheets == h_t.trips[lang]) {
      ws.column(2).setWidth(30);
      ws.column(3).setWidth(50);
      ws.column(5).setWidth(50);
    }
    if (nameOfSheets == h_t.stays[lang] || nameOfSheets == h_t.stops[lang]) {
      ws.column(2).setWidth(30);
      ws.column(6).setWidth(50);
    }
  }

  insertOneObject(inputObject, styles, ws, groupName) {
    let column = 1,
      style;
    style = styles.cellContent;
    inputObject.c.forEach((element) => {
      let value =
        typeof element == "object" ? element.t.toString() : element.toString();
      if (value.length == 0) {
        value = "-----";
      }
      ws.cell(row, column)
        .string(value)
        .style(style);
      column++;
    });
    row++;
    if (inputObject.r) {
      inputObject.r.forEach((element) => {
        ws.row(row).group(groupName, true);
        this.insertOneObject(element, styles, ws, groupName + 1);
      });
    }
  }

  make(xlsxData) {
    let nameOfSheets = [h_t.trips[lang], h_t.stops[lang], h_t.stays[lang]];

    let defaultAlignment = {
      horizontal: "center"
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
      stats: this.wb.createStyle({
        font: {
          size: 10,
          color: "464646",
          name: "Arial"
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#F2F2F2",
          fgColor: "#F2F2F2"
        },
        border: defaultborder
      }),
      cellContent: this.wb.createStyle({
        font: {
          size: 10,
          color: "464646",
          name: "Arial"
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
      contentStyle: this.wb.createStyle({
        font: {
          size: 10,
          color: "464646",
          name: "Arial",
          fill: {
            type: "pattern",
            patternType: "solid",
            bgColor: "#F2F2F2",
            fgColor: "#C0C0C0"
          }
        },
        border: defaultborder
      }),
      headers: this.wb.createStyle({
        font: {
          size: 10,
          color: "#464646",
          name: "Arial"
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

    let contenWS = this.addWorksheet(h_t.content[lang]);
    contenWS.row(1).hide();
    contenWS
      .cell(2, 1)
      .string(xlsxData[xlsxData.length - 1].data[0][1])
      .style(styles.contentStyle);
    contenWS
      .cell(3, 1)
      .string(h_t.statistics[lang])
      .style(styles.contentStyle);
    contenWS
      .cell(4, 1)
      .string(h_t.trips[lang])
      .style(styles.contentStyle);
    contenWS
      .cell(5, 1)
      .string(h_t.stops[lang])
      .style(styles.contentStyle);
    contenWS
      .cell(6, 1)
      .string(h_t.stays[lang])
      .style(styles.contentStyle);
    contenWS.column(1).setWidth(25);

    let statsWS = this.addWorksheet(h_t.statistics[lang]);
    for (let i = 0; i < xlsxData[xlsxData.length - 1].data.length; i++) {
      for (let j = 0; j < xlsxData[xlsxData.length - 1].data[i].length; j++) {
        statsWS
          .cell(i + 1, j + 1)
          .string(xlsxData[xlsxData.length - 1].data[i][j])
          .style(styles.stats);
      }
    }
    statsWS.column(1).setWidth(20);
    statsWS.column(2).setWidth(25);
    delete xlsxData[xlsxData.length - 1];

    let countNameOfSheet = 0;
    xlsxData.forEach((row) => {
      this.insertOneTable(
        nameOfSheets[countNameOfSheet],
        row.data,
        row.headers,
        row.total,
        styles
      );
      countNameOfSheet++;
    });
  }
}
module.exports = Report;
