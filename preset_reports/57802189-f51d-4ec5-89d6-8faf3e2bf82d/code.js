const Base = require("../lib/base");

const moment = require("moment");

let hydraulicsReportTemplateId = null;

const ml = {
  creationDate: {
    ru: "Дата создания",
    en: "Creation date"
  },
  reportDate: {
    ru: "Дата отчета",
    en: "Report date"
  },
  sheetNameLabel: {
    ru: "Отчёт",
    en: "Report"
  },
  numberVehicleLabel: {
    ru: "№",
    en: "№"
  },
  nameLabel: {
    ru: "Имя",
    en: "Name"
  },
  connectionLabel: {
    ru: "Связь",
    en: "Connection"
  },
  fuelSensorLabel: {
    ru: "Датчик топлива",
    en: "Fuel sensor"
  },
  calibrationLabel: {
    ru: "Тарировка",
    en: "Calibration"
  },
  legendCalibrationDescriptionYes: {
    ru: "Да - есть таблица",
    en: "Yes - there is a table"
  },
  legendCalibrationDescriptionNo: {
    ru: "Нет - нет таблицы",
    en: "No - there is no table"
  },
  specialMechanismLabel: {
    ru: "Спецмеханизм",
    en: "Special mechanism"
  },
  engineHoursLabel: {
    ru: "Моточасы",
    en: "Engine hours"
  },
  legendConnectionLabel: {
    ru: "Оценка качества связи объекта с сервером.",
    en:
      "Evaluation of the quality of the connection between the object and the server."
  },
  legendFuelSensorLabel: {
    ru: "Оценка работы датчиков топлива.",
    en: "Evaluation of the work of the fuel sensors."
  },
  legendCalibrationLabel: {
    ru: "Наличие таблицы тарировки к баку/емкости.",
    en: "Availability of the calibration table to the tank/capacitance."
  },
  legendSpecialMechanismLabel: {
    ru: "Работа спецмеханизмов ( гидравлика и другие механизмы).",
    en: "The work of special mechanisms (hydraulics and other mechanisms)."
  },
  legendEngineHoursLabel: {
    ru: "Оценка учёта работы ТС",
    en: "Evaluation of the work of vehicle"
  },
  yesLabel: {
    ru: "Да",
    en: "Yes"
  },
  worksLabel: {
    ru: "Работает",
    en: "Works"
  },
  needsAttentionLabel: {
    ru: "Требует внимания",
    en: "Needs attention"
  },
  legendNeedsAttentionFLS: {
    ru: "Для ДУТ: был хотя бы один перерыв в передаче данных более 18 часов.",
    en:
      "For fuel level sensor: there has been at least one interruption in data transmission for more than 18 hours."
  },
  legendNeedsAttentionConnection: {
    ru: "Для Связи: был хотя бы один перерыв в передаче данных более 12 часов.",
    en:
      "For connection: there has been at least one interruption in data transmission for more than 12 hours."
  },
  noLabel: {
    ru: "Нет",
    en: "No"
  },
  legendNoLabel: {
    ru: "Не работает (отключено)/Датчик не установлен.",
    en: "Not working (disconnected)/Sensor not installed."
  },
  otherGroupLabel: {
    ru: "Другие",
    en: "Other"
  }
};

let lang = "en";

class Report extends Base {
  getFileName() {
    return `vesta_report_${Date.now()}.xlsx`;
  }

