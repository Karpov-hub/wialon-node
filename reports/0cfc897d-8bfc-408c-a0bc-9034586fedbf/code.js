const Base = require("../lib/base");

let row = 1;
let GlobalStartDate;
let GlobalEndDate;
let stringForHeader;
const regex = new RegExp('(\ км)|(\ л)', 'gm');
const regexForRound = new RegExp('/[\D]+/g');
const indexToRound = [10];

class Report extends Base {
    //11. Моточасы по обьекту АТТ АО Каражанбасмунай

  async getData(params) {
    if (params && (!params.startDate || !params.endDate || params.userTimeMill == undefined)){
      return {
        error: 0,
        message: "Error. Not passed required params."
      }
    }
    let endDate = new Date(params.endDate); endDate.setHours(23); endDate.setMinutes(59); endDate.setSeconds(59);
    params.userTimeMill = params.userTimeMill * -1 * 60;
    params.startDate = new Date(params.startDate).getTime()/1000 - ((this.loginData.user.prp.tz & 0xffff)); //-  params.userTimeMill);
    params.endDate = endDate.getTime()/1000 - ((this.loginData.user.prp.tz & 0xffff));

    GlobalStartDate = new Date((params.startDate + ((this.loginData.user.prp.tz & 0xffff))) * 1000);
    GlobalEndDate = new Date((params.endDate + ((this.loginData.user.prp.tz & 0xffff))) * 1000);

    let nameUnit = await this.getNameUnit(params.unit);

    stringForHeader = `11. Моточасы по обьекту АТТ АО Каражанбасмунай за период с ${GlobalStartDate.getDate()}-${GlobalStartDate.getMonth()+1 > 9 ? GlobalStartDate.getMonth()+1 : "0" + (GlobalStartDate.getMonth()+1).toString()}-${GlobalStartDate.getFullYear()} по ${GlobalEndDate.getDate()}-${GlobalEndDate.getMonth()+1 > 9 ? GlobalEndDate.getMonth()+1 : "0" + (GlobalEndDate.getMonth()+1).toString()}-${GlobalEndDate.getFullYear()}`;

    let resourceId = this.loginData.user.bact;
    let reportTemplate = await this.generateReportTemplate(resourceId);
    var templateId = reportTemplate[0];
    try {
      //clean up results of a reports which was generated before
      let resultClean = await this.cleanUpResult();
      if (resultClean.error > 0){
        await this.deleteReportTemplate(resourceId, templateId);
        return {
          error: 0,
          message: "Error clean up results"
        }
      }
      //get report data
      let resultRequestToCreate = await this.requestToCreateReport(resourceId, templateId);
      if (resultRequestToCreate && resultRequestToCreate.error){
        await this.deleteReportTemplate(resourceId, templateId);
        return {
          error: 0,
          message: "Error request to get report data. " + resultRequestToCreate.reason ? resultRequestToCreate.reason : ""
        }
      }
      await this.setLocale(this.loginData.user.prp.tz, "ru");
      //Execute remote to get result
      let resultExecReport = await this.execReport(params.unit,params.startDate, params.endDate, resourceId, templateId);
      //Get all Data from Report
      let allData = await this.getAllDataFromReport(resultExecReport);
      await this.makeForGetData(allData);
      resultExecReport.reportResult.stats.unshift(["Название юнита", nameUnit]);
      allData.push({header: [], data: resultExecReport.reportResult.stats});
      return allData;
    } catch (e){
      return Promise.reject(e);
    } finally {
        await this.setLocale(this.loginData.user.prp.tz, "en");
        if (resourceId && templateId){
            await this.deleteReportTemplate(resourceId, templateId);
        }
    }
  }

  async getNameUnit(unitId) {
    var params = {
        id: unitId,
        flags: 14688273
    };
    let unitsData = await this.callService("core/search_item", params);
    return unitsData.item.nm;
  }

  async cleanUpResult() {
    return await this.callService("report/cleanup_result",{});
  }

  async requestToCreateReport(idOfResource, idTemplate) {
    let params = {
      itemId: idOfResource,
      col: [idTemplate],
      flags: 0
    }
    return await this.callService("report/get_report_data",params);
  }

