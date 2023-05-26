const Base = require("../lib/base");

let row = 1;

let MonthArray = [
  { name: "Январь", days: 31 },
  { name: "Февраль", days: 28 },
  { name: "Март", days: 31 },
  { name: "Апрель", days: 30 },
  { name: "Май", days: 31 },
  { name: "Июнь", days: 30 },
  { name: "Июль", days: 31 },
  { name: "Август", days: 31 },
  { name: "Сентябрь", days: 30 },
  { name: "Октябрь", days: 31 },
  { name: "Ноябрь", days: 30 },
  { name: "Декабрь", days: 31 },
]
let GlobalEndDate;
const regex = new RegExp('(\ km(\/)(h))|(\ km)|(\ l)', 'gm');

class Report extends Base {
  //4. Время последнего сообщения терминала АТТ АО  «Каражанбасмунай»

  async getData(params) {
    if (params && (params.month == undefined || !params.year || !params.group_name || params.userTimeMill == undefined)) {
      return {
        error: 0,
        message: "Error. Not passed required params."
      }
    }
    params.userTimeMill = params.userTimeMill * -1 * 60;
    params.startDate = new Date(params.year, params.month, 1, 0, 0, 0, 0).getTime() / 1000 - ((this.loginData.user.prp.tz & 0xffff)); //-  params.userTimeMill);
    params.endDate = new Date(params.year, params.month, MonthArray[params.month].days, 23, 59, 59, 0).getTime() / 1000 - ((this.loginData.user.prp.tz & 0xffff)); // - params.userTimeMill);
    GlobalEndDate = (new Date(params.year, params.month, MonthArray[params.month].days, 23, 59, 59, 0).getTime() / 1000 - ((this.loginData.user.prp.tz & 0xffff))) * 1000; // - params.userTimeMill);
    let resourceId = this.loginData.user.bact;
    let reportTemplate = await this.generateReportTemplate(resourceId);
    var templateId = reportTemplate[0];
    try {
      //clean up results of a reports which was generated before
      let resultClean = await this.cleanUpResult();
      if (resultClean.error > 0) {
        await this.deleteReportTemplate(resourceId, templateId);
        return {
          error: 0,
          message: "Error clean up results"
        }
      }
      //get report data
      let resultRequestToCreate = await this.requestToCreateReport(resourceId, templateId);
      if (resultRequestToCreate && resultRequestToCreate.error) {
        await this.deleteReportTemplate(resourceId, templateId);
        return {
          error: 0,
          message: "Error request to get report data. " + resultRequestToCreate.reason ? resultRequestToCreate.reason : ""
        }
      }
      //Execute remote to get result
      let resultExecReport = await this.execReport(params.group_name, params.startDate, params.endDate, resourceId, templateId);
      //Get all Data from Report
      let allData = await this.getAllDataFromReport(resultExecReport);

      await this.mergeAllToFirstList(allData);
      allData.push({ header: [], data: resultExecReport.reportResult.stats });
      return allData;
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (resourceId && templateId) {
        await this.deleteReportTemplate(resourceId, templateId);
      }
    }
  }

  async mergeAllToFirstList(allData) {
    allData[0].headers.pop();
    allData[0].headers.push("Общий Пробег по GPS");
    allData[0].total.pop();
    allData[0].total.push(allData[1].total[2]);
    for (let i = 0; i < allData[0].data.length; i++) {
      allData[0].data[i].c.pop();
      allData[0].data[i].c.push(allData[1].data[i].c[2]);
    }
    return;
  }

  async cleanUpResult() {
    return await this.callService("report/cleanup_result", {});
  }

  async requestToCreateReport(idOfResource, idTemplate) {
    let params = {
      itemId: idOfResource,
      col: [idTemplate],
      flags: 0
    }
    return await this.callService("report/get_report_data", params);
  }

