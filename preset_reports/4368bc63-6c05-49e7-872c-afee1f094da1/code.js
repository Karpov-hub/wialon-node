const Base = require("../lib/base");

let row = 1;
let GlobalStartDate;
let GlobalEndDate;
let stringForHeader;
const regex = new RegExp('(\ km(\/)(h))|(\ km)|(\ l)', 'gm');

class Report extends Base {
    //21. Движение АТТ АО  «Каражанбасмунай» по объектам

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

    stringForHeader = `21. Движение АТТ АО  «Каражанбасмунай» по объектам за период с ${GlobalStartDate.getDate()}-${GlobalStartDate.getMonth()+1 > 9 ? GlobalStartDate.getMonth()+1 : "0" + (GlobalStartDate.getMonth()+1).toString()}-${GlobalStartDate.getFullYear()} по ${GlobalEndDate.getDate()}-${GlobalEndDate.getMonth()+1 > 9 ? GlobalEndDate.getMonth()+1 : "0" + (GlobalEndDate.getMonth()+1).toString()}-${GlobalEndDate.getFullYear()}`;

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
      // await this.makeForGetData(allData);
      await this.mergeAllToFirstList(allData);
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

  async cleanUpResult() {
    return await this.callService("report/cleanup_result",{});
  }

  async mergeAllToFirstList(allData){
    for (let i = 0; i < allData[0].data.length; i++){
      for (let j = 0; j < allData[0].data[i].r.length; j++){
        allData[0].data[i].r[j].c[4] = allData[1].data[i].r[j].c[3];
      }
    }
    return;
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

  async generateReportTemplate(resourceId) {
    var generateReportParams = 
    {
      "id":0,
      "callMode": "create",
      "itemId": resourceId,
      "n":"21 Движение АТТ АО  «Каражанбасмунай» по объектам, создан с помощью Repogen.",
      "ct":"avl_unit_group",
      "p":"{\"descr\":\"\",\"bind\":{\"avl_unit_group\":[]}}",
      "tbl":[
        {
          "n":"unit_group_stats_zones",
          "l":"Статистика",
          "c":"",
          "cl":"",
          "cp":"",
          "s":"[\"address_zones\"]",
          "sl":"[\"Геозоны в качестве адресов\"]",
          "filter_order":[
            
          ],
          "p":"{\"address_zones_radius\":0}",
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
          "n":"unit_group_sensors_tracing",
          "l":"Трассировка датчика",
          "c":"[\"user_column\",\"formatted_value\",\"user_column\",\"time_begin\",\"location_begin\",\"speed\"]",
          "cl":"[\"Группа/Автоколонна\",\"Аккумулятор\",\"Батарейка\",\"Дата/Время\",\"Местоположение\",\"Скорость\"]",
          "cp":"[{\"p\":\"profile_field(model)\",\"vt\":\"0\"},{},{\"p\":\"profile_field(brand)\",\"m\":\"В.\",\"vt\":\"0\"},{},{},{}]",
          "s":"",
          "sl":"",
          "filter_order":[
            "interval",
            "sensor_name",
            "driver",
            "trailer",
            "geozones_ex"
          ],
          "p":"{\"interval\":{\"value\":180},\"sensor_name\":\"Аккумулятор\"}",
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
          "f":4368
        },
        {
          "n":"unit_group_sensors_tracing",
          "l":"Батарейка",
          "c":"[\"user_column\",\"formatted_value\"]",
          "cl":"[\"Группа/Автоколонна\",\"Батарейка\"]",
          "cp":"[{\"p\":\"profile_field(model)\",\"vt\":\"0\"},{}]",
          "s":"",
          "sl":"",
          "filter_order":[
            "interval",
            "sensor_name",
            "driver",
            "trailer",
            "geozones_ex"
          ],
          "p":"{\"interval\":{\"value\":180},\"sensor_name\":\"Батарейка\"}",
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
          "f":4368
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
    ws.cell(row, column, row, headers.length, true)
    .string(stringForHeader)
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
    row = 5;
    column = 1;
    tableData.forEach(csvRow => {
      this.insertOneObject(csvRow, styles, ws, 1);
    });
    column = 1;
    total.forEach(totalRow => {
      if(totalRow == "Total") {totalRow = "Итого"}
      if(totalRow.length == 0) {totalRow = "-----"}
      totalRow = totalRow.replace(regex, "");
      ws.cell(row, column)
        .string(totalRow.toString())
        .style(style);
      column++;
    });
    row = 2;
    ws.column(2).setWidth(35);
    ws.column(4).setWidth(20);
    ws.column(6).setWidth(20);
    ws.column(7).setWidth(30);
    ws.row(4).freeze();
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
      this.insertOneTable(stringForHeader, row.data, row.headers, row.total, styles);
    })
  }
}

module.exports = Report;