  async getReportStatus() {
    return await this.callService("report/get_report_status", {});
  }

  async execReport(reportObjId, dateFrom, dateTo, idOfResource, idTemplate) {
    let params = {
      reportResourceId: idOfResource,
      reportTemplateId: idTemplate,
      reportTemplate: null,
      reportObjectId: Number (reportObjId),
      reportObjectSecId: 0,
      interval: {
        flags: 16777216,
        from: Number (dateFrom),
        to: Number (dateTo)
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
      
      this.getAllDataFromObject(dataOfTable);
      objectToPush.data = dataOfTable;
      objectToPush.total = element.total;
      allData.push(objectToPush);

      i++;
    }
    return allData;  
  }
  
  async setLocale(tzOffsetValue, languangeValue) {
    const setLocaleParams = {
      tzOffset: tzOffsetValue,
      language: languangeValue,
      flags: "256",
      formatDate: "%Y-%m-%E %H:%M:%S",
    };
    let reportTemplateGeneratedData = await this.callService(
      "render/set_locale", setLocaleParams
    );
    return reportTemplateGeneratedData
  }

  async generateReportTemplate(resourceId) {
    var generateReportParams = 
    {
        "id": 0,
        "itemId": resourceId,
        "callMode": "create",
        "n":"11. Моточасы по объекту ТС ТОО «Каражанбасмунай», создан с помощью Repogen.",
        "ct":"avl_unit",
        "p":"{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
        "tbl":[
          {
            "n":"unit_stats",
            "l":"Статистика",
            "c":"",
            "cl":"",
            "cp":"",
            "s":"[\"address_format\",\"time_format\",\"us_units\"]",
            "sl":"[\"Address\",\"Time Format\",\"Measure\"]",
            "filter_order":[
              
            ],
            "p":"{\"address_format\":\"1255211008_10_5\",\"time_format\":\"%E %b %Y_%H:%M:%S\",\"us_units\":0}",
            "sch":{
              "f1":0,
              "f2":0,
              "t1":0,
              "t2":0,
              "m":0,
              "y":0,
              "w":0,
              "fl":0
            },
            "f":0
          },
          {
            "n":"unit_trips",
            "l":"Поездки",
            "c":"",
            "cl":"",
            "cp":"",
            "s":"[\"trips_count\"]",
            "sl":"[\"Кол-во поездок\"]",
            "filter_order":[
              
            ],
            "p":"",
            "sch":{
              "f1":0,
              "f2":0,
              "t1":0,
              "t2":0,
              "m":0,
              "y":0,
              "w":0,
              "fl":0
            },
            "f":0
          },
          {
            "n":"unit_engine_hours",
            "l":"Моточасы",
            "c":"",
            "cl":"",
            "cp":"",
            "s":"[\"duration_move\",\"duration_stay\",\"duration\"]",
            "sl":"[\"Общее кол-во часов в движении\",\"Общее кол-во часов холостого хода\",\"Общее кол-во моточасов\"]",
            "filter_order":[
              
            ],
            "p":"",
            "sch":{
              "f1":0,
              "f2":0,
              "t1":0,
              "t2":0,
              "m":0,
              "y":0,
              "w":0,
              "fl":0
            },
            "f":0
          },
          {
            "n":"unit_engine_hours",
            "l":"Моточасы по объекту ТС ТОО ArgymakTransService",
            "c":"[\"user_column\",\"time_begin\",\"time_end\",\"mileage\",\"duration_move\",\"duration_stay\",\"duration\",\"fuel_consumption_fls\"]",
            "cl":"[\"Группа/ Автоколонна\",\"Старт поездки\",\"Окончание поездки\",\"Пройденное расстояние\",\"В движении\",\"Холостой ход\",\"Моточасы\",\"Расход ГСМ\"]",
            "cp":"[{\"p\":\"profile_field(model)\",\"vt\":\"0\"},{},{},{},{},{},{},{}]",
            "s":"",
            "sl":"",
            "filter_order":[
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
            ],
            "p":"{\"grouping\":\"{\\\"type\\\":\\\"day\\\"}\"}",
            "sch":{
              "f1":0,
              "f2":0,
              "t1":0,
              "t2":0,
              "m":0,
              "y":0,
              "w":0,
              "fl":0
            },
            "f":4113
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
    for(let row of xlsxData) {
      await this.changeOneTable(row.data);
      xlsxData[tableCount].data = row.data;
    }
    return xlsxData;
  }

  async changeOneTable(tableData) {
    let objectCount = 0;
    for(let csvRow of tableData) {
      tableData[objectCount] = csvRow;
      objectCount++;
    };
  }


  getAllDataFromObject(arr) {
    arr.forEach(item => {
      delete item.n
      delete item.i1;
      delete item.i2;
      delete item.t1;
      delete item.t2;
      delete item.d;
      delete item.uid;
      if(item.r && item.r.length) this.getAllDataFromObject(item.r)
    })
  }

  insertOneTable(ws, tableData, headers, total, styles) {
    let column = 1; let style;;
    style = styles.cellContent;
    // console.log("tableData", tableData.length);
    // ws.cell(1, 1, tableData.length + 2, headers.length)
    // .string("---")
    // .style(style);
    // ws.cell(row, column, row, headers.length, true)
    // .string(stringForHeader)
    // .style(style);
    // row++;
    style = styles.headers
    headers.forEach((chs) => {
      if (chs == "Grouping") chs = "Наименование АТТ/Дата";
    //   if (chs == "Пробег") chs = "Общий расход по GPS"
      ws.column(column).setWidth(14);
      ws.cell(row, column, row + 2, column, true)
        .string(chs.toString())
        .style(style);
      column++;
    });
    row += 3;
    column = 1;
    tableData.forEach(csvRow => {
      this.insertOneObject(csvRow, styles, ws, 1);
    });
    column = 1;
    total.forEach(totalRow => {
      if(totalRow == "Total") {totalRow = "Итого"}
      if(totalRow.length == 0) {totalRow = "-----"}
      totalRow = totalRow.replace(regex, "");
      if (indexToRound.includes(column) && totalRow != "-----"){
        totalRow = parseFloat(totalRow.replace(regexForRound, "")).toFixed(1);
      }
      ws.cell(row, column)
        .string(totalRow.toString())
        .style(style);
      column++;
    });
    // row = 2;
    ws.column(1).setWidth(10);
    ws.column(2).setWidth(20);
    ws.column(6).setWidth(18);
    ws.row(9).freeze();
  }

  insertOneObject(inputObject, styles, ws, groupName){
    let column = 1, style;
    style = styles.cellContent;
    for (let element of inputObject.c) {
      let value = typeof (element) == "object" ? element.t.toString() : element.toString()
      if (value.length == 0) {value = "-----"} else {
        value = value.replace(regex, "");
      }
      if (indexToRound.includes(column) && value != "-----"){
        value = parseFloat(value.replace(regexForRound, "")).toFixed(1);
      }
      ws.cell(row, column)
        .string(value)
        .style(style)
      column++;
    };
    row++;
    if (inputObject.r){
      inputObject.r.forEach(element => {
        ws.row(row).group(groupName, true);
        this.insertOneObject(element, styles, ws, groupName+1);
      });
    }
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
    let ws = this.addWorksheet("Моточасы по объекту");
    let column = 1, style = styles.cellContent;
    ws.cell(1, 1, xlsxData[0].data.length + 8, xlsxData[0].headers.length)
    .string("")
    .style(style);
    ws.cell(row, column, row, xlsxData[0].headers.length, true)
    .string(stringForHeader)
    .style(style);
    row++;
    for (let i=0;i<xlsxData[xlsxData.length-1].data.length;i++){
        for (let j=0; j < xlsxData[xlsxData.length-1].data[i].length; j++){
            ws.cell(row, column, row, column + 1, true)
            .string(xlsxData[xlsxData.length-1].data[i][j])
            .style(style);
            column += 2;
        }
        column = 1;
        row++;
    }
    delete xlsxData[xlsxData.length-1];
    xlsxData.forEach((row) => {
      this.insertOneTable(ws,row.data, row.headers, row.total, styles);
    })
  }
}

module.exports = Report;
