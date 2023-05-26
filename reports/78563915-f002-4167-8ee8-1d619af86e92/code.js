const request = require("request");

const Base = require("../lib/base");
const regex = new RegExp("( l)|( л)", "gm");
const litrage = {
  en: " l",
  ru: " л"
};

const index_keys = [
  {
    table_index: 0,
    0: "number",
    1: "grouping",
    2: "time",
    3: "location_end",
    4: "fuel_level_start_watc",
    5: "fuel_level_start",
    6: "filed_watc",
    7: "filled",
    8: "fuel_level_filled_watc",
    9: "fuel_level_filled",
    10: "difference",
    11: "count"
  },
  {
    table_index: 1,
    0: "number",
    1: "grouping",
    2: "begin",
    3: "location_begin",
    4: "time",
    5: "location_end",
    6: "fuel_level_start",
    7: "thefted",
    8: "fuel_level_after_thefted",
    9: "count"
  }
];

let lang;
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
  raw_fuel_level_begin: {
    en: "Fuel level start (without applying TC)",
    ru: "Нач. уровень (без применения ТК)"
  },
  fuel_level_begin: {
    en: "Fuel level start",
    ru: "Нач. уровень"
  },
  raw_filled: {
    en: "Filled (without applying TC)",
    ru: "Заправлено (без применения ТК)"
  },
  filled: {
    en: "Filled",
    ru: "Заправлено"
  },
  raw_fuel_level_filled: {
    en: "Fuel level filled (without applying TC)",
    ru: "Кон. уровень (без применения ТК)"
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
  difference: {
    en: "Difference",
    ru: "Разница"
  },
  content: {
    en: "Content",
    ru: "Содержание"
  },
  report_name_value: {
    en:
      "Change in the volume of fuel in the tank depending on the temperature (group)",
    ru:
      "Изменение объема топлива в баке в зависимости от температуры (группа ТС)"
  }
};
let row = 2;
let startFuelLevel = -1;
let rawStartFuelLevel = -1;
let filledWithFuelLevel = -1;
let drainedFuel = -1;
let rawEndFuelLevel = -1;
let endFuelLevel = -1;
let location = -1;
let dateColumn = -1;
let timeColumn = -1;
let sumFilledFuel = 0;
let sumOfObjectFuel = 0;
let sumOfObjectStartFuel = 0;
let sumOfObjectEndFuel = 0;
let sumObjectDrained = 0;
let sumRawObjectStartFuelLevel = 0;
let sumRawObjectEndFuelLevel = 0;
let sumDrainedFuelLevel = 0;
let sumStartFuel = 0;
let sumEndFuel = 0;
let sumRawStartFuelLevel = 0;
let sumRawEndFuelLevel = 0;
let flagNeedToSum = false;
// let arrayWithUnitsToNeedApplyTemperature = [];

