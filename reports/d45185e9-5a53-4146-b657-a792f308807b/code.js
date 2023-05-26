const Base = require("../lib/base");

const moment = require("moment");

class Report extends Base {
  getFileName() {
    return `kazan_report_${Date.now()}.xlsx`;
  }

  async getData(params) {
    var fromDate = params.startDate;
    var toDate = params.endDate;
    var unitId = params.unit;
    fromDate = Date.parse(fromDate) / 1000;
    toDate = Date.parse(toDate) / 1000;

    try {
      var resourceId = this.loginData.user.bact;
      var unitDetails = await this.getUnitDetails(unitId);
      var templateData = await this.generateReportTemplate(resourceId);
      var templateId = templateData[0];
      var executedReportData = await this.executeReport(
        resourceId,
        templateId,
        fromDate,
        toDate,
        unitId
      );
      var reportData = await this.getResultOfExecutedReport(executedReportData);
      var processedData = await this.getProcessedReportData(reportData);
      await this.deleteReportTemplate(resourceId, templateId);

      processedData.unitDetails = unitDetails;
      processedData.params = params;
      return processedData;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async deleteReportTemplate(resourceId, templateId) {
    var setLocaleParams = {
      id: templateId,
      itemId: resourceId,
      callMode: "delete"
    };
    await this.callService("report/update_report", setLocaleParams);
    return true;
  }
  async getProcessedReportData(separatedData) {
    var processedData = {
      averageFuelData: [],
      fuelFillingData: [],
      fuelFillingDataTotal: ["Итого", "", "0", ""],
      fuelTheftData: [],
      fuelTheftDataTotal: ["Итого", "", "0", ""],
      fuelConsumptionByDate: [],
      fuelConsumptionByDateTotal: []
    };

    separatedData.summaryTotal.shift();

    // get averaga fuel data

    var processedData = await Promise.all([
      this.getAverageFuelData(separatedData),
      this.getFuelFillingData(separatedData),
      this.getFuelTheftData(separatedData),
      this.getFuelComsumptionBydateData(separatedData)
    ]);

    processedData = {
      averageFuelData: processedData[0],
      fuelFillingData: processedData[1],
      fuelTheftData: processedData[2],
      fuelConsumptionByDate: processedData[3]
    };

    return processedData;
  }

  async getFuelComsumptionBydateData(separatedData) {
    if (separatedData.summaryRowCount > 0) {
      var fuelConsumptionByDate = await this.getFuelConsumptionByDate(
        separatedData.summaryData,
        separatedData.engineHoursData,
        separatedData.summaryTotal,
        separatedData.enginerHoursTotal
      );
      var processedData = {};
      processedData.fuelConsumptionByDate = fuelConsumptionByDate.summaryByDate;

      processedData.fuelConsumptionByDateTotal = await this.sendDataInRequiredFormat(
        fuelConsumptionByDate.summaryByDateTotal
      );
      return processedData;
    } else {
      return {
        fuelConsumptionByDate: [],
        fuelConsumptionByDateTotal: []
      };
    }
  }

  async getFuelConsumptionByDate(
    summaryData,
    engineData,
    summaryTotal,
    enginerHoursTotal
  ) {
    let fuelComsumption = summaryTotal[6];
    var summaryInfo = {
      summaryByDate: [],
      summaryByDateTotal: []
    };
    var summaryByDate = [];
    var engineInfo = {};
    // return engineData;

    engineData.forEach((ed) => {
      engineInfo[ed["c"][0]] = ed["c"][1];
    });

    for (let key = 0; key < summaryData.length; key++) {
      var sd = summaryData[key];
      var summaryObj = [];

      var date = moment(sd["c"][0], "YYYY-MM-DD").format("DD/MM/YYYY");
      var fuelPerHour = "0";
      if (engineInfo[sd["c"][0]]) {
        fuelPerHour = engineInfo[sd["c"][0]];
      }
      summaryObj.push(date);
      summaryObj.push(sd["c"][8]);
      summaryObj.push(sd["c"][9]);
      summaryObj.push(sd["c"][10]);
      summaryObj.push(fuelPerHour);
      summaryObj.push(sd["c"][7]);
      summaryObj.push(30);
      summaryObj.push(32);
      summaryObj.push(10);
      summaryObj.push(41);
      summaryObj = await this.sendDataInRequiredFormat(summaryObj);
      summaryByDate.push(summaryObj);
    }

    summaryInfo.summaryByDate = summaryByDate;

    var summaryTotalObj = [];

    summaryInfo.summaryByDateTotal = summaryTotal;
    summaryTotalObj.push("Итого");
    summaryTotalObj.push(summaryTotal[7]);
    summaryTotalObj.push(summaryTotal[8]);
    summaryTotalObj.push(summaryTotal[9]);
    summaryTotalObj.push(enginerHoursTotal[1]);
    summaryTotalObj.push(fuelComsumption);
    summaryTotalObj.push(30);
    summaryTotalObj.push(32);
    summaryTotalObj.push(10);
    summaryTotalObj.push(41);
    summaryInfo.summaryByDateTotal = summaryTotalObj;

    return summaryInfo;
  }

  async getFuelTheftData(separatedData) {
    if (separatedData.theftsRowCount > 0) {
      // array_shift(separatedData.fillingsTotal);
      var fuelTheftProcessedData = await this.getFuelTheftProcessedData(
        separatedData
      );
      return fuelTheftProcessedData;
    } else {
      return {
        fuelTheftData: [],
        fuelTheftDataTotal: []
      };
    }
  }

  async getFuelTheftDataObj(fuelData) {
    var processedFuelFillingData = [];
    for (let key = 0; key < fuelData.length; key++) {
      var fd = fuelData[key];
      var fuelObj = [];
      var fuelTheftDateTime = fd["c"][0]["t"] ? fd["c"][0]["t"] : fd["c"][0];

      var date = moment(fuelTheftDateTime, "YYYY-MM-DD HH:mm:ss").format(
        "DD/MM/YYYY HH:MM"
      );

      fuelObj.push(key + 1);
      fuelObj.push(date);
      fuelObj.push(fd["c"][1]);
      fuelObj.push(fd["c"][2]["t"]);
      fuelObj = await this.sendDataInRequiredFormat(fuelObj);
      processedFuelFillingData.push(fuelObj);
    }

    return processedFuelFillingData;
  }

  async getAverageFuelData(separatedData) {
    if (
      (separatedData.engineHoursRowCount > 0) &
      (separatedData.summaryRowCount > 0)
    ) {
      var summaryTotal = separatedData.summaryTotal;
      var enginerHoursTotal = separatedData.enginerHoursTotal;
      enginerHoursTotal = enginerHoursTotal[1];
      summaryTotal.push(enginerHoursTotal);
      summaryTotal = await this.sendDataInRequiredFormat(summaryTotal);
      var averageFuelData = summaryTotal;
      averageFuelData[2] = 0;
      averageFuelData[6] = 0;
      return {
        averageFuelData
      };
    } else {
      return [];
    }
  }

  async getFuelFillingData(separatedData) {
    if (separatedData.fillingsRowCount > 0) {
      // array_shift(separatedData.fillingsTotal);
      var fuelFillingProcessedData = await this.getFuelFillingProcessedData(
        separatedData
      );
      return fuelFillingProcessedData;
    } else {
      return {
        fuelFillingData: [],
        fuelFillingDataTotal: []
      };
    }
  }

  async getFuelTheftProcessedData(separatedData) {
    var fuelTheftTotal = separatedData.theftsTotal;
    fuelTheftTotal = await this.sendDataInRequiredFormat(fuelTheftTotal);
    fuelTheftTotal[0] = "Итого";
    var fuelTheftData = await this.getFuelTheftDataObj(
      separatedData.theftsData
    );
    var processedData = {};
    processedData.fuelTheftData = fuelTheftData;
    processedData.fuelTheftDataTotal = [];
    processedData.fuelTheftDataTotal[0] = fuelTheftTotal[0];
    processedData.fuelTheftDataTotal[1] = "";
    processedData.fuelTheftDataTotal[2] = fuelTheftTotal[2];
    processedData.fuelTheftDataTotal[3] = "";
    return processedData;
  }
  async getFuelFillingProcessedData(separatedData) {
    var fuelFillingTotal = separatedData.fillingsTotal;
    fuelFillingTotal = await this.sendDataInRequiredFormat(fuelFillingTotal);
    fuelFillingTotal[0] = "Итого";
    var fuelFillingData = await this.getFuelFillingDataObj(
      separatedData.fillingsData
    );
    var processedData = {};
    processedData.fuelFillingData = fuelFillingData;
    processedData.fuelFillingDataTotal = [];
    processedData.fuelFillingDataTotal[0] = fuelFillingTotal[0];
    processedData.fuelFillingDataTotal[1] = "";
    processedData.fuelFillingDataTotal[2] = fuelFillingTotal[2];
    processedData.fuelFillingDataTotal[3] = "";
    return processedData;
  }

  async getFuelFillingDataObj(fuelData) {
    var processedFuelFillingData = [];
    for (let key = 0; key < fuelData.length; key++) {
      var fd = fuelData[key];
      var fuelObj = [];
      var fuelFillingDateTime = fd["c"][0]["t"] ? fd["c"][0]["t"] : fd["c"][0];
      // if(fd['c'][0]['t'])

      var date = moment(fuelFillingDateTime, "YYYY-MM-DD HH:mm:ss").format(
        "DD/MM/YYYY HH:mm"
      );

      fuelObj.push(key + 1);
      fuelObj.push(date);
      fuelObj.push(fd["c"][2]);
      fuelObj.push(fd["c"][1]["t"]);
      fuelObj = await this.sendDataInRequiredFormat(fuelObj);
      processedFuelFillingData.push(fuelObj);
    }
    return processedFuelFillingData;
  }

  async sendDataInRequiredFormat(summaryTotal) {
    summaryTotal.forEach((st, index) => {
      if (summaryTotal[index]) {
        summaryTotal[index] = summaryTotal[index]
          .toString()
          .replace(" l/100 km", "");
        summaryTotal[index] = summaryTotal[index]
          .toString()
          .replace(" l/h", "");
        summaryTotal[index] = summaryTotal[index].toString().replace(" km", "");
        summaryTotal[index] = summaryTotal[index].toString().replace(" l", "");
      }
    });
    return summaryTotal;
  }

  async getResultOfExecutedReport(executedReportData) {
    var reportDataOutput = [];
    var reportData = {};
    var tables = executedReportData["reportResult"]["tables"];
    var tablesWithData = []; // table names which have data in the report executed
    var reportDataParams = []; // params that will be passed to api to get data of tables
    var tableIndex = 0;

    tables.forEach((table) => {
      var params = {
        svc: "report/get_result_rows",
        params: {
          tableIndex: tableIndex,
          indexFrom: 0
        }
      };

      if (table.name) {
        params.params.indexTo = table.rows;
      }

      if (table.name == "unit_engine_hours") {
        reportData.enginerHoursHeaders = [];
        reportData.enginerHoursHeaders = table.header;
        reportData.enginerHoursTotal = table.total;

        reportDataParams.push(params);
        tablesWithData.push("engineHours");
        tableIndex++;
      }
      if (table.name == "unit_trips") {
        reportData.tripsHeaders = [];
        reportData.tripsHeaders = table.header;
        reportData.tripsTotal = table.total;
        reportDataParams.push(params);
        tablesWithData.push("trips");
        tableIndex++;
      }
      if (table.name == "unit_thefts") {
        reportData.theftsHeaders = [];
        reportData.theftsHeaders = table.header;
        reportData.theftsTotal = table.total;
        reportDataParams.push(params);
        tablesWithData.push("thefts");
        tableIndex++;
      }
      if (table.name == "unit_fillings") {
        reportData.fillingsHeaders = [];
        reportData.fillingsHeaders = table.header;
        reportData.fillingsTotal = table.total;
        reportDataParams.push(params);
        tablesWithData.push("fillings");
        tableIndex++;
      }
      if (table.name == "unit_generic") {
        reportData.summaryHeaders = [];
        reportData.summaryHeaders = table.header;
        reportData.summaryTotal = table.total;
        reportDataParams.push(params);
        tablesWithData.push("summary");
      }
    });

    let tableData = await this.callService("core/batch", reportDataParams);
    reportDataOutput = tableData;
    var tableIndex = 0;

    reportData.engineHoursRowCount = 0;
    reportData.tripsRowCount = 0;
    reportData.theftsRowCount = 0;
    reportData.fillingsRowCount = 0;
    reportData.summaryRowCount = 0;
    if (reportDataOutput) {
      if (tablesWithData.includes("engineHours")) {
        reportData.engineHoursData = reportDataOutput[tableIndex];
        reportData.engineHoursRowCount = reportDataOutput[tableIndex].length;
        tableIndex++;
      }
      if (tablesWithData.includes("trips")) {
        reportData.tripsData = reportDataOutput[tableIndex];
        reportData.tripsRowCount = reportDataOutput[tableIndex].length;
        tableIndex++;
      }

      if (tablesWithData.includes("thefts")) {
        reportData.theftsData = reportDataOutput[tableIndex];
        reportData.theftsRowCount = reportDataOutput[tableIndex].length;
        tableIndex++;
      }
      if (tablesWithData.includes("fillings")) {
        reportData.fillingsData = reportDataOutput[tableIndex];
        reportData.fillingsRowCount = reportDataOutput[tableIndex].length;
        tableIndex++;
      }
      if (tablesWithData.includes("summary")) {
        reportData.summaryData = reportDataOutput[tableIndex];
        reportData.summaryRowCount = reportDataOutput[tableIndex].length;
        tableIndex++;
      }
    }
    return reportData;
  }

  executeReport(resourceId, templateId, fromDate, toDate, unitId) {
    var executeReportParams = {
      reportResourceId: resourceId,
      reportTemplateId: templateId,
      reportObjectId: unitId,
      reportObjectSecId: 0,
      interval: {
        from: fromDate,
        to: toDate,
        flags: 0
      }
    };

    let data = this.callService("report/exec_report", executeReportParams);
    return data;
  }

  async getUnitDetails(unitId) {
    let executeReportParams = {
      id: unitId,
      flags: 8388617
    };

    let data = await this.callService("core/search_item", executeReportParams);
    const output = data["item"];

    let unitData = {};
    unitData["name"] = output["nm"];
    unitData["regNo"] = "";
    unitData["model"] = "";
    unitData["owner"] = "";
    unitData["responsible"] = "";

    if (output["pflds"]) {
      let pflds = output["pflds"];

      Object.keys(pflds).forEach((fld) => {
        if (pflds[fld]["n"] == "registration_plate")
          unitData["regNo"] = pflds[fld]["v"];
        if (pflds[fld]["n"] == "model") unitData["model"] = pflds[fld]["v"];
      });
    }

    if (output["flds"]) {
      let pflds = output["flds"];

      Object.keys(pflds).forEach((fld) => {
        if (pflds[fld]["n"] == "Владелец") unitData["owner"] = pflds[fld]["v"];
        if (pflds[fld]["n"] == "Ответственный")
          unitData["responsible"] = pflds[fld]["v"];
      });
    }

    unitData = await this.processedUnitDetails(unitData);
    return unitData;
  }

  async generateReportTemplate(resourceId) {
    var generateReportParams = {
      id: 0,
      ct: "avl_unit",
      n: "Fuel Consumption Report",
      p: '{"bind":{"avl_unit_group":[]}}',
      tbl: [
        {
          n: "unit_engine_hours",
          l: "Engine hours",
          f: 17,
          c: '["avg_fuel_consumption_all"]',
          cl: '["Avg consumption"]',
          cp: "[{}]",
          p: "",
          sch: {
            y: 0,
            m: 0,
            w: 0,
            f1: 0,
            f2: 0,
            t1: 0,
            t2: 0,
            fl: 0
          },
          sl: "",
          s: "",
          filter_order: [
            "base_eh_sensor",
            "duration",
            "mileage",
            "engine_hours",
            "speed",
            "trips",
            "stops",
            "parkings",
            "sensors",
            "sensor_name",
            "driver",
            "trailer",
            "fillings",
            "thefts",
            "geozones_ex"
          ]
        },
        {
          n: "unit_trips",
          l: "Trips",
          f: 17,
          c:
            '["avg_fuel_consumption_all","duration_ival","eh_duration","mileage","fuel_level_begin","fuel_level_end"]',
          cl:
            '["Avg consumption","Total time","Engine hours","Mileage","Initial fuel level","Final fuel level"]',
          cp: "[{},{},{},{},{},{}]",
          p: '{"grouping":"{\\"type\\":\\"day\\"}"}',
          sch: {
            y: 0,
            m: 0,
            w: 0,
            f1: 0,
            f2: 0,
            t1: 0,
            t2: 0,
            fl: 0
          },
          sl: "",
          s: "",
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
          ]
        },
        {
          n: "unit_thefts",
          l: "Fuel thefts",
          f: 16,
          c: '["time_begin","thefted","location_begin"]',
          cl: '["Beginning","Stolen","Initial location"]',
          cp: "[{},{},{}]",
          p: "",
          sch: {
            y: 0,
            m: 0,
            w: 0,
            f1: 0,
            f2: 0,
            t1: 0,
            t2: 0,
            fl: 0
          },
          sl: "",
          s: "",
          filter_order: [
            "thefts",
            "custom_sensor_name",
            "sensor_name",
            "driver",
            "trailer",
            "geozones_ex"
          ]
        },
        {
          n: "unit_fillings",
          l: "Fuel fillings",
          f: 16,
          c: '["time_end","location_end","filled"]',
          cl: '["Time","Location","Filled"]',
          cp: "[{},{},{},{},{}]",
          p: "",
          sch: {
            y: 0,
            m: 0,
            w: 0,
            f1: 0,
            f2: 0,
            t1: 0,
            t2: 0,
            fl: 0
          },
          sl: "",
          s: "",
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
          ]
        },
        {
          n: "unit_generic",
          l: "Summary",
          f: 17,
          c:
            '["fuel_level_begin","fillings_count","filled","thefts_count","thefted","fuel_level_end","fuel_consumption_all","mileage","in_motion","avg_fuel_consumption_all"]',
          cl:
            '["Initial fuel level","Total fillings","Filled","Total thefts","Stolen","Final fuel level","Consumed","Mileage in trips","Move time","Avg consumption"]',
          cp: "[{},{},{},{},{},{},{},{},{},{}]",
          p:
            '{"grouping":"{\\"type\\":\\"day\\"}","custom_interval":{"type":0},"duration_format":"2"}',
          sch: {
            y: 0,
            m: 0,
            w: 0,
            f1: 0,
            f2: 0,
            t1: 0,
            t2: 0,
            fl: 0
          },
          sl: "",
          s: "",
          filter_order: ["base_eh_sensor", "sensor_name"]
        }
      ],
      t: "avl_unit",
      itemId: resourceId,
      callMode: "create"
    };

    let reportTemplateGeneratedData = await this.callService(
      "report/update_report",
      generateReportParams
    );
    return reportTemplateGeneratedData;
  }

