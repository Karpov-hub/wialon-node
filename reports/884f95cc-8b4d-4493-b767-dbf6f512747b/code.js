const Base = require("../lib/base");

let row = 1;
let timeColumn = -1;
let numberColumn = -1;
let amountColumn = -1;
let levelBelowFlag = false;

class Report extends Base {
  getFileName() {
    return `Group_report_${Date.now()}.xlsx`;
  }

  async getData(params) {
    if (params && (!params.startDate || !params.endDate || !params.unit)){
      return {
        error: 0,
        message: "Error. Not passed required params."
      }
    }
    //clean up results of a reports which was generated before
    let resultClean = await this.cleanUpResult(); // done
    if (resultClean.error > 0){
      return {
        error: 0,
        message: "Error clean up results"
      }
    }
    let templateId = null;
    let resourceId = null;
    try {
      resourceId = this.loginData.user.bact;
      var templateData = await this.generateReportTemplate(resourceId);
      templateId = templateData[0];
      //get report data
      let resultRequestToCreate = await this.requestToCreateReport(resourceId, templateId); // done
      if (resultRequestToCreate && resultRequestToCreate.error){
        await this.deleteReportTemplate(resourceId, templateId)
        return {
          error: 0,
          message: "Error request to get report data. " + resultRequestToCreate.reason ? resultRequestToCreate.reason : ""
        }
      }
      let resultExecReport = await this.execReport(params.unit,new Date(params.startDate).getTime(), new Date(params.endDate).getTime(), resourceId, templateId);
      //Get all Data from Report
      let allData = await this.getAllDataFromReport(resultExecReport);
      let allTables = await this.getAllTables(resultRequestToCreate);
      await this.checkAllTables(allData, allTables);
      //Get all sensors Unit's
      let unitsSenors = await this.getAllSensorsOfUnit(params.unit);
      let nameOfUnit = unitsSenors.nm;
      //Get name Parametr's Temperatur Fuel
      let nameParam = await this.getNameParametrSensorTemperatureFuel(unitsSenors);
      //Update Custom Property
      let updateProperty = await this.updateCustomProperty(resourceId, params.unit);
      //Get count Messages
      let countMessages = await this.getCountOfMessage(new Date(params.startDate).getTime(), new Date(params.endDate).getTime(), params.unit);
      //Get all Messages
      let messages = await this.getMessages(countMessages, params.unit);
      //Get data about temperature of event
      await this.makeForGetData(allData, messages, nameParam);
      //Delete Report Template
      let deleteTemplate = await this.deleteReportTemplate(resourceId, templateId);
      allData.push({nameOfUnit: nameOfUnit});
      return allData;
    } catch (e){
      if (templateId != null && resourceId != null){
        await this.deleteReportTemplate(resourceId, templateId);
      }
      return Promise.reject(e);
    }
  }

  async getAllTables(rawObject) {
    let allTalbeColumnsAndName = [];
    for (let table of rawObject[0].tbl) {
      let columns = JSON.parse(table.cl);
      columns.unshift("Группировка");
      columns.unshift("№");
      allTalbeColumnsAndName.push({label: table.l, headers: columns});
    }
    return allTalbeColumnsAndName;
  }

  async checkAllTables(arrayOfCurenltyData, arrayOfAllTable) {
    if (arrayOfCurenltyData.length == 2){
      return;
    } else if (arrayOfCurenltyData.length == 0){
      for (let element of arrayOfAllTable){
        let emptyTotal = [];
        for (let i = 0; i < element.headers.length; i++){
          emptyTotal.push("");
        }
        arrayOfCurenltyData.push({total:emptyTotal, data: [], headers: element.headers, label: element.label});
      }
    } else {
      for (let key of arrayOfAllTable) {
        for (let key1 of arrayOfCurenltyData) {
          if (key1.label == key.label) break;
          let emptyTotal = [];
          for (let i = 0; i < key.headers.length; i++){
            emptyTotal.push("");
          }
          arrayOfCurenltyData.push({total:emptyTotal, data: [], headers: key.headers, label: key.label});
        }
      }
    }
  }

  async cleanUpResult() {
    return await this.callService("report/cleanup_result",{});
  }


  async requestToCreateReport(idOfResource, parsedParamsOfReportsTemplate) {
    let params = {
      itemId: idOfResource,
      col: [parsedParamsOfReportsTemplate],
      flags: 0
    }
    return await this.callService("report/get_report_data",params);
  }

  async getReportStatus() {
    return await this.callService("report/get_report_status", {});
  }