class Report extends Base {
  async getData({
    lang: inputLang = "en",
    startDateMill,
    endDateMill,
    group_name
  }) {
    lang = inputLang;

    const tz = this._convertWialonTzToSeconds(this.loginData.user.prp.tz);

    const startDate = this._convertDateToSecondsAndApplyTz(startDateMill, tz);
    const endDate = this._convertDateToSecondsAndApplyTz(endDateMill, tz);

    const resourceId = await this._getResourceId();
    const templateId = await this._generateReportTemplate(resourceId);

    try {
      //clean up results of a reports which was generated before
      await this._cleanUpResult();

      //Execute remote to get result
      let resultExecReport = await this._execReport(
        group_name,
        startDate,
        endDate,
        resourceId,
        templateId
      );

      //Get all id units of one group's
      // const allIdUnitsOfGroup = await this._getAllUnitOfGroups(group_name);

      //Get all units of profile
      // const allUnits = await this._getAllUnits();

      //Select units of one group's from all units
      // if (allIdUnitsOfGroup[0].u.length) {
      //   await this._fillUpArrayUnitsWithTKSensors(allIdUnitsOfGroup, allUnits);
      // }

      //Get all Data from Report
      let reportData = await this._getReportRecords(resultExecReport);

      await this._makeForGetData(reportData);

      if (
        reportData &&
        reportData[0] &&
        reportData[0].data &&
        reportData[0].data.length
      ) {
        await this._afterGetData(reportData);
      }

      const jasperData = await this.convertToJasperFormat(
        reportData,
        resultExecReport.reportResult.stats
      );

      reportData.unshift({
        header: [],
        data: resultExecReport.reportResult.stats
      });

      const response = { xlsxData: reportData, jasperData };

      return response;
    } finally {
      if (resourceId && templateId) {
        await this._deleteReportTemplate(resourceId, templateId);
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

      if (group === 1 && tableIndex[i] == "grouping") {
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

  async _afterGetData(reportData) {
    for (let row of reportData[0].data) {
      this._addDifference(row);
    }
    reportData[0].headers.splice(10, 0, h_t.difference[lang]);
    reportData[0].total.splice(10, 0, "---");
    return;
  }

  async _addDifference(row) {
    row.c.splice(
      10,
      0,
      String(
        Number(
          row.c[9].replace(regex, "") - row.c[8].replace(regex, "")
        ).toFixed(2)
      ) +
        " " +
        litrage[lang]
    );
    if (row.r) {
      for (let rRow of row.r) {
        await this._addDifference(rRow);
      }
    }
    return;
  }

  async _cleanUpResult() {
    return await this.callService("report/cleanup_result", {});
  }

  async _execReport(reportObjId, dateFrom, dateTo, idOfResource, idTemplate) {
    const params = {
      reportResourceId: Number(idOfResource),
      reportTemplateId: Number(idTemplate),
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

  async _selectResultRows(page, to, level) {
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
    return await this.callService("report/select_result_rows", params);
  }

  async _getAllUnitOfGroups(groupId) {
    const params = {
      spec: {
        itemsType: "avl_unit_group",
        propName: "sys_id",
        propValueMask: String(groupId),
        sortType: "sys_name",
        propType: "sys_name"
      },
      force: 0,
      flags: 1,
      from: 0,
      to: 0
    };
    const response = await this.callService("core/search_items", params);

    return response.items;
  }

  // async _getAllUnits() {
  //   const params = {
  //     spec: {
  //       itemsType: "avl_unit",
  //       propName: "sys_name",
  //       propValueMask: "*",
  //       sortType: "sys_name"
  //     },
  //     force: 0,
  //     flags: 4097,
  //     from: 0,
  //     to: 0
  //   };
  //   const response = await this.callService("core/search_items", params);

  //   return response.items;
  // }

  // async _fillUpArrayUnitsWithTKSensors(arrayWithIdOfUnits, arrayWithUnits) {
  //   for (const unit of arrayWithUnits) {
  //     let flagOfCalculate = false;
  //     if (arrayWithIdOfUnits[0].u.indexOf(unit.id) >= 0) {
  //       const keysOfItem = Object.keys(unit.sens);
  //       for (let i = 0; i < keysOfItem.length; i++) {
  //         if (unit.sens[keysOfItem[i]].n.indexOf("ТК") == -1) {
  //           flagOfCalculate = true;
  //         } else {
  //           flagOfCalculate = false;
  //           break;
  //         }
  //       }
  //     }
  //     if (flagOfCalculate) {
  //       arrayWithUnitsToNeedApplyTemperature.push(unit.nm);
  //     }
  //   }
  // }

  async _getReportRecords(resultExecReport) {
    let response = [];
    let i = 0;
    for (const element of resultExecReport.reportResult.tables) {
      let objectToPush = {};
      objectToPush.headers = element.header;
      let dataOfTable = await this._selectResultRows(
        i,
        element.rows,
        element.level
      );

      this._deleteUselessParameters(dataOfTable);
      objectToPush.data = dataOfTable;
      objectToPush.total = element.total;
      response.push(objectToPush);

      i++;
    }
    return response;
  }

  async _getResourceId() {
    if (this?.loginData?.user?.bact) {
      return this.loginData.user.bact;
    }

    const params = {
      spec: {
        itemsType: "avl_resource",
        propName: "reporttemplates",
        propValueMask: "",
        sortType: "sys_id",
        propType: "propitemname"
      },
      force: 0,
      flags: 1,
      from: 0,
      to: 0
    };
    const result = await this.callService("core/search_items", params);

    if (!!result?.items?.length) {
      return result.items[0].id;
    }
  }

  async _generateReportTemplate(resourceId) {
    const params = {
      id: 0,
      itemId: resourceId,
      callMode: "create",
      n: h_t.report_name_value[lang],
      ct: "avl_unit_group",
      p: '{"descr":"","bind":{"avl_unit_group":[]}}',
      tbl: [
        {
          n: "unit_group_stats",
          l: h_t.statistics[lang],
          c: "",
          cl: "",
          cp: "",
          s:
            '["address_format","time_format","us_units","skip_empty_rows","precise_calculations"]',
          sl:
            '["Address","Time Format","Measure","Пропускать пустые строки","Пробег и топливо с точностью до сотых"]',
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
          l: `${h_t.statistics[lang]}`,
          c: "",
          cl: "",
          cp: "",
          s:
            '["report_name","unit_group_name","time_begin","time_end","current_time"]',
          sl: `[\"${h_t.report_name[lang]}\",\"${h_t.unit_group_name[lang]}\",\"${h_t.time_begin[lang]}\",\"${h_t.time_end[lang]}\",\"${h_t.current_time[lang]}\"]`,
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
          l: `${h_t.fuelings[lang]}`,
          c:
            '["time_end","location_end","fuel_level_begin","fuel_level_begin","filled","filled","fuel_level_filled","fuel_level_filled","count"]',
          cl: `[\"${h_t.time_end[lang]}\",\"${h_t.location_end[lang]}\",\"${h_t.raw_fuel_level_begin[lang]}\",\"${h_t.fuel_level_begin[lang]}\",\"${h_t.raw_filled[lang]}\",\"${h_t.filled[lang]}\",\"${h_t.raw_fuel_level_filled[lang]}\",\"${h_t.fuel_level_filled[lang]}\",\"${h_t.count[lang]}\"]`,
          cp: "[{},{},{},{},{},{}]",
          s: "",
          sl: "",
          filter_order: [
            "geozones_ex",
            "fillings",
            "driver",
            "trailer",
            "sensor_name"
          ],
          p: '{"grouping":"{\\"type\\":\\"day\\"}"}',
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
          n: "unit_group_thefts",
          l: `${h_t.thefts}`,
          c:
            '["time_begin","location_begin","time_end","location_end","fuel_level_begin","thefted","fuel_level_thefted","count"]',
          cl: `[\"${h_t.time_begin[lang]}\",\"${h_t.location_begin[lang]}\",\"${h_t.time_end[lang]}\",\"${h_t.location_end[lang]}\",\"${h_t.fuel_level_begin[lang]}\",\"${h_t.thefted[lang]}\",\"${h_t.fuel_level_thefted[lang]}\",\"${h_t.count[lang]}\"]`,
          cp: "[{},{},{},{},{},{},{},{}]",
          s: "",
          sl: "",
          filter_order: [
            "geozones_ex",
            "thefts",
            "driver",
            "trailer",
            "sensor_name"
          ],
          p: '{"grouping":"{\\"type\\":\\"day\\"}"}',
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
    const response = await this.callService("report/update_report", params);
    return response[0];
  }

  async _deleteReportTemplate(resourceId, templateId) {
    const params = {
      id: templateId,
      itemId: resourceId,
      callMode: "delete"
    };

    return await this.callService("report/update_report", params);
  }

  async _makeForGetData(xlsxData) {
    let tableCount = 0;
    for (let row of xlsxData) {
      await this._changeOneTable(row.data, row.headers);
      xlsxData[tableCount].data = row.data;
      if (filledWithFuelLevel > -1) {
        xlsxData[tableCount].total[filledWithFuelLevel] = (
          sumFilledFuel.toFixed(2) + litrage[lang]
        ).toString();
      }
      if (rawStartFuelLevel > -1) {
        xlsxData[tableCount].total[rawStartFuelLevel] = (
          sumRawStartFuelLevel.toFixed(2) + litrage[lang]
        ).toString();
      }
      if (startFuelLevel > -1) {
        xlsxData[tableCount].total[startFuelLevel] = (
          sumStartFuel.toFixed(2) + litrage[lang]
        ).toString();
      }
      if (rawEndFuelLevel > -1) {
        xlsxData[tableCount].total[rawEndFuelLevel] = (
          sumRawEndFuelLevel.toFixed(2) + litrage[lang]
        ).toString();
      }
      if (endFuelLevel > -1) {
        xlsxData[tableCount].total[endFuelLevel] = (
          sumEndFuel.toFixed(2) + litrage[lang]
        ).toString();
      }
      if (drainedFuel > -1) {
        xlsxData[tableCount].total[drainedFuel] = (
          sumDrainedFuelLevel.toFixed(2) + litrage[lang]
        ).toString();
      }
      tableCount++;
      startFuelLevel = -1;
      drainedFuel = -1;
      endFuelLevel = -1;
      location = -1;
      dateColumn = -1;
      timeColumn = -1;
      filledWithFuelLevel = -1;
      sumFilledFuel = 0;
      sumStartFuel = 0;
      sumDrainedFuelLevel = 0;
      sumEndFuel = 0;
      sumRawStartFuelLevel = 0;
      sumRawEndFuelLevel = 0;
    }
    return xlsxData;
  }

  async _changeOneTable(tableData, headers) {
    let column = 0;
    for (let chs of headers) {
      if (chs == "Grouping" || chs == "Группировка") {
        dateColumn = column;
      } else if (
        (chs == h_t.time_end[lang] || chs == h_t.time_begin[lang]) &&
        timeColumn == -1
      ) {
        timeColumn = column;
      } else if (chs == h_t.fuel_level_begin[lang]) {
        startFuelLevel = column;
      } else if (chs == h_t.thefted[lang]) {
        drainedFuel = column;
      } else if (
        chs == h_t.fuel_level_thefted[lang] ||
        chs == h_t.fuel_level_filled[lang]
      ) {
        endFuelLevel = column;
      } else if (
        chs == h_t.location_begin[lang] ||
        chs == h_t.location_end[lang]
      ) {
        location = column;
      } else if (chs == h_t.filled[lang]) {
        filledWithFuelLevel = column;
      } else if (chs == h_t.raw_fuel_level_begin[lang]) {
        rawStartFuelLevel = column;
      } else if (chs == h_t.raw_fuel_level_filled[lang]) {
        rawEndFuelLevel = column;
      }
      column++;
    }
    let objectCount = 0;

    for (let csvRow of tableData) {
      flagNeedToSum = false;
      sumOfObjectFuel = 0;
      sumOfObjectStartFuel = 0;
      sumOfObjectEndFuel = 0;
      sumObjectDrained = 0;
      sumRawObjectStartFuelLevel = 0;
      sumRawObjectEndFuelLevel = 0;

      await this._changeOneObject(csvRow, null);
      if (filledWithFuelLevel > -1) {
        csvRow.c[filledWithFuelLevel] =
          sumOfObjectFuel.toFixed(2) + litrage[lang];
      }
      if (sumOfObjectStartFuel > -1) {
        csvRow.c[startFuelLevel] =
          sumOfObjectStartFuel.toFixed(2) + litrage[lang];
      }
      if (sumOfObjectEndFuel > -1) {
        csvRow.c[endFuelLevel] = sumOfObjectEndFuel.toFixed(2) + litrage[lang];
      }
      if (sumObjectDrained > -1) {
        csvRow.c[drainedFuel] = sumObjectDrained.toFixed(2) + litrage[lang];
      }
      if (sumRawObjectStartFuelLevel > -1) {
        csvRow.c[rawStartFuelLevel] =
          sumRawObjectStartFuelLevel.toFixed(2) + litrage[lang];
      }
      if (sumRawObjectEndFuelLevel > -1) {
        csvRow.c[rawEndFuelLevel] =
          sumRawObjectEndFuelLevel.toFixed(2) + litrage[lang];
      }
      tableData[objectCount] = csvRow;
      objectCount++;
    }
  }

  async _changeOneObject(inputObject, dateFrom) {
    let column = 0,
      temperatureCoef = null,
      tempTemperature = null,
      hour = null,
      date = null,
      checkTemperatureFlag = false;
    if (dateFrom != null) {
      flagNeedToSum = true;
      date = dateFrom;
      // if (
      //   arrayWithUnitsToNeedApplyTemperature.indexOf(
      //     inputObject.c[dateColumn]
      //   ) > -1
      // ) {
      checkTemperatureFlag = true;
      // }
    }
    for (let element of inputObject.c) {
      let value =
        typeof element == "object" ? element.t.toString() : element.toString();
      if (value.length == 0) {
        value = "-----";
      } else if (
        column == dateColumn &&
        value.length == 10 &&
        value.indexOf("-") > -1 &&
        dateFrom == null
      ) {
        date = value;
      } else if (column == timeColumn) {
        hour = value.substr(0, 2);
      } else if (
        column == location &&
        timeColumn > -1 &&
        dateColumn > -1 &&
        date != null &&
        hour != null &&
        flagNeedToSum == true &&
        checkTemperatureFlag == true
      ) {
        const temperatureByHours = await this._getTemperaturByHours(
          element.y,
          element.x,
          date
        );
        for (let element of temperatureByHours.historical[date].hourly) {
          if (element && Number(element.time) / 100 == Number(hour)) {
            tempTemperature = element.temperature;
            temperatureCoef = this._getCoefTemperature(tempTemperature);
            break;
          }
        }
      } else if (
        (column == startFuelLevel ||
          column == drainedFuel ||
          column == endFuelLevel ||
          column == filledWithFuelLevel) &&
        temperatureCoef != null &&
        flagNeedToSum == true
      ) {
        let newVal = value.replace(regex, "");
        if (isNaN(Number(newVal))) {
          newVal = 0;
        }
        value = Number(newVal) * temperatureCoef;
      }
      if (flagNeedToSum == true) {
        if (column != -1 && column == filledWithFuelLevel) {
          value = typeof value == "string" ? value.replace(regex, "") : value;
          if (isNaN(Number(value))) {
            value = 0;
          }
          sumFilledFuel += Number(value);
          sumOfObjectFuel += Number(value);
        }
        if (column != -1 && column == startFuelLevel) {
          value = typeof value == "string" ? value.replace(regex, "") : value;
          if (isNaN(Number(value))) {
            value = 0;
          }
          sumStartFuel += Number(value);
          sumOfObjectStartFuel += Number(value);
        }
        if (column != -1 && column == endFuelLevel) {
          value = typeof value == "string" ? value.replace(regex, "") : value;
          if (isNaN(Number(value))) {
            value = 0;
          }
          sumEndFuel += Number(value);
          sumOfObjectEndFuel += Number(value);
        }
        if (column != -1 && column == drainedFuel) {
          value = typeof value == "string" ? value.replace(regex, "") : value;
          if (isNaN(Number(value))) {
            value = 0;
          }
          sumObjectDrained += Number(value);
          sumDrainedFuelLevel += Number(value);
        }
        if (column != -1 && column == rawStartFuelLevel) {
          value = typeof value == "string" ? value.replace(regex, "") : value;
          if (isNaN(Number(value))) {
            value = 0;
          }
          sumRawObjectStartFuelLevel += Number(value);
          sumRawStartFuelLevel += Number(value);
        }
        if (column != -1 && column == rawEndFuelLevel) {
          value = typeof value == "string" ? value.replace(regex, "") : value;
          if (isNaN(Number(value))) {
            value = 0;
          }
          sumRawObjectEndFuelLevel += Number(value);
          sumRawEndFuelLevel += Number(value);
        }
      }
      if (
        (column == startFuelLevel ||
          column == drainedFuel ||
          column == endFuelLevel ||
          column == filledWithFuelLevel ||
          column == rawStartFuelLevel ||
          column == rawStartFuelLevel) &&
        flagNeedToSum == true
      ) {
        value = value.toString();
        value = parseFloat(value)
          .toFixed(2)
          .toString();
        value = String(value + litrage[lang]);
      }
      if (element?.t) {
        inputObject.c[column].t = value;
      } else {
        inputObject.c[column] = value;
      }
      column++;
    }
    if (inputObject.r) {
      for (let subelement of inputObject.r) {
        await this._changeOneObject(subelement, date);
      }
    }
  }

  _deleteUselessParameters(arr) {
    arr.forEach((item) => {
      delete item.n;
      delete item.i1;
      delete item.i2;
      delete item.t1;
      delete item.t2;
      delete item.d;
      delete item.uid;
      if (item?.r?.length) this._deleteUselessParameters(item.r);
    });
  }

  _insertOneTable(nameOfSheets, tableData, headers, total, styles) {
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
      this._insertOneObject(csvRow, styles, ws, 1);
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
    if (nameOfSheets == h_t.fuelings[lang]) {
      ws.column(4).setWidth(50);
    }
    if (nameOfSheets == h_t.thefts[lang]) {
      ws.column(4).setWidth(50);
      ws.column(6).setWidth(50);
    }
  }

  _insertOneObject(inputObject, styles, ws, groupName) {
    let column = 1,
      style;
    style = styles.cellContent;
    for (let element of inputObject.c) {
      let value =
        typeof element == "object" ? element.t.toString() : element.toString();
      if (value.length == 0) {
        value = "-----";
      }
      ws.cell(row, column)
        .string(value)
        .style(style);
      column++;
    }
    row++;
    if (inputObject.r) {
      inputObject.r.forEach((element) => {
        ws.row(row).group(groupName, true);
        this._insertOneObject(element, styles, ws, groupName + 1);
      });
    }
  }

  make(xlsxData) {
    let nameOfSheets = [h_t.fuelings[lang], h_t.thefts[lang]];

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

    const styles = {
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
      .string(xlsxData[0].data[0][1])
      .style(styles.contentStyle);
    contenWS
      .cell(3, 1)
      .string(h_t.statistics[lang])
      .style(styles.contentStyle);
    contenWS
      .cell(4, 1)
      .string(h_t.fuelings[lang])
      .style(styles.contentStyle);
    contenWS
      .cell(5, 1)
      .string(h_t.thefts[lang])
      .style(styles.contentStyle);
    contenWS.column(1).setWidth(49);

    let statsWS = this.addWorksheet(`${h_t.statistics[lang]}`);
    for (let i = 0; i < xlsxData[0].data.length; i++) {
      for (let j = 0; j < xlsxData[0].data[i].length; j++) {
        statsWS
          .cell(i + 1, j + 1)
          .string(xlsxData[0].data[i][j])
          .style(styles.stats);
      }
    }
    statsWS.column(1).setWidth(20);
    statsWS.column(2).setWidth(49);
    xlsxData.shift();

    let countNameOfSheet = 0;
    xlsxData.forEach((row) => {
      this._insertOneTable(
        nameOfSheets[countNameOfSheet],
        row.data,
        row.headers,
        row.total,
        styles
      );
      countNameOfSheet++;
    });
  }

  _getTemperaturByHours(lat, lon, date) {
    return new Promise((resolve, reject) => {
      const access_key = "888cbf08bab670e804268d05ee9be302";
      const URL = `https://api.weatherstack.com/historical?access_key=${access_key}&query=${lat},${lon}&historical_date=${date}&hourly=1&interval=1`;
      request(URL, async (err, res, body) => {
        if (err) return reject(err);
        try {
          body = JSON.parse(body);
        } catch (e) {
          return reject(e);
        }
        return resolve(body);
      });
    });
  }

  /* Max temperature = +80;
    Min temperature = -60
    Standart temperature = +20
    Diesel fuel density = 0.85
    Formulas:
    P0 (when temperature equal +20) = 1;
    P1 (when temperature less than +20) = ((tStandart - temperature) * 0.85) / 1000 + 1
    P2 (when temperature more than +20) = 1 - ((temperature - tStandart) * 0.85) / 1000
  */

  _getCoefTemperature(temperature) {
    if (temperature < 20) {
      // P1
      return ((20 - temperature) * 0.85) / 1000 + 1;
    } else if (temperature > 20) {
      // P2
      return 1 - ((80 - temperature) * 0.85) / 1000;
    } else if (temperature == 20 || isNaN(temperature)) {
      // P0
      return 1;
    }
  }

  /**
   * @author Ivan Danilenko
   * @param {Number} date in miliseconds
   * @param {Number} tz in seconds (of hours)
   * @description convert milliseconds to seconds with applying timezone
   */
  _convertDateToSecondsAndApplyTz(date, tz) {
    return (date - tz * 1000) / 1000;
  }

  /**
   * @author Ivan Danilenko
   * @param {Number} tz in format of Wialon
   */
  _convertWialonTzToSeconds(tz) {
    let seconds;

    seconds = tz & 0xffff;

    if (tz < 0) {
      seconds = seconds | 0xffff0000;
    }

    return seconds;
  }
}

module.exports = Report;