  processedUnitDetails(unitDetails) {
    var processedUnitDetails = [
      ["Описание", unitDetails["name"]],
      ["Владелец", unitDetails["owner"]],
      ["Ответственный", unitDetails["responsible"]],
      ["Модель", unitDetails["model"]],
      ["Рег. номер", unitDetails["regNo"]]
    ];

    return processedUnitDetails;
  }

  getCellObj(
    column,
    type,
    merge,
    hasMultiple,
    columnsMergeLength,
    rowsMergeLength,
    value,
    row,
    style
  ) {
    var xlsxCellObj = {
      column,
      type,
      merge,
      hasMultiple,
      columnsMergeLength,
      rowsMergeLength,
      value,
      row,
      style
    };

    return xlsxCellObj;
  }

  convertTimeInMinutes(timeInDecimal) {
    var decimalTimeString = timeInDecimal;
    var decimalTime = parseFloat(decimalTimeString);
    decimalTime = decimalTime * 60 * 60;
    var hours = Math.floor(decimalTime / (60 * 60));
    decimalTime = decimalTime - hours * 60 * 60;
    var minutes = Math.floor(decimalTime / 60);
    decimalTime = decimalTime - minutes * 60;
    var seconds = Math.round(decimalTime);
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return "" + hours + ":" + minutes + ":" + seconds;
  }