  async execReport(reportObjId, dateFrom, dateTo, idOfResource, parsedParamsOfReportsTemplate) {
    let params = {
      reportResourceId: idOfResource,
      reportTemplateId: parsedParamsOfReportsTemplate,
      reportObjectId: Number (reportObjId),
      reportObjectSecId: 0,
      interval: {
        flags: 16777216,
        from: Number (dateFrom) / 1000,
        to: Number (dateTo) / 1000
      },
      reportObjectIdList: []
    }
    return await this.callService("report/exec_report", params);
  }

  async generateReportTemplate(resourceId) {
    var generateReportParams = {
        itemId: resourceId,
        id:0,
        callMode: "create",
        n:"Загрузка\/Выгрузка",
        ct:"avl_unit",
        p:'{\"bind\":{\"avl_unit\":[]}}',
        type:"avl_resource",
        version:"b4",
        tbl:[
        {
            c:'[\"time_end\",\"location_end\",\"filled\"]',
            cl:'[\"Время загрузки\",\"Место загрузки\",\"Количество\"]',
            cp:"[{},{},{}]",
            f:4369,
            l:"Загрузка",
            n:"unit_fillings",
            p:'{\"grouping\":\"{\\\"type\\\":\\\"day\\\"}\"}',
            s:"",
            sch:{
            f1:0,
            f2:0,
            fl:0,
            m:0,
            t1:0,
            t2:0,
            w:0,
            y:0
            },
            sl:""
        },
        {
            c:'[\"time_end\",\"location_end\",\"thefted\"]',
            cl:'[\"Время выгрузки\",\"Место выгрузки\",\"Количество\"]',
            cp:"[{},{},{}]",
            f:4369,
            l:"Выгрузка",
            n:"unit_thefts",
            p:'{\"grouping\":\"{\\\"type\\\":\\\"day\\\"}\"}',
            s:"",
            sch:{
            f1:0,
            f2:0,
            fl:0,
            m:0,
            t1:0,
            t2:0,
            w:0,
            y:0
            },
            sl:""
        }
      ]
    }
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

  async makeForGetData(xlsxData, messagesData, nameParam) {  
    let tableCount = 0;
    for(let row of xlsxData) {
      await this.changeOneTable(row.data, row.headers, messagesData, nameParam);
      xlsxData[tableCount].total.push("");
      xlsxData[tableCount].data = row.data;
      tableCount++;
    }
    return xlsxData;
  }

  async changeOneTable(tableData, headers, messagesData, nameParam) {
    let column = 0;
    for(let chs of headers){
      if (chs == "Grouping") {headers[column] = "Группировка";}
      else if ((chs == "Время выгрузки" || chs == "Время загрузки") && timeColumn == -1) {timeColumn = column}
      else if (chs == "№") {numberColumn = column;}
      else if (chs == "Количество") {amountColumn = column;}
      column++;
    };
    headers.push("Температура топлива");
    let objectCount = 0;
    for(let csvRow of tableData) {
      levelBelowFlag = false;  
      await this.changeOneObject(csvRow, messagesData, nameParam);
      tableData[objectCount] = csvRow;
      objectCount++;
    };
    timeColumn = -1;
    numberColumn = -1;
    amountColumn = -1;
  }

  async changeOneObject(inputObject, messagesData, nameParam){
    let column = 0;
    for (let element of inputObject.c) {
      if (column == numberColumn && (Number (element ^ 0) == element)){
        levelBelowFlag = false;
        inputObject.c.push("");
      }
      if (column == numberColumn && (Number (element ^ 0) != element)){
        levelBelowFlag = true;
      }
      let value = typeof (element) == "object" ? element.t.toString() : element.toString()
      if (value.length == 0) {value = "-----"}
      else if (column == timeColumn && levelBelowFlag) {
        for (let objectOfMessage of messagesData){
          if (Number (inputObject.c[timeColumn].v) == Number (objectOfMessage.t)){
            if (nameParam.name.length > 0){
              inputObject.c.push((objectOfMessage.p[nameParam.name]).toFixed(2) + " °C");
              break;
            } else if (nameParam.arrayName.length > 0){
              let keys = Object.keys(objectOfMessage.p);
              for (let nameParametr of nameParam.arrayName){
                if (keys.indexOf(nameParametr)){
                  inputObject.c.push((objectOfMessage.p[nameParametr]).toFixed(2) + " °C");
                  break;
                }
              }
            }
          }
        }
      }
      if (element && element.t) {
        inputObject.c[column].t = value;
      } else {
        if (column == amountColumn){
          value = value.replace(" lt", ' л');
        }
        inputObject.c[column] = value;
      }
      column++;
    };
    if (inputObject.r){
      for(let subelement of inputObject.r){
        await this.changeOneObject(subelement, messagesData, nameParam);
      }
    };
  }

  async getAllSensorsOfUnit(idOfUnit) {
    let params = {
      id: idOfUnit.toString(),
      flags: 4097
    }
    let unitsData = await this.callService("core/search_item", params);
    return unitsData.item;
  }

  async getNameParametrSensorTemperatureFuel(allSensors) {
    let keysOfItem = Object.keys(allSensors.sens);
    let nameParam = "", arrayParam = [];
    for (let i = 0; i < keysOfItem.length; i++){
      if (allSensors.sens[keysOfItem[i]].n.indexOf("Температура топлива") >= 0){
        if (allSensors.sens[keysOfItem[i]].p.indexOf("/") > -1) {
          arrayParam = allSensors.sens[keysOfItem[i]].p.split("/");
        } else {
          nameParam = allSensors.sens[keysOfItem[i]].p;
        }
        break;
      }
    }
    return {name: nameParam, arrayName: arrayParam};
  }

  async updateCustomProperty (idOfResource, idOfUnit) {
    let params = {
      itemId: Number (idOfResource),
      name: "lastmsgl",
      value:"{\"u\":"+idOfUnit+",\"t\":\"data\",\"s\":1}"
    }
    await this.callService("item/update_custom_property", params);
    return "Custom property updated";
  }

  async getCountOfMessage(timeFrom, timeTo, unitId) {
    let params = {
      "layerName":"messages",
      "itemId":Number (unitId),
      "timeFrom":Number (timeFrom) / 1000,
      "timeTo":Number (timeTo) / 1000,
      "tripDetector":0,
      "flags":0,
      "trackWidth":4,
      "trackColor":"cc0000ff",
      "annotations":0,
      "points":1,
      "pointColor":"cc0000ff",
      "arrows":1
    }
    let result = await this.callService("render/create_messages_layer", params);
    return result.units[0].msgs.count
  }

  async getMessages(indexTo, unitId) {
    let params = {
      "layerName":"messages",
      "indexFrom":0,
      "indexTo":Number (indexTo),
      "unitId":Number (unitId)
    }
    let result = await this.callService("render/get_messages", params);
    return result;
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
      objectToPush.label = element.label;
      allData.push(objectToPush);

      i++;
    }
    return allData;  
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

  insertOneTable(ws, nameOfSheets, tableData, headers, total, styles) {
    let column = 1; let style;
    style = styles.headers;
    ws.cell(row,column,row,6,true)
      .string(nameOfSheets)
      .style(style);
    row++;
    headers.forEach((chs) => {
      if (chs == "Grouping") {chs = "Группировка"}
      if (chs == "Место загрузки" || chs == "Место выгрузки"){
        ws.column(column).setWidth(40);
      } else if(chs == "Температура топлива"){
        ws.column(column).setWidth(20);
      } else {
        ws.column(column).setWidth(18);
      }
      ws.cell(row, column)
        .string(chs.toString())
        .style(style);
      column++;
    })
    row++;
    tableData.forEach(csvRow => {
      this.insertOneObject(csvRow, styles, ws, 1);
    });
    column = 1;
    total.forEach(totalRow => {
      if(totalRow == "Total") {totalRow = "Итого"}
      if(totalRow.length == 0) {totalRow = "-----"}
      if (totalRow.indexOf(' lt') > -1){totalRow = totalRow.replace(' lt', ' л');}
      ws.cell(row, column)
        .string(totalRow.toString())
        .style(style);
      column++;
    });
    row++;
  }

  insertOneObject(inputObject, styles, ws, groupName){
    let column = 1, style;
    style = styles.cellContent;
    inputObject.c.forEach(element => {
      let value = typeof (element) == "object" ? element.t.toString() : element.toString()
      if (value.length == 0) {value = "-----"}
      ws.cell(row, column)
        .string(value.toString())
        .style(style);
      column++;
    });
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
        horizontal: 'center'
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
        border: defaultborder,
      }),
      headers: this.wb.createStyle({
        font: {
          size: 10,
          color: '#464646',
          name: 'Arial',
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
    let ws = this.addWorksheet("Загрузки-Выгрузки");
    ws.cell(row, 1, row, 6, true)
      .style(styles.headers)
      .string(xlsxData[xlsxData.length-1].nameOfUnit);
    delete xlsxData[xlsxData.length-1];
    row++;
    xlsxData.forEach((row) => {
      this.insertOneTable(ws, row.label,row.data, row.headers, row.total, styles);
    })
  }
}

module.exports = Report;
  