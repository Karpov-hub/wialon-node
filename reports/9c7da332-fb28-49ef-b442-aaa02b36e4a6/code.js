const Base = require("../lib/base");

let row = 1;
let GlobalStartDate;
let GlobalEndDate;
let stringForHeader;
const regex = new RegExp('(\ km)|(\ l)', 'gm');



class Report extends Base {
    //26a. Сводный отчет по анализу эффективности использования АТТ АО  «Каражанбасмунай»

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

    stringForHeader = `26a. Сводный отчет по анализу эффективности использования АТТ АО  «Каражанбасмунай» за период с ${GlobalStartDate.getDate()}-${GlobalStartDate.getMonth()+1 > 9 ? GlobalStartDate.getMonth()+1 : "0" + (GlobalStartDate.getMonth()+1).toString()}-${GlobalStartDate.getFullYear()} по ${GlobalEndDate.getDate()}-${GlobalEndDate.getMonth()+1 > 9 ? GlobalEndDate.getMonth()+1 : "0" + (GlobalEndDate.getMonth()+1).toString()}-${GlobalEndDate.getFullYear()}`;

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
      //Execute remote to get result
      let resultExecReport = await this.execReport(params.group_name,params.startDate, params.endDate, resourceId, templateId);
      //Get all Data from Report
      let allData = await this.getAllDataFromReport(resultExecReport);
      await this.mergeAllToFirstList(allData);
    //   await this.makeForGetData(allData);
      allData.push({header: [], data: resultExecReport.reportResult.stats});
      return allData;
    } catch (e){
      return Promise.reject(e);
    } finally {
        if (resourceId && templateId){
            await this.deleteReportTemplate(resourceId, templateId);
        }
    }
  }

  async mergeAllToFirstList(allData){
    allData[0].headers.splice(allData[0].headers.length -1, 0,"Остановки");
    allData[0].headers.splice(allData[0].headers.length -1, 0, "Стоянки");
    allData[0].total.splice(4,0,allData[1].total[3]);
    allData[0].total.splice(6,0,allData[1].total[4]);
    allData[0].total.splice(8,0,allData[1].total[5]);
    allData[0].total.splice(10,0,allData[1].total[6]);
    allData[0].total.splice(12,0,allData[1].total[7]);
    allData[0].total.splice(13,0,allData[2].total[2]);
    allData[0].total.splice(14,0,allData[3].total[2]);
    allData[0].total.splice(15,0,allData[4].total[2]);
    allData[0].total.splice(16,0,allData[5].total[2]);
    allData[0].total.splice(18,0,allData[1].total[8]);
    for (let i = 0; i < allData[0].data.length; i++){ 
        allData[0].data[i].c.splice(4,0,allData[1].data[i].c[3]);
        allData[0].data[i].c.splice(6,0,allData[1].data[i].c[4]);
        allData[0].data[i].c.splice(8,0,allData[1].data[i].c[5]);
        allData[0].data[i].c.splice(10,0,allData[1].data[i].c[6]);
        allData[0].data[i].c.splice(12,0,allData[1].data[i].c[7]);
        allData[0].data[i].c.splice(13,0,allData[2].data[i].c[2]);
        allData[0].data[i].c.splice(14,0,allData[3].data[i].c[2]);
        allData[0].data[i].c.splice(15,0,allData[4].data[i].c[2]);
        allData[0].data[i].c.splice(16,0,allData[5].data[i].c[2]);
        allData[0].data[i].c.splice(18,0,allData[1].data[i].c[8]);
        allData[0].data[i].c.push(((parseFloat(allData[0].data[i].c[17]) + parseFloat(allData[0].data[i].c[18])) / 2).toFixed(2));
    }
    return;
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

  async generateReportTemplate(resourceId) {
    var generateReportParams = 
    {
        "id":0,
        "itemId": resourceId,
        "callMode": "create",
        "n":"26a. Сводный отчет по анализу эффективности использования АТТ АО  «Каражанбасмунай», создан с помощью Repogen.",
        "ct":"avl_unit_group",
        "p":"{\"descr\":\"\",\"bind\":{\"avl_unit_group\":[]}}",
        "tbl":[
          {
            "n":"unit_group_stats",
            "l":"Статистика",
            "c":"",
            "cl":"",
            "cp":"",
            "s":"[\"address_format\",\"time_format\",\"us_units\"]",
            "sl":"[\"Address\",\"Time Format\",\"Measure\"]",
            "filter_order":[
              
            ],
            "p":"{\"address_format\":\"1255211008_10_5\",\"time_format\":\"%Y-%m-%E_%H:%M:%S\",\"us_units\":0}",
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
            "n":"unit_group_stats",
            "l":"Статистика",
            "c":"",
            "cl":"",
            "cp":"",
            "s":"[\"report_name\"]",
            "sl":"[\"Отчет\"]",
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
            "n":"unit_group_engine_hours",
            "l":"Моточасы День",
            "c":"[\"user_column\",\"user_column\",\"duration_stay\",\"duration_move\",\"user_column\",\"user_column\",\"user_column\"]",
            "cl":"[\"Группа/Автоколонна\",\"Норма день\",\"Холостой ход\",\"Время в движении\",\"Сумма Время работы ДВС+ холостой ход\",\"Время с выкл ДВС (Простой)\",\"Коэффицент эф. использования\"]",
            "cp":"[{\"p\":\"profile_field(model)\",\"vt\":\"0\"},{\"p\":\"dehr\",\"vt\":\"40\"},{},{},{\"p\":\"(duration_stay) + (duration_move)\",\"vt\":\"40\"},{\"p\":\"(mcoef) - (duration_stay) - (duration_move)\",\"vt\":\"40\"},{\"p\":\"(duration) / ((mcoef) - (duration))\",\"vt\":\"0\"}]",
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
            "p":"",
            "sch":{
              "f1":0,
              "f2":0,
              "t1":780,
              "t2":0,
              "m":0,
              "y":0,
              "w":0,
              "fl":0
            },
            "f":4114
          },
          {
            "n":"unit_group_engine_hours",
            "l":"Моточасы Ночь",
            "c":"[\"user_column\",\"user_column\",\"duration_stay\",\"duration_move\",\"user_column\",\"user_column\",\"user_column\"]",
            "cl":"[\"Группа/Автоколонна\",\"Норма день\",\"Холостой ход\",\"Время в движении\",\"Сумма Время работы ДВС+ холостой ход\",\"Время с выкл ДВС (Простой)\",\"Коэффицент эф. использования\"]",
            "cp":"[{\"p\":\"profile_field(model)\",\"vt\":\"0\"},{\"p\":\"dehr\",\"vt\":\"40\"},{},{},{\"p\":\"(duration_stay) + (duration_move)\",\"vt\":\"40\"},{\"p\":\"(mcoef) - (duration_stay) - (duration_move)\",\"vt\":\"40\"},{\"p\":\"(duration) / ((mcoef) - (duration))\",\"vt\":\"0\"}]",
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
            "p":"",
            "sch":{
              "f1":840,
              "f2":0,
              "t1":1439,
              "t2":0,
              "m":0,
              "y":0,
              "w":0,
              "fl":0
            },
            "f":4114
          },
          {
            "n":"unit_group_stops",
            "l":"Остановки День",
            "c":"[\"duration\"]",
            "cl":"[\"Длительность\"]",
            "cp":"[{}]",
            "s":"",
            "sl":"",
            "filter_order":[
              "duration",
              "sensors",
              "sensor_name",
              "driver",
              "trailer",
              "fillings",
              "thefts",
              "geozones_ex"
            ],
            "p":"{\"duration\":{\"max\":300,\"flags\":1}}",
            "sch":{
              "f1":0,
              "f2":0,
              "t1":780,
              "t2":0,
              "m":0,
              "y":0,
              "w":0,
              "fl":0
            },
            "f":4114
          },
          {
            "n":"unit_group_stops",
            "l":"Остановки Ночь",
            "c":"[\"duration\"]",
            "cl":"[\"Длительность\"]",
            "cp":"[{}]",
            "s":"",
            "sl":"",
            "filter_order":[
              "duration",
              "sensors",
              "sensor_name",
              "driver",
              "trailer",
              "fillings",
              "thefts",
              "geozones_ex"
            ],
            "p":"",
            "sch":{
              "f1":840,
              "f2":0,
              "t1":1439,
              "t2":0,
              "m":0,
              "y":0,
              "w":0,
              "fl":0
            },
            "f":4114
          },
          {
            "n":"unit_group_stays",
            "l":"Стоянки День",
            "c":"[\"duration\"]",
            "cl":"[\"Длительность\"]",
            "cp":"[{}]",
            "s":"",
            "sl":"",
            "filter_order":[
              "duration",
              "sensors",
              "sensor_name",
              "fillings",
              "thefts",
              "driver",
              "trailer",
              "geozones_ex"
            ],
            "p":"{\"duration\":{\"min\":301,\"flags\":1}}",
            "sch":{
              "f1":0,
              "f2":0,
              "t1":780,
              "t2":0,
              "m":0,
              "y":0,
              "w":0,
              "fl":0
            },
            "f":4114
          },
          {
            "n":"unit_group_stays",
            "l":"Стоянки Ночь",
            "c":"[\"duration\"]",
            "cl":"[\"Длительность\"]",
            "cp":"[{}]",
            "s":"",
            "sl":"",
            "filter_order":[
              "duration",
              "sensors",
              "sensor_name",
              "fillings",
              "thefts",
              "driver",
              "trailer",
              "geozones_ex"
            ],
            "p":"",
            "sch":{
              "f1":840,
              "f2":0,
              "t1":1439,
              "t2":0,
              "m":0,
              "y":0,
              "w":0,
              "fl":0
            },
            "f":4114
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

  insertOneTable(nameOfSheets, tableData, headers, total, styles) {
    let ws = this.addWorksheet(nameOfSheets);
    let column = 1; let style;;
    style = styles.cellContent;
    ws.cell(1, 1, tableData.length + 2, headers.length)
    .string("---")
    .style(style);
    ws.cell(row, column, row, 4 + ((headers.length -3) * 2), true)
    .string(stringForHeader)
    .style(style);
    row++;
    style = styles.headers
    headers.forEach((chs) => {
      if (chs == "Grouping") chs = "Наименование АТТ";
      if (chs == "Норма день") chs = "Норма";
    //   if (chs == "Пробег") chs = "Общий расход по GPS"
      ws.column(column).setWidth(14);
      if (chs == "№" || chs == "Наименование АТТ" || chs == "Группа/Автоколонна"){
        ws.cell(row, column, row + 2, column, true)
        .string(chs.toString())
        .style(style);
        column++;
      } else if (chs == "Коэффицент эф. использования") {
        ws.cell(row, column, row + 1, column + 2, true)
        .string(chs.toString())
        .style(style);
        ws.cell(row + 2, column)
        .string("День")
        .style(style);
        ws.cell(row + 2, column + 1)
        .string("Ночь")
        .style(style);
        ws.cell(row + 2, column + 2)
        .string("Среднее")
        .style(style);
        column += 3;
      } else {
        ws.cell(row, column, row + 1, column + 1, true)
        .string(chs.toString())
        .style(style);
        ws.cell(row + 2, column)
        .string("День")
        .style(style);
        ws.cell(row + 2, column + 1)
        .string("Ночь")
        .style(style);
        column += 2;
      }
    });
    row = 5;
    column = 1;
    tableData.forEach(csvRow => {
      this.insertOneObject(csvRow, styles, ws, 1);
    });
    column = 1;
    if (total && total != undefined && total.length){
        total.push("-----")
        total.forEach(totalRow => {
            if(totalRow == "Total") {totalRow = "Итого"}
            if(totalRow.length == 0) {totalRow = "-----"}
            totalRow = totalRow.replace(regex, "");
            ws.cell(row, column)
                .string(totalRow.toString())
                .style(style);
            column++;
        });
    }
    row = 1;
    ws.column(2).setWidth(30);
    ws.column(10).setWidth(17);
    ws.column(11).setWidth(17);
    // ws.column(10).setWidth(18);
    // ws.column(14).setWidth(18);
    ws.row(4).freeze();
    ws.column(2).freeze();
  }

  insertOneObject(inputObject, styles, ws, groupName){
    let column = 1, style;
    style = styles.cellContent;
    for (let element of inputObject.c) {
      let value = typeof (element) == "object" ? element.t.toString() : element.toString()
      if (value.length == 0) {value = "-----"} else {
        value = value.replace(regex, "");
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

    xlsxData = [xlsxData[0]];
    xlsxData.forEach((row) => {
      this.insertOneTable("Сводный отчет по анализу эффективности использования",row.data, row.headers, row.total, styles);
    })
  }
}

module.exports = Report;