  getDefaultStyle(
    columnStartsFrom,
    lastColumn,
    thickLeft,
    thickRight,
    row,
    xlsxRow
  ) {
    var currentXlsxObj = this.getCellObj(
      columnStartsFrom,
      "style",
      false,
      false,
      0,
      0,
      "",
      row,
      thickLeft
    );
    xlsxRow.push(currentXlsxObj);
    var currentXlsxObj = this.getCellObj(
      lastColumn,
      "style",
      false,
      false,
      0,
      0,
      "",
      row,
      thickRight
    );
    xlsxRow.push(currentXlsxObj);
    return xlsxRow;
  }

  make(xlsxData) {
    var fromDate = moment.utc(xlsxData.params.startDate).valueOf();
    var toDate = moment.utc(xlsxData.params.endDate).valueOf();
    var titleFromDate = moment
      .unix(fromDate / 1000)
      .format("YYYY-MM-DD HH:mm:ss");
    var titleEndDate = moment.unix(toDate / 1000).format("YYYY-MM-DD HH:mm:ss");

    var reportTitle = "Расход топлива по показаниям датчика уровня";
    var reportDate = "с " + titleFromDate + " по " + titleEndDate;
    var reportPeriod = ["За период", reportDate];
    var unitName = xlsxData.unitDetails[0][1];
    var unitInfo = ["По объекту", unitName];
    var processedData = xlsxData;
    var unitDetails = processedData.unitDetails;

    var columnStartsFrom = 2; // first column starts from
    var lastColumn = 12; // last column
    var mainTitleOfEachBlock = columnStartsFrom + 3; // main header of fuel average, filling & theft

    // this below data will be used to set formula in the fuel filling and fuel theft of avg fuel data
    var fuelFillingAvgIndex = 2 + columnStartsFrom;
    var fuelTheftAvgIndex = 4 + columnStartsFrom;
    var fuelAvgRowColumn = {
      filling: {
        row: 0,
        column: fuelFillingAvgIndex
      },
      theft: {
        row: 0,
        column: fuelTheftAvgIndex
      }
    };
    var styles = {
      reportHeaderStyle: this.wb.createStyle({
        font: {
          bold: true
        }
      }),
      mainTitle: this.wb.createStyle({
        alignment: {
          wrapText: true,
          horizontal: "center",
          vertical: "center"
        },
        font: {
          bold: true
        },
        border: {
          left: {
            style: "thick",
            color: "#000000"
          },
          top: {
            style: "thick",
            color: "#000000"
          },
          right: {
            style: "thick",
            color: "#000000"
          }
        }
      }),
      mainTitleRightColumns: this.wb.createStyle({
        border: {
          bottom: {
            style: "thick",
            color: "#000000"
          }
        }
      }),
      mediumRightLeft: this.wb.createStyle({
        border: {
          left: {
            style: "medium",
            color: "#000000"
          },
          right: {
            style: "medium",
            color: "#000000"
          }
        }
      }),
      thickLeft: this.wb.createStyle({
        border: {
          left: {
            style: "thick",
            color: "#000000"
          }
        }
      }),
      thickRight: this.wb.createStyle({
        border: {
          right: {
            style: "thick",
            color: "#000000"
          }
        }
      }),
      mediumAllBorders: this.wb.createStyle({
        alignment: {
          wrapText: true,
          horizontal: "center",
          vertical: "center"
        },
        font: {
          bold: true
        },
        border: {
          left: {
            style: "medium",
            color: "#000000"
          },
          right: {
            style: "medium",
            color: "#000000"
          },
          top: {
            style: "medium",
            color: "#000000"
          },
          bottom: {
            style: "medium",
            color: "#000000"
          }
        }
      }),
      thinAllBorders: this.wb.createStyle({
        alignment: {
          wrapText: true,
          horizontal: "center",
          vertical: "center"
        },
        border: {
          left: {
            style: "thin",
            color: "#000000"
          },
          bottom: {
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
          }
        }
      }),
      thinAllBordersUnitDetails: this.wb.createStyle({
        border: {
          left: {
            style: "thin",
            color: "#000000"
          },
          bottom: {
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
          }
        }
      }),
      thinAllBottomThickBorders: this.wb.createStyle({
        alignment: {
          wrapText: true,
          horizontal: "center",
          vertical: "center"
        },
        border: {
          left: {
            style: "thin",
            color: "#000000"
          },
          bottom: {
            style: "thick",
            color: "#000000"
          },
          right: {
            style: "thin",
            color: "#000000"
          }
        }
      }),
      thinBottomMediumLeftRightBorders: this.wb.createStyle({
        border: {
          left: {
            style: "medium",
            color: "#000000"
          },
          bottom: {
            style: "thin",
            color: "#000000"
          },
          right: {
            style: "medium",
            color: "#000000"
          }
        }
      }),
      thinTopMediumAllBorders: this.wb.createStyle({
        border: {
          left: {
            style: "medium",
            color: "#000000"
          },
          bottom: {
            style: "medium",
            color: "#000000"
          },
          right: {
            style: "medium",
            color: "#000000"
          }
        }
      }),
      thinBottomMediumAllBorders: this.wb.createStyle({
        border: {
          left: {
            style: "medium",
            color: "#000000"
          },
          top: {
            style: "medium",
            color: "#000000"
          },
          right: {
            style: "medium",
            color: "#000000"
          },
          bottom: {
            style: "thin",
            color: "#000000"
          }
        }
      })
    };
    var mergeDetails = {
      unitDetails: {
        name: 1,
        value: 8
      },
      mainTitle: 10,
      reportPeriod: {
        key: 1,
        value: 8
      }
    };
    var xlsxRowArray = [];
    var xlsxRow = [];

    var row = 1;
    // // Add Worksheets to the workbook
    // var ws = this.wb.addWorksheet('Sheet 1');
    const ws = this.addWorksheet("Лист 1");
    ws.column(1).setWidth(5);
    ws.column(2).setWidth(18);

    var currentColumn = columnStartsFrom;
    xlsxRow = [];

    // load report titles
    // title 1
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      mergeDetails.mainTitle,
      0,
      reportTitle,
      row,
      styles.reportHeaderStyle
    );
    xlsxRow.push(currentXlsxObj);
    row++;
    xlsxRowArray.push(xlsxRow);