  async getReportStatus() {
    return await this.callService("report/get_report_status", {});
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
    }
    return await this.callService("report/exec_report", params);
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
    }
    return await this.callService("report/select_result_rows", params);
  }

  async getAllDataFromReport(resultExecReport) {
    let allData = [];
    let i = 0;
    for (const element of resultExecReport.reportResult.tables) {
      let objectToPush = {};
      objectToPush.headers = element.header;
      let dataOfTable = await this.selectRows(i, element.rows, element.level);

      // this.getAllDataFromObject(dataOfTable);
      objectToPush.data = dataOfTable;
      objectToPush.total = element.total;
      allData.push(objectToPush);

      i++;
    }
    return allData;
  }

  async generateReportTemplate(resourceId) {
    var generateReportParams =
    {
      "id": 0,
      "callMode": "create",
      "itemId": resourceId,
      "n": "4. Время последнего сообщения терминала АТТ АО  «Каражанбасмунай», создан с помощью Repogen",
      "ct": "avl_unit_group",
      "p": "{\"descr\":\"\",\"bind\":{\"avl_unit_group\":[]}}",
      "tbl": [
        {
          "n": "unit_group_stats",
          "l": "Статистика",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"address_format\",\"time_format\",\"us_units\"]",
          "sl": "[\"Address\",\"Time Format\",\"Measure\"]",
          "filter_order": [

          ],
          "p": "{\"address_format\":\"1255211008_10_5\",\"time_format\":\"%Y-%m-%E_%H:%M:%S\",\"us_units\":0}",
          "sch": {
            "f1": 0,
            "f2": 0,
            "t1": 0,
            "t2": 0,
            "m": 0,
            "y": 0,
            "w": 0,
            "fl": 0
          },
          "f": 0
        },
        {
          "n": "unit_group_digital_sensors",
          "l": "Последнее сообщение",
          "c": "[\"user_column\",\"time_end\"]",
          "cl": "[\"Группа/Автоколона\",\"Последнее сообщение.\"]",
          "cp": "[{\"p\":\"profile_field(model)\",\"vt\":\"0\"},{}]",
          "s": "",
          "sl": "",
          "filter_order": [
            "duration",
            "mileage",
            "base_eh_sensor",
            "engine_hours",
            "speed",
            "trips",
            "stops",
            "parkings",
            "sensor_name",
            "custom_sensors_col",
            "driver",
            "trailer",
            "fillings",
            "thefts",
            "geozones_ex"
          ],
          "p": "{\"grouping\":\"{\\\"type\\\":\\\"unit\\\",\\\"nested\\\":{\\\"type\\\":\\\"day\\\"}}\",\"base_eh_sensor\":{\"mask\":\"*Вольт\"},\"custom_sensors_col\":[\"Вольт\"]}",
          "sch": {
            "f1": 0,
            "f2": 0,
            "t1": 1439,
            "t2": 0,
            "m": 0,
            "y": 0,
            "w": 0,
            "fl": 0
          },
          "f": 4115
        },
        {
          "n": "unit_group_trips",
          "l": "Пробег",
          "c": "[\"mileage\"]",
          "cl": "[\"Общий Пробег по GPS\"]",
          "cp": "[{}]",
          "s": "",
          "sl": "",
          "filter_order": [
            "duration",
            "mileage",
            "base_eh_sensor",
            "engine_hours",
            "speed",
            "stops",
            "sensors",
            "sensor_name",
            "custom_sensors_col",
            "driver",
            "trailer",
            "geozones_ex"
          ],
          "p": "{\"grouping\":\"{\\\"type\\\":\\\"unit\\\",\\\"nested\\\":{\\\"type\\\":\\\"day\\\"}}\",\"custom_sensors_col\":[\"\"]}",
          "sch": {
            "f1": 0,
            "f2": 0,
            "t1": 0,
            "t2": 0,
            "m": 0,
            "y": 0,
            "w": 0,
            "fl": 0
          },
          "f": 4113
        }
      ]
    };
    let reportTemplateGeneratedData = await this.callService(
      "report/update_report",
      generateReportParams
    );
    return reportTemplateGeneratedData;
  }

  async deleteReportTemplate(resourceId, templateId) {
    var setLocaleParams = {
      id: templateId,
      itemId: resourceId,
      callMode: "delete"
    };

    return await this.callService("report/update_report", setLocaleParams);
  }


  async makeForGetData(xlsxData) {
    let tableCount = 0;
    for (let row of xlsxData) {
      await this.changeOneTable(row.data);
      xlsxData[tableCount].data = row.data;
    }
    return xlsxData;
  }

  async changeOneTable(tableData) {
    let objectCount = 0;
    for (let csvRow of tableData) {
      tableData[objectCount] = csvRow;
      objectCount++;
    };
  }

  insertOneTable(nameOfSheets, tableData, headers, total, styles) {
    let ws = this.addWorksheet(nameOfSheets);
    let column = 1; let style;;
    if (this.checkTheLeapAndReturnDays()) {
      MonthArray[1].days = 29;
    }
    style = styles.cellContent;
    ws.cell(1, 1, tableData.length + 5, MonthArray[new Date(GlobalEndDate).getMonth()].days + headers.length)
      .string("---")
      .style(style);
    ws.cell(row, column, row, MonthArray[new Date(GlobalEndDate).getMonth()].days + headers.length, true)
      .string("4. Время последнего сообщения терминала АТТ АО  «Каражанбасмунай» (колич. часов)")
      .style(style);
    row++;
    style = styles.headers
    headers.forEach((chs) => {
      if (chs == "Grouping") chs = "Наименование АТТ";
      //   if (chs == "Пробег") chs = "Общий расход по GPS"
      ws.column(column).setWidth(14);
      ws.cell(row, column, row + 2, column, true)
        .string(chs.toString())
        .style(style);
      column++;
    });

    ws.cell(row, column, row + 1, MonthArray[new Date(GlobalEndDate).getMonth()].days + headers.length, true)
      .string(MonthArray[new Date(GlobalEndDate).getMonth()].name)
      .style(style);

    row += 2;

    for (let i = 1; i <= MonthArray[new Date(GlobalEndDate).getMonth()].days; i++) {
      ws.cell(row, column)
        .string(i.toString())
        .style(style);
      column++;
    }

    row++;
    column = 1;
    tableData.forEach(csvRow => {
      this.insertOneObject(csvRow, styles, ws);
    });
    column = 1;
    total.forEach(totalRow => {
      if (totalRow == "Total") { totalRow = "Итого" }
      if (totalRow.length == 0) { totalRow = "-----" }
      totalRow = totalRow.replace(regex, "");
      ws.cell(row, column)
        .string(totalRow.toString())
        .style(style);
      column++;
    });
    row = 2;
    ws.column(2).setWidth(35);
    ws.column(4).setWidth(20);
    ws.row(4).freeze();
    for (let i = headers.length; i <= MonthArray[new Date(GlobalEndDate).getMonth()].days + headers.length; i++) {
      ws.column(i).setWidth(16);
    }
  }

  insertOneObject(inputObject, styles, ws) {
    let column = 1, style;
    style = styles.cellContent;
    for (let element of inputObject.c) {
      let value = typeof (element) == "object" ? element.t.toString() : element.toString()
      if (value.length == 0) { value = "-----" } else {
        value = value.replace(regex, "");
      }
      ws.cell(row, column)
        .string(value)
        .style(style)
      column++;
    };
    if (inputObject.r) {
      inputObject.r.forEach(element => {
        this.insertOneObjectHorizontal(element, styles, ws, row);
      });
    }
    row++;
  }

  insertOneObjectHorizontal(inputObject, styles, ws, row) {
    let style;
    style = styles.cellContent;
    let value = "";
    if (inputObject && inputObject.c && inputObject.c[3]) {
      value = typeof (inputObject.c[3]) == "object" ? inputObject.c[3].t.toString() : inputObject.c[3].toString()
    }
    let columnForValue = parseInt(inputObject.c[1].substr(inputObject.c[1].length - 2)) + 4;
    if (value.length == 0) { value = "-----" } else {
      value = value.replace(regex, "");
    }
    ws.cell(row, columnForValue)
      .string(value)
      .style(style)
  }

  checkTheLeapAndReturnDays() {
    return !((new Date(GlobalEndDate).getFullYear() % 4) || ((!(new Date(GlobalEndDate).getFullYear() % 100) && (new Date(GlobalEndDate).getFullYear() % 400))));
  }

  make(xlsxData) {

    let defaultAlignment = {
      horizontal: 'center',
      vertical: 'center'
    }
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
    }

    var styles = {
      stats: this.wb.createStyle({
        font: {
          size: 10,
          color: "464646",
          name: "Times New Roman",
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#F2F2F2",
          fgColor: "#F2F2F2",
        },
        border: defaultborder,
      }),
      cellContent: this.wb.createStyle({
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
      contentStyle: this.wb.createStyle({
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
        border: defaultborder,
      }),
      headers: this.wb.createStyle({
        font: {
          size: 10,
          color: '#464646',
          name: 'Times New Roman'
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

    xlsxData.forEach((row) => {
      this.insertOneTable("4. Время последнего сообщения терминала АТТ АО  «Каражанбасмунай» (колич. часов)", row.data, row.headers, row.total, styles);
    })
  }
}

module.exports = Report;