  async getData(params) {
    if (params.lang) {
      lang = params.lang;
    }

    const tz =
      this.loginData.user.prp.tz < 0
        ? (this.loginData.user.prp.tz & 0xffff) | 0xffff0000
        : this.loginData.user.prp.tz & 0xffff;

    const fromDate =
      (params.startDateMill -
        tz * 1000) /*+ new Date().getTimezoneOffset() * 60000*/ /
      1000;
    const toDate =
      (params.endDateMill -
        tz * 1000) /*+ new Date().getTimezoneOffset() * 60000*/ /
      1000;

    try {
      const resourceId = this.loginData.user.bact;
      const unitsData = await this.getAllUnits();

      const hydraulicsData = await this.getHydraulicsReportData(
        resourceId,
        fromDate,
        toDate,
        unitsData
      );

      const templateData = await this.generateReportTemplate(resourceId);
      const templateId = templateData[0];

      const processedReportData = await this.getProcessedReportData(
        resourceId,
        fromDate,
        toDate,
        hydraulicsData,
        templateId,
        unitsData
      );

      const xlsxData = await this.generateXlsxData(processedReportData);

      xlsxData.reportDate = params.date;
      await this.deleteReportTemplate(resourceId, templateId);
      await this.deleteReportTemplate(resourceId, hydraulicsReportTemplateId);

      return xlsxData;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async generateXlsxData(processedReportData) {
    const xlsxData = {};
    const csv = [];
    Object.keys(processedReportData).forEach((prd) => {
      csv.push(prd);
      processedReportData[prd].forEach((rowData) => {
        csv.push(rowData);
      });
    });
    xlsxData.csv = csv;
    xlsxData.csvHeaders = [
      ml.numberVehicleLabel[lang],
      ml.nameLabel[lang],
      ml.connectionLabel[lang],
      ml.fuelSensorLabel[lang],
      ml.calibrationLabel[lang],
      ml.specialMechanismLabel[lang],
      ml.engineHoursLabel[lang]
    ];
    xlsxData.legendData = [
      ml.connectionLabel[lang],
      [ml.legendConnectionLabel[lang]],
      ml.fuelSensorLabel[lang],
      [ml.legendFuelSensorLabel[lang]],
      ml.calibrationLabel[lang],
      [ml.legendCalibrationLabel[lang]],
      ml.specialMechanismLabel[lang],
      [ml.legendSpecialMechanismLabel[lang]],
      ml.engineHoursLabel[lang],
      [ml.legendEngineHoursLabel[lang]],
      ml.yesLabel[lang],
      [ml.worksLabel[lang]],
      ml.needsAttentionLabel[lang],
      [
        ml.legendNeedsAttentionFLS[lang],
        ml.legendNeedsAttentionConnection[lang]
      ],
      ml.noLabel[lang],
      [ml.legendNoLabel[lang]]
    ];

    xlsxData.calibrationData = [
      ml.calibrationLabel[lang],
      ml.legendCalibrationDescriptionYes[lang],
      ml.legendCalibrationDescriptionNo[lang]
    ];

    return xlsxData;
  }

  async getTblLength(sensors) {
    sensors = Object.values(sensors);
    const fuelSensorData = sensors.find((s) => s.n == "Топливо");
    let tblLength = 0;
    if (fuelSensorData) tblLength = fuelSensorData.tbl.length;
    return tblLength;
  }

  async executeReport(reportParams) {
    let templateExecuted = await this.callService(
      "report/exec_report",
      reportParams
    );
    return templateExecuted;
  }

  async getResultOfExecutedTemplate(executedReportData) {
    if (executedReportData.reportResult.tables.length > 0) {
      const reportData = {};
      const tables = executedReportData["reportResult"]["tables"];
      const tablesWithData = []; // table names which have data in the report executed
      const reportDataParams = []; // params that will be passed to api to get data of tables
      let tableIndex = 0;

      tables.forEach((table) => {
        const params = {
          svc: "report/get_result_rows",
          params: {
            tableIndex: tableIndex,
            indexFrom: 0
          }
        };

        if (table.name) {
          params.params.indexTo = table.rows;
        }

        if (table.name == "unit_sensors_tracing") {
          reportData.sensorHeaders = [];
          reportData.sensorHeaders = table.header;
          reportData.sensorRowCount = table.rows;
          reportDataParams.push(params);
          tablesWithData.push("sensor");
          tableIndex++;
        }
        if (table.name == "unit_custom_fields") {
          reportDataParams.push(params);
          reportData.customRowCount = table.rows;
          tablesWithData.push("custom");
          tableIndex++;
        }
        if (table.name == "unit_conn_quality") {
          reportData.connectionHeaders = [];
          reportData.connectionHeaders = table.header;
          reportData.connectionRowCount = table.rows;
          reportDataParams.push(params);
          tablesWithData.push("connection");
        }
      });
      let reportResult = await this.callService("core/batch", reportDataParams);
      return {
        reportResult,
        reportData,
        tablesWithData
      };
    } else {
      return [];
    }
  }

  async separateReportResult(reportDataOutput, reportData, tablesWithData) {
    let tableIndex = 0;
    if (reportDataOutput) {
      if (tablesWithData.includes("sensor")) {
        reportData.sensorData = reportDataOutput[tableIndex];
        tableIndex++;
      }
      if (tablesWithData.includes("custom")) {
        reportData.customData = reportDataOutput[tableIndex];
        tableIndex++;
      }

      if (tablesWithData.includes("connection")) {
        reportData.connectionData = reportDataOutput[tableIndex];
        tableIndex++;
      }
      return reportData;
    }
  }

  async getGroupName(separateResult) {
    const groupName = ml.otherGroupLabel[lang];
    if (separateResult.customData && separateResult.customData.length > 0) {
      separateResult["customData"].forEach((customField) => {
        if (customField.c && customField["c"][0] == "Group") {
          groupName = customField["c"][1];
        }
      });
    }
    return groupName;
  }

  async getConnectionData(separateResult) {
    let reportRow = "";
    if (separateResult.connectionData && separateResult.connectionHeaders) {
      let durationCountIndex = separateResult["connectionHeaders"].findIndex(
        (ch) => ch == "Длительность"
      );
      let connectionCounter = 0;

      for (let i = 0; i < separateResult["connectionData"].length; i++) {
        let cd = separateResult["connectionData"][i];
        if (await this.getConnectionStatus(cd["c"][durationCountIndex]))
          connectionCounter++;
      }

      if (
        separateResult["connectionData"].length == 0 &&
        separateResult["sensorData"] &&
        separateResult["sensorData"].length == 0
      )
        reportRow = ml.noLabel[lang];
      else if (connectionCounter > 0) reportRow = ml.needsAttentionLabel[lang];
      else reportRow = ml.yesLabel[lang];
    } else {
      // add a check here if fuel data exists
      if (
        separateResult["sensorData"] &&
        separateResult["sensorData"].length > 0
      )
        reportRow = ml.yesLabel[lang];
      else reportRow = ml.noLabel[lang];
    }
    return reportRow;
  }

  async getConnectionStatus(timeString) {
    if (timeString.includes("day")) return true;
    else if (timeString.trim() > "") {
      const time = moment(timeString, "HH:mm:ss");
      const hours = time.hours();
      const minutes = time.minutes();
      const seconds = time.seconds();
      if (hours > 12 || (hours == 12 && (minutes > 0 || seconds > 0)))
        return true;
      else return false;
    } else return false;
  }

  async getFuelData(separateResult) {
    const rowData = {};
    let ignitionCounter = 0;
    if (separateResult.sensorData) {
      let sensorData = separateResult.sensorData;
      let sensorIgnitionIndex = separateResult.sensorHeaders.findIndex(
        (sh) => sh == "Зажигание"
      );
      let sensorTimeIndex = separateResult.sensorHeaders.findIndex(
        (sh) => sh == "Time"
      );
      let fuelSensorDataCounter = 0;
      let oldFuelFillingTime = null;

      for (let i = 0; i < sensorData.length; i++) {
        if (
          sensorData[i]["c"][sensorIgnitionIndex] &&
          sensorData[i]["c"][sensorIgnitionIndex] == "1.00"
        ) {
          ignitionCounter++;
        }
        if (sensorTimeIndex) {
          if (sensorData[i]["c"][sensorTimeIndex]["t"]) {
            const currentFuelFillingTime =
              sensorData[i]["c"][sensorTimeIndex]["t"];
            // for 1st loop oldFuelFillingTime would be NUll and we dont want to check diff for 1st loop
            if (oldFuelFillingTime != null) {
              // calculate difference
              if (
                await this.checkIsDifferenceValid(
                  currentFuelFillingTime,
                  oldFuelFillingTime
                )
              ) {
                fuelSensorDataCounter++;
              }
            }
            // setting currentvalue to oldvalue as currentValue will change in next loop
            oldFuelFillingTime = currentFuelFillingTime;
          }
        }
      }

      if (sensorTimeIndex) {
        if (sensorData.length == 0) rowData.fuelSensorStatus = ml.noLabel[lang];
        else if (fuelSensorDataCounter > 0)
          rowData.fuelSensorStatus = ml.needsAttentionLabel[lang];
        else if (fuelSensorDataCounter == 0)
          rowData.fuelSensorStatus = ml.yesLabel[lang];
      } else {
        rowData.fuelSensorStatus = ml.noLabel[lang];
      }
      if (sensorIgnitionIndex) {
        let validIgnitionPerc = (ignitionCounter * 100) / sensorData.length;

        if (validIgnitionPerc > 25) {
          rowData.ignitionStatus = ml.yesLabel[lang];
        } else if (validIgnitionPerc > 1) {
          rowData.ignitionStatus = ml.needsAttentionLabel[lang];
        } else {
          rowData.ignitionStatus = ml.noLabel[lang];
        }
      } else {
        rowData.ignitionStatus = ml.noLabel[lang];
      }
    } else {
      rowData.fuelSensorStatus = ml.noLabel[lang];
      rowData.ignitionStatus = ml.noLabel[lang];
    }

    return rowData;
  }

  async checkIsDifferenceValid(newDate, oldDate) {
    // check if difference between 2 passed dates is more than 12 hours
    let response = false;
    newDate = moment(newDate, "YYYY-MM-DD HH:mm:ss");
    oldDate = moment(oldDate, "YYYY-MM-DD HH:mm:ss");
    const duration = moment.duration(newDate.diff(oldDate));
    const diff = duration.asHours();

    response = diff > 18 ? true : false;
    return response;
  }

  async getProcessedData(separateResult, reportRow, hydraulicsData, tblLength) {
    const reportData = {};

    const groupName = await this.getGroupName(separateResult);

    const connectionStatus = await this.getConnectionData(separateResult);
    reportRow.push(connectionStatus);

    const fuelData = await this.getFuelData(separateResult);
    reportRow.push(fuelData.fuelSensorStatus);

    const tblStatus = tblLength >= 3 ? ml.yesLabel[lang] : ml.noLabel[lang];
    reportRow.push(tblStatus);

    const isHydraulicStatus = await this.checkForHydraulicSensor(
      reportRow[1],
      hydraulicsData
    );
    reportRow.push(isHydraulicStatus);

    reportRow.push(fuelData.ignitionStatus);

    reportData.groupName = groupName;
    reportData.reportRow = reportRow;

    return reportData;
  }

  async checkForHydraulicSensor(unit, hydraulicsData) {
    const isHydraulicStatus = hydraulicsData.includes(unit)
      ? ml.yesLabel[lang]
      : ml.noLabel[lang];
    return isHydraulicStatus;
  }

  async getProcessedReportData(
    resourceId,
    fromDate,
    toDate,
    hydraulicsData,
    templateId,
    unitsData
  ) {
    const processedReportData = {};
    const reportParams = {
      reportResourceId: resourceId,
      reportTemplateId: templateId,
      reportObjectSecId: 0,
      interval: {
        from: fromDate,
        to: toDate,
        flags: 0
      }
    };

    for (let i = 0; i < unitsData.length; i++) {
      const ud = unitsData[i];
      const reportData = {};
      const reportRow = [];

      const unitId = ud.id;
      const unitName = ud.nm;

      const tblLength =
        ud.sens && Object.keys(ud.sens).length > 0
          ? await this.getTblLength(ud.sens)
          : 0;
      reportData.name = unitName;
      reportData.tblLength = tblLength;
      reportParams.reportObjectId = unitId;
      reportRow.push(i + 1);
      reportRow.push(unitName);

      const reportExecutedData = await this.executeReport(reportParams);
      const getResultData = await this.getResultOfExecutedTemplate(
        reportExecutedData
      );

      const groupName = ml.otherGroupLabel[lang];

      if (getResultData.reportResult && getResultData.reportResult.length > 0) {
        const separateResult = await this.separateReportResult(
          getResultData.reportResult,
          getResultData.reportData,
          getResultData.tablesWithData
        );

        const processedData = await this.getProcessedData(
          separateResult,
          reportRow,
          hydraulicsData,
          tblLength
        );

        if (!processedReportData[processedData.groupName])
          processedReportData[processedData.groupName] = [];
        processedReportData[processedData.groupName].push(
          processedData.reportRow
        );
      } else {
        reportRow = reportRow.concat([
          ml.noLabel[lang],
          ml.noLabel[lang],
          ml.noLabel[lang],
          ml.noLabel[lang],
          ml.noLabel[lang]
        ]);
        if (!processedReportData[groupName])
          processedReportData[groupName] = [];
        processedReportData[groupName].push(reportRow);
      }
    }
    return processedReportData;
  }

  async generateReportTemplate(resourceId) {
    const generateReportParams = {
      id: 0,
      ct: "avl_unit",
      n: "Sensor - 3 Tables",
      p: '{"bind":{"avl_unit_group":[]}}',
      tbl: [
        {
          n: "unit_sensors_tracing",
          l: "Sensor Tracing",
          f: 16,
          c:
            '["speed","coord","sensor_name","time_begin","sensor_value","formatted_value"]',
          cl:
            '["Speed","Coordinates","Sensor","Time","Value","Formatted value"]',
          cp: "[{},{},{},{},{},{}]",
          p:
            '{"interval":{"value":0,"separate_columns":1},"sensor_name":"Топливо,Time,Зажигание","geozones_ex":{"zones":"1","types":"0","flags":0}}',
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
          s: ""
        },
        {
          n: "unit_custom_fields",
          l: "Custom fields",
          f: 0,
          c: '["name","value"]',
          cl: '["Name","Value"]',
          cp: "[{},{}]",
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
          s: ""
        },
        {
          n: "unit_conn_quality",
          l: "Connection problems",
          f: 4097,
          c: '["count","duration"]',
          cl: '["Count","Длительность"]',
          cp: "[{},{}]",
          p:
            '{"grouping":"{\\"type\\":\\"day\\"}","geozones_ex":{"zones":"1","types":"0","flags":0}}',
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
          s: ""
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

  isArray(obj) {
    return !!obj && obj.constructor === Array;
  }

  async executeHydraulicsReport(
    resourceId,
    fromDate,
    toDate,
    units,
    hydraulicsTemplateId
  ) {
    const params = {
      reportResourceId: resourceId,
      reportTemplateId: hydraulicsTemplateId,
      reportObjectId: units[0],
      reportObjectIdList: units,
      reportObjectSecId: 0,
      interval: {
        from: fromDate,
        to: toDate,
        flags: 0
      }
    };

    const reportData = await this.callService("report/exec_report", params);
    return reportData;
  }

  async getHydraulicsData(hydraulicsReportData, unitsCount) {
    const tables = hydraulicsReportData.reportResult.tables;
    if (tables.length > 0) {
      const getHydraulicsParams = {
        tableIndex: 0,
        indexFrom: 0,
        indexTo: unitsCount
      };

      let hydraulicsData = await this.callService(
        "report/get_result_rows",
        getHydraulicsParams
      );
      hydraulicsData = hydraulicsData.map((hd) => hd.c[1]);
      return hydraulicsData;
    }
  }

  async getHydraulicsReportData(resourceId, fromDate, toDate, unitsData) {
    const hydraulicsReportTemplate = await this.generateHydraulicsReportTemplate(
      resourceId
    );
    hydraulicsReportTemplateId = hydraulicsReportTemplate;
    const units = unitsData.map((unit) => unit.id);
    const hydraulicsReportData = await this.executeHydraulicsReport(
      resourceId,
      fromDate,
      toDate,
      units,
      hydraulicsReportTemplate
    );

    const hydraulicsData =
      hydraulicsReportData.reportResult.tables.length > 0
        ? await this.getHydraulicsData(hydraulicsReportData, units.length)
        : [];

    return hydraulicsData;
  }

  async generateHydraulicsReportTemplate(resourceId) {
    const params = {
      itemId: resourceId,
      callMode: "create",
      ct: "avl_unit_group",
      id: 0,
      n: "15. Спецмеханизмы групповой",
      p: '{"bind":{"avl_unit_group":[]}}',
      tbl: [
        {
          c: "",
          cl: "",
          cp: "",
          f: 0,
          l: "Статистика",
          n: "unit_group_stats",
          p:
            '{"address_format":"849674240_10_5","time_format":"%Y-%m-%E_%H:%M:%S","us_units":0}',
          s: '["address_format","time_format","us_units","skip_empty_rows"]',
          sch: {
            f1: 0,
            f2: 0,
            fl: 0,
            m: 0,
            t1: 0,
            t2: 0,
            w: 0,
            y: 0
          },
          sl: '["Address","Time Format","Measure","Пропускать пустые строки"]'
        },
        {
          c:
            '["sensor_name","time_begin","location","duration","time_end","location_end","act_count"]',
          cl:
            '["Датчик","Вкл.","Положение","Длительность","Откл.","Кон. положение","Кол-во включений"]',
          cp: "[{},{},{},{},{},{},{}]",
          f: 4369,
          l: "Цифровые датчики",
          n: "unit_group_digital_sensors",
          p:
            '{"grouping":"{\\"type\\":\\"unit\\",\\"nested\\":{\\"type\\":\\"day\\"}}","duration_format":"1","sensor_name":"*Гидравлика*"}',
          s: "",
          sch: {
            f1: 0,
            f2: 0,
            fl: 0,
            m: 0,
            t1: 0,
            t2: 0,
            w: 0,
            y: 0
          },
          sl: ""
        }
      ]
    };
    const reportTemplateGeneratedData = await this.callService(
      "report/update_report",
      params
    );

    return reportTemplateGeneratedData[0];
  }

  async getAllUnits() {
    const params = {
      spec: {
        itemsType: "avl_unit",
        propName: "sys_name",
        propValueMask: "*",
        sortType: "sys_name"
      },
      force: 0,
      flags: 4097,
      from: 0,
      to: 0
    };
    const unitsData = await this.callService("core/search_items", params);
    return unitsData.items;
  }

  async deleteReportTemplate(resourceId, templateId) {
    const params = {
      id: templateId,
      itemId: resourceId,
      callMode: "delete"
    };

    await this.callService("report/update_report", params);
    return "Template Deleted.";
  }

  make(xlsxData) {
    const styles = {
      legendBoldText: this.wb.createStyle({
        font: {
          size: 12,
          bold: true
        },
        alignment: {
          horizontal: "center"
        }
      }),
      legendPlainText: this.wb.createStyle({
        font: {
          size: 12
        },
        alignment: {
          horizontal: "center"
        }
      }),
      boldText: this.wb.createStyle({
        font: {
          size: 12,
          bold: true
        }
      }),
      plainText: this.wb.createStyle({
        font: {
          size: 12
        }
      }),
      groupName: this.wb.createStyle({
        font: {
          size: 12,
          bold: true
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#b8bab8",
          fgColor: "#b8bab8"
        }
      }),
      headersCell2: this.wb.createStyle({
        font: {
          size: 12,
          bold: true
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#b8bab8",
          fgColor: "#b8bab8"
        },
        border: {
          bottom: {
            style: "thin",
            color: "#000000"
          }
        }
      }),
      headers: this.wb.createStyle({
        font: {
          size: 12,
          bold: true
        },
        alignment: {
          horizontal: "center"
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#b8bab8",
          fgColor: "#b8bab8"
        },
        border: {
          bottom: {
            style: "thin",
            color: "#000000"
          }
        }
      }),
      cellContent: this.wb.createStyle({
        font: {
          size: 12
        },
        alignment: {
          horizontal: "center"
        },
        border: {
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
        }
      }),
      cellContent2nd: this.wb.createStyle({
        font: {
          size: 12
        },
        border: {
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
        }
      })
    };
    const ws = this.addWorksheet(ml.sheetNameLabel[lang]);

    let style = styles.boldText;
    let row = 1;
    let column = 1;

    ws.cell(row, column)
      .string(
        `${ml.creationDate[lang]}: ${moment(new Date()).format("DD.MM.YYYY")}`
      )
      .style(style);

    style = styles.plainText;
    row = row + 1;
    ws.cell(row, column)
      .string(
        `${ml.reportDate[lang]}: ${moment(xlsxData.reportDate).format(
          "DD.MM.YYYY"
        )}`
      )
      .style(style);

    style = styles.headers;
    row = row + 3;
    // Headers
    xlsxData.csvHeaders.forEach((chs) => {
      ws.column(column).setWidth(14);
      if (column == 2) {
        style = styles.headersCell2;
      } else {
        style = styles.headers;
      }
      ws.cell(row, column)
        .string(chs.toString())
        .style(style);
      column++;
    });

    ws.column(1).setWidth(10);
    ws.column(2).setWidth(23);
    ws.column(3).setWidth(20);
    ws.column(4).setWidth(18);

    column = 1;
    row++;
    // CSV data
    xlsxData.csv.forEach((csvRow) => {
      column = 1; // reset column from 1 for next row
      if (this.isArray(csvRow)) {
        csvRow.forEach((rowData) => {
          if (column == 2) {
            style = styles.cellContent2nd;
            ws.cell(row, column)
              .string(rowData.toString())
              .style(style);
          } else {
            style = styles.cellContent;
            ws.cell(row, column)
              .string(rowData.toString())
              .style(style);
          }
          column++;
        });
      } else {
        style = styles.groupName;
        row++;
        column++;
        ws.cell(row, column)
          .string(csvRow.toString())
          .style(style);
      }
      row++;
    });
    ws.row(5).freeze(); // Freezes the top four rows

    row = row + 3;

    // legendData
    xlsxData.legendData.forEach((csvRow) => {
      column = 3; // reset column from 1 for next row
      if (this.isArray(csvRow)) {
        csvRow.forEach((rowData) => {
          style = styles.legendPlainText;
          ws.cell(row, column)
            .string(rowData.toString())
            .style(style);
          row++;
        });
      } else {
        style = styles.legendBoldText;
        ws.cell(row, column)
          .string(csvRow.toString())
          .style(style);
      }
      row++;
    });
    row = row + 3;

    //calibrationData
    ws.cell(row++, 2)
      .string(xlsxData.calibrationData[0].toString())
      .style(styles.boldText);
    ws.cell(row++, 2)
      .string(xlsxData.calibrationData[1].toString())
      .style(styles.plainText);
    ws.cell(row++, 2)
      .string(xlsxData.calibrationData[2].toString())
      .style(styles.plainText);
  }
}

module.exports = Report;