    // title 2
    xlsxRow = [];
    currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      mergeDetails.reportPeriod.key,
      0,
      reportPeriod[0],
      row,
      styles.reportHeaderStyle
    );
    currentColumn += mergeDetails.reportPeriod.key + 1;
    xlsxRow.push(currentXlsxObj);
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      mergeDetails.reportPeriod.value,
      0,
      reportPeriod[1],
      row,
      styles.reportHeaderStyle
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRowArray.push(xlsxRow);
    row++;

    // title 3
    xlsxRow = [];
    currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      mergeDetails.unitDetails.name,
      0,
      unitInfo[0],
      row,
      styles.reportHeaderStyle
    );
    currentColumn += mergeDetails.unitDetails.name + 1;
    xlsxRow.push(currentXlsxObj);
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      mergeDetails.unitDetails.value,
      0,
      unitInfo[1],
      row,
      styles.reportHeaderStyle
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRowArray.push(xlsxRow);
    row++;

    // load unit details
    row++;
    unitDetails.forEach((ud, index) => {
      var currentColumn = columnStartsFrom;
      xlsxRow = [];
      var style = styles.thinBottomMediumLeftRightBorders;

      if (index == 0) style = styles.thinBottomMediumAllBorders;
      if (index == unitDetails.length - 1)
        style = styles.thinTopMediumAllBorders;

      var currentXlsxObj = this.getCellObj(
        currentColumn,
        "string",
        true,
        true,
        mergeDetails.unitDetails.name,
        0,
        ud[0],
        row,
        styles.thinAllBordersUnitDetails
      );
      currentColumn += mergeDetails.unitDetails.name + 1;
      xlsxRow.push(currentXlsxObj);
      var currentXlsxObj = this.getCellObj(
        currentColumn,
        "string",
        true,
        true,
        mergeDetails.unitDetails.value,
        0,
        ud[1],
        row,
        style
      );
      xlsxRow.push(currentXlsxObj);
      row++;
      xlsxRowArray.push(xlsxRow);
    });

    var averageFuelDataHeaders = [
      ["Состояние топлива в баке"],
      ["Заправки", "Сливы"],
      [
        "Уровень топлива на начало периода (л)",
        "Кол-во",
        "Объем (л)",
        "Кол-во",
        "Объем (л)",
        "Уровень топлива на конец периода (л)",
        "Расход топлива за период (л)",
        "Пробег за период (км)",
        "Моторесурс за период",
        "Ср. расход топлива (л/100км)",
        "Ср. расход топлива (л/час)"
      ]
    ];

    // main header average fuel
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      2,
      0,
      averageFuelDataHeaders[0][0],
      row,
      styles.mainTitle
    );
    xlsxRow.push(currentXlsxObj);
    currentColumn += currentXlsxObj.columnsMergeLength + 1;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.mainTitleRightColumns
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRowArray.push(xlsxRow);

    // empty row
    row++;
    xlsxRow = [];
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // average fuel parent headers
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom + 1;
    averageFuelDataHeaders[1].forEach((afd, idx) => {
      var currentXlsxObj = this.getCellObj(
        currentColumn,
        "string",
        true,
        true,
        1,
        0,
        afd,
        row,
        styles.mediumAllBorders
      );
      xlsxRow.push(currentXlsxObj);
      currentColumn += currentXlsxObj.columnsMergeLength + 1;
    });

    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // average fuel sub headers
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var timeInDecimal = processedData.averageFuelData.averageFuelData[8];
    var convertedTime = this.convertTimeInMinutes(timeInDecimal);
    averageFuelDataHeaders[2].forEach((afd, index) => {
      var currentXlsxObj = this.getCellObj(
        currentColumn,
        "string",
        false,
        false,
        0,
        0,
        afd,
        row,
        styles.mediumAllBorders
      );
      xlsxRow.push(currentXlsxObj);
      currentColumn++;
    });
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // empty row thin borders
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "",
      false,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.thinAllBorders
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // average fuel data
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var timeInDecimal = processedData.averageFuelData.averageFuelData[8];
    var convertedTime = this.convertTimeInMinutes(timeInDecimal);
    fuelAvgRowColumn.filling.row = row;
    fuelAvgRowColumn.theft.row = row;
    processedData.averageFuelData.averageFuelData.forEach((ad, index) => {
      var type = null;
      var value = ad;

      if (index == 6) {
        type = "formula";
        value =
          "=SUM(B" + row + ", D" + row + ", -F" + row + ", -G" + row + ")";
      } else if (index == 9) {
        type = "formula";
        value = "=ROUND((H" + row + "*100)/I" + row + ", 2)";
      } else if (index == 10) {
        var value = "=ROUND(H" + row + "/" + timeInDecimal + ", 2)";
        type = "formula";
        value = value;
      } else if (index == 8) {
        type = "string";
        value = convertedTime.toString();
      } else {
        type = "number";
        value = parseInt(ad);
      }

      var currentXlsxObj = this.getCellObj(
        currentColumn,
        type,
        false,
        false,
        0,
        0,
        value,
        row,
        styles.thinAllBorders
      );
      xlsxRow.push(currentXlsxObj);
      currentColumn++;
    });
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // empty row thin borders
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "",
      false,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.thinAllBottomThickBorders
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);
    row++;

    // fuel filling data

    var fuelFillingData = processedData.fuelFillingData.fuelFillingData;
    var fuelFillingHeaders = [
      ["Информация по заправкам"],
      ["№ п/п", "Дата и Время", "Объем (л)", "Местоположение"]
    ];
    var fuelValueIndex = 3 + columnStartsFrom; // 3rd element in headers
    var fuelFillingTotal = ["Итого", "", 0, ""];

    // load fuel main header
    row += 2;
    var xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      2,
      0,
      fuelFillingHeaders[0][0],
      row,
      styles.mainTitle
    );
    xlsxRow.push(currentXlsxObj);
    currentColumn += currentXlsxObj.columnsMergeLength + 1;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.mainTitleRightColumns
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRowArray.push(xlsxRow);

    // empty row
    row++;
    xlsxRow = [];
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // load fuel filling headers
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    fuelFillingHeaders[1].forEach((fh, index) => {
      var noOfColumnsToMerge = 0;
      var merge = false;
      var column = currentColumn;
      if (index == 1) {
        noOfColumnsToMerge = 1;
        merge = true;
        currentColumn += noOfColumnsToMerge + 1;
      } else if (index == 3) {
        noOfColumnsToMerge = 6;
        merge = true;
        currentColumn += noOfColumnsToMerge + 1;
      } else currentColumn++;

      var currentXlsxObj = this.getCellObj(
        column,
        "string",
        merge,
        merge,
        noOfColumnsToMerge,
        0,
        fh,
        row,
        styles.mediumAllBorders
      );
      xlsxRow.push(currentXlsxObj);
    });
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // empty row thin borders
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "",
      false,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.thinAllBorders
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    /**
     * Get the reference of first row at which fuel filling data will start and last row which it will end, to calculate summation
     */
    // load fuel filling data
    row++;
    var fuelFillingFirstRowAt = this.xlsx.getExcelCellRef(row, fuelValueIndex); // first row
    var fuelFillingLastRowAt = this.xlsx.getExcelCellRef(
      row + fuelFillingData.length,
      fuelValueIndex
    ); // last row
    var formulaSumOfFuelFilling =
      "=SUM(" + fuelFillingFirstRowAt + ":" + fuelFillingLastRowAt + ")";
    fuelFillingTotal[2] = formulaSumOfFuelFilling;

    fuelFillingData.forEach((ffd) => {
      var currentColumn = columnStartsFrom;
      xlsxRow = [];

      ffd.forEach((f, index) => {
        var noOfColumnsToMerge = 0;
        var merge = false;
        var column = currentColumn;
        var type = "number";
        var value = f;
        if (index == 1) {
          noOfColumnsToMerge = 1;
          merge = true;
          currentColumn += noOfColumnsToMerge + 1;
          type = "string";
        } else if (index == 3) {
          noOfColumnsToMerge = 6;
          merge = true;
          currentColumn += noOfColumnsToMerge + 1;
          type = "string";
        } else {
          currentColumn++;
          value = parseInt(value);
        }
        var currentXlsxObj = this.getCellObj(
          column,
          type,
          merge,
          merge,
          noOfColumnsToMerge,
          0,
          value,
          row,
          styles.thinAllBorders
        );
        xlsxRow.push(currentXlsxObj);
      });
      xlsxRow = this.getDefaultStyle(
        columnStartsFrom,
        lastColumn,
        styles.thickLeft,
        styles.thickRight,
        row,
        xlsxRow
      );
      xlsxRowArray.push(xlsxRow);
      row++;
    });

    // empty row thin borders
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "",
      false,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.thinAllBorders
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // load fuel filling total data
    row++;
    xlsxRow = [];
    var fuelFillingSumCell = this.xlsx.getExcelCellRef(row, fuelValueIndex);
    var currentColumn = columnStartsFrom;
    fuelFillingTotal.forEach((fft, index) => {
      var noOfColumnsToMerge = 0;
      var merge = false;
      var column = currentColumn;
      var type = "string";

      if (index == 1) {
        noOfColumnsToMerge = 1;
        merge = true;
        currentColumn += noOfColumnsToMerge + 1;
      } else if (index == 3) {
        noOfColumnsToMerge = 6;
        merge = true;
        currentColumn += noOfColumnsToMerge + 1;
      } else currentColumn++;
      if (index == 2) {
        var type = "formula";
      }
      var currentXlsxObj = this.getCellObj(
        column,
        type,
        merge,
        merge,
        noOfColumnsToMerge,
        0,
        fft,
        row,
        styles.thinAllBottomThickBorders
      );
      xlsxRow.push(currentXlsxObj);
    });
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);
    row++;

    // fuel Theft data

    var fuelTheftData = processedData.fuelTheftData.fuelTheftData;
    var fuelTheftHeaders = [
      ["Информация по возможным сливам"],
      ["№ п/п", "Дата и Время", "Объем (л)", "Местоположение"]
    ];
    var fuelValueIndex = 3 + columnStartsFrom; // 3rd element in headers
    var fuelTheftTotal = ["Итого", "", 0, ""];

    // load fuel main header
    row += 2;
    var xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      2,
      0,
      fuelTheftHeaders[0][0],
      row,
      styles.mainTitle
    );
    xlsxRow.push(currentXlsxObj);
    currentColumn += currentXlsxObj.columnsMergeLength + 1;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "string",
      true,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.mainTitleRightColumns
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRowArray.push(xlsxRow);

    // empty row
    row++;
    xlsxRow = [];
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // load fuel Theft headers
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    fuelTheftHeaders[1].forEach((fh, index) => {
      var noOfColumnsToMerge = 0;
      var merge = false;
      var column = currentColumn;
      if (index == 1) {
        noOfColumnsToMerge = 1;
        merge = true;
        currentColumn += noOfColumnsToMerge + 1;
      } else if (index == 3) {
        noOfColumnsToMerge = 6;
        merge = true;
        currentColumn += noOfColumnsToMerge + 1;
      } else currentColumn++;

      var currentXlsxObj = this.getCellObj(
        column,
        "string",
        merge,
        merge,
        noOfColumnsToMerge,
        0,
        fh,
        row,
        styles.mediumAllBorders
      );
      xlsxRow.push(currentXlsxObj);
    });
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // empty row thin borders
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "",
      false,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.thinAllBorders
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    /**
     * Get the reference of first row at which fuel Theft data will start and last row which it will end, to calculate summation
     */
    // load fuel theft data

    row++;
    var fuelTheftFirstRowAt = this.xlsx.getExcelCellRef(row, fuelValueIndex);
    var fuelTheftLastRowAt = this.xlsx.getExcelCellRef(
      row + fuelTheftData.length,
      fuelValueIndex
    );
    var formulaSumOfFuelTheft =
      "=SUM(" + fuelTheftFirstRowAt + ":" + fuelTheftLastRowAt + ")";
    fuelTheftTotal[2] = formulaSumOfFuelTheft;

    fuelTheftData.forEach((ffd) => {
      var currentColumn = columnStartsFrom;
      xlsxRow = [];

      ffd.forEach((f, index) => {
        var noOfColumnsToMerge = 0;
        var merge = false;
        var column = currentColumn;
        var type = "number";
        var value = f;
        if (index == 1) {
          noOfColumnsToMerge = 1;
          merge = true;
          currentColumn += noOfColumnsToMerge + 1;
          type = "string";
        } else if (index == 3) {
          noOfColumnsToMerge = 6;
          merge = true;
          currentColumn += noOfColumnsToMerge + 1;
          type = "string";
        } else {
          currentColumn++;
          value = parseInt(value);
        }
        var currentXlsxObj = this.getCellObj(
          column,
          type,
          merge,
          merge,
          noOfColumnsToMerge,
          0,
          value,
          row,
          styles.thinAllBorders
        );
        xlsxRow.push(currentXlsxObj);
      });
      xlsxRow = this.getDefaultStyle(
        columnStartsFrom,
        lastColumn,
        styles.thickLeft,
        styles.thickRight,
        row,
        xlsxRow
      );
      xlsxRowArray.push(xlsxRow);
      row++;
    });

    // empty row thin borders
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "",
      false,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.thinAllBorders
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // load fuel Theft total data
    row++;
    xlsxRow = [];
    var fuelTheftSumCell = this.xlsx.getExcelCellRef(row, fuelValueIndex);
    var currentColumn = columnStartsFrom;
    fuelTheftTotal.forEach((fft, index) => {
      var noOfColumnsToMerge = 0;
      var merge = false;
      var column = currentColumn;
      var type = "string";

      if (index == 1) {
        noOfColumnsToMerge = 1;
        merge = true;
        currentColumn += noOfColumnsToMerge + 1;
      } else if (index == 3) {
        noOfColumnsToMerge = 6;
        merge = true;
        currentColumn += noOfColumnsToMerge + 1;
      } else currentColumn++;
      if (index == 2) {
        var type = "formula";
      }
      var currentXlsxObj = this.getCellObj(
        column,
        type,
        merge,
        merge,
        noOfColumnsToMerge,
        0,
        fft,
        row,
        styles.thinAllBottomThickBorders
      );
      xlsxRow.push(currentXlsxObj);
    });
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);
    row++;

    // load fuel by date
    var fuelByDateHeaders = [
      [
        {
          value: "Суточный отчёт",
          columnsMergeLength: 3
        },
        {
          value: "По данным системы",
          columnsMergeLength: 2
        },
        {
          value: "По нормативу",
          columnsMergeLength: 3
        }
      ],
      [
        {
          value: "Дата",
          columnsMergeLength: 1,
          rowsMergeLength: 1,
          incrementColumn: true
        },
        {
          value: "Пробег (км)",
          columnsMergeLength: 0,
          rowsMergeLength: 1,
          incrementColumn: true
        },
        {
          value: "Моторесурс",
          columnsMergeLength: 0,
          rowsMergeLength: 1,
          incrementColumn: true
        },
        {
          value: "Ср. расход топлива",
          columnsMergeLength: 1,
          rowsMergeLength: 0
        },
        {
          value: "(л/100км)",
          columnsMergeLength: 0,
          rowsMergeLength: 0,
          nextRow: true,
          incrementColumn: true
        },
        {
          value: "(л/час)",
          columnsMergeLength: 0,
          rowsMergeLength: 0,
          nextRow: true,
          incrementColumn: true
        },
        {
          value: "Расход топлива (л)",
          columnsMergeLength: 0,
          rowsMergeLength: 1,
          incrementColumn: true
        },
        {
          value: "По пробегу",
          columnsMergeLength: 1,
          rowsMergeLength: 0
        },
        {
          value: "Норма расхода (л/100км)",
          columnsMergeLength: 0,
          rowsMergeLength: 0,
          nextRow: true,
          incrementColumn: true
        },
        {
          value: "Расход топлива (л)",
          columnsMergeLength: 0,
          rowsMergeLength: 0,
          nextRow: true,
          incrementColumn: true
        },
        {
          value: "По моторесурсу",
          columnsMergeLength: 1,
          rowsMergeLength: 0
        },
        {
          value: "Норма расхода (л/час)",
          columnsMergeLength: 0,
          rowsMergeLength: 0,
          nextRow: true,
          incrementColumn: true
        },
        {
          value: "Расход топлива (л)",
          columnsMergeLength: 0,
          rowsMergeLength: 0,
          nextRow: true,
          incrementColumn: true
        }
      ]
    ];
    var fuelConsumptionByDate =
      processedData.fuelConsumptionByDate.fuelConsumptionByDate;
    var fuelByDateDataTotal =
      processedData.fuelConsumptionByDate.fuelConsumptionByDateTotal;
    fuelByDateDataTotal.splice(1, 0, "");

    // load main headers
    row += 2;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    fuelByDateHeaders[0].forEach((fdh) => {
      var currentXlsxObj = this.getCellObj(
        currentColumn,
        "string",
        true,
        true,
        fdh.columnsMergeLength,
        0,
        fdh.value,
        row,
        styles.mainTitle
      );
      currentColumn += fdh.columnsMergeLength + 1;
      xlsxRow.push(currentXlsxObj);
    });
    xlsxRowArray.push(xlsxRow);

    // load parent headers
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    fuelByDateHeaders[1].forEach((fdh) => {
      var merge = true;
      if (fdh.columnsMergeLength == 0 && fdh.rowsMergeLength == 0)
        merge = false;

      var currentRow = row;
      if (fdh.nextRow) currentRow = row + 1;
      var currentXlsxObj = this.getCellObj(
        currentColumn,
        "string",
        merge,
        merge,
        fdh.columnsMergeLength,
        fdh.rowsMergeLength,
        fdh.value,
        currentRow,
        styles.mediumAllBorders
      );
      if (fdh.incrementColumn) currentColumn += fdh.columnsMergeLength + 1;

      xlsxRow.push(currentXlsxObj);
    });
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row + 1,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // empty row thin borders
    row += 2;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "",
      false,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.thinAllBorders
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // load fuel by date data
    row++;
    fuelConsumptionByDate.forEach((fdh) => {
      var currentColumn = columnStartsFrom;
      xlsxRow = [];
      fdh.forEach((f, index) => {
        var merge = false;
        var column = currentColumn;
        var noOfColumnsToMerge = 0;
        if (index == 0) {
          merge = true;
          noOfColumnsToMerge = 1;
        }
        var currentXlsxObj = this.getCellObj(
          column,
          "string",
          merge,
          merge,
          noOfColumnsToMerge,
          0,
          f,
          row,
          styles.thinAllBorders
        );
        currentColumn += noOfColumnsToMerge + 1;
        xlsxRow.push(currentXlsxObj);
      });
      xlsxRow = this.getDefaultStyle(
        columnStartsFrom,
        lastColumn,
        styles.thickLeft,
        styles.thickRight,
        row,
        xlsxRow
      );
      xlsxRowArray.push(xlsxRow);
      row++;
    });

    // empty row thin borders
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    var currentXlsxObj = this.getCellObj(
      currentColumn,
      "",
      false,
      true,
      lastColumn - currentColumn,
      0,
      "",
      row,
      styles.thinAllBorders
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // load fuel by date total data
    row++;
    xlsxRow = [];
    var currentColumn = columnStartsFrom;
    fuelByDateDataTotal.forEach((fdd, index) => {
      var currentXlsxObj = this.getCellObj(
        currentColumn,
        "string",
        true,
        true,
        0,
        0,
        fdd.toString(),
        row,
        styles.thinAllBottomThickBorders
      );
      currentColumn++;
      xlsxRow.push(currentXlsxObj);
    });
    xlsxRow = this.getDefaultStyle(
      columnStartsFrom,
      lastColumn,
      styles.thickLeft,
      styles.thickRight,
      row,
      xlsxRow
    );
    xlsxRowArray.push(xlsxRow);

    // set formula for fuel filling value
    xlsxRow = [];
    var fuelFillingSumFormula = "=SUM(" + fuelFillingSumCell + ")";
    var currentXlsxObj = this.getCellObj(
      fuelAvgRowColumn.filling.column,
      "formula",
      false,
      false,
      0,
      0,
      fuelFillingSumFormula,
      fuelAvgRowColumn.filling.row,
      styles.thinAllBorders
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRowArray.push(xlsxRow);

    // set formula for fuel theft value in fuel avg row
    xlsxRow = [];
    var fuelTheftSumFormula = "=SUM(" + fuelTheftSumCell + ")";
    var currentXlsxObj = this.getCellObj(
      fuelAvgRowColumn.theft.column,
      "formula",
      false,
      false,
      0,
      0,
      fuelTheftSumFormula,
      fuelAvgRowColumn.theft.row,
      styles.thinAllBorders
    );
    xlsxRow.push(currentXlsxObj);
    xlsxRowArray.push(xlsxRow);

    // loading data into xlsx
    xlsxRowArray.forEach((xlRow) => {
      xlRow.forEach((xlCell) => {
        var currentCell = null;
        if (xlCell.hasMultiple) {
          currentCell = ws.cell(
            xlCell.row,
            xlCell.column,
            xlCell.row + xlCell.rowsMergeLength,
            xlCell.column + xlCell.columnsMergeLength,
            xlCell.merge
          );
        } else {
          currentCell = ws.cell(xlCell.row, xlCell.column);
        }

        if (xlCell.type == "string")
          currentCell = currentCell.string(xlCell.value);
        if (xlCell.type == "number")
          currentCell = currentCell.number(xlCell.value);
        if (xlCell.type == "formula")
          currentCell = currentCell.formula(xlCell.value);

        currentCell.style(xlCell.style);
      });
    });

    row = row + 5;

    /** Optimizing Xlsx generation - end */

    // xlsx file generation finished
    // var b64 = null;
    // var buffer = await this.wb.writeToBuffer();
    // b64 = buffer.toString("base64"); // convert buffer to base64
    // b64 =
    //   "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
    //   b64; // append the file type t0 base64 string

    // // push the base64 content to Fileprovide to be uploaded into 'upload' folder
    // var result = await FileProvider.push({
    //   name: "report.xlsx",
    //   data: b64
    // });
    // resolve(result);
    // });
  }
}

module.exports = Report;
