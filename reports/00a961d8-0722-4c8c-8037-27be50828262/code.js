const Base = require("../lib/base");
let countSpeed = 0;
let lastUnit = "";
let sumDuration = new Date (1970, 1, 1, 0, 0, 0, 0);
let row = 2;
let globalArray = [];
let arrayWithTableAndColumns = [
  {
    table: "Статистика",
    columns: [{ label:"Grouping" },
    { label:"Пробег" },
    { label:"Время в движении" },
    { label:"Взвеш. Оценка качества вождения" }]
  },
  {
    table: "Превышение доп. скорости",
    columns: [{ label : "Кол-во", valueNotExist: "0", needToSum: true, subLabel: "Кол-во Превышение доп. скорости в процентах", countPercentageTime: true, postFix: "%" }]
  },
  {
    table: "Превышение крит. скорости",
    columns: [{ label : "Кол-во", valueNotExist: "0", needToSum: true, subLabel: "Кол-во Превышение крит. скорости в процентах", countPercentageTime: true, postFix: "%" }]
  },
  {
    table: "Торможение",
    columns: [{ label: "Резкие торможения, шт на 100км", valueNotExist: "0", needToTakeCount: true, defaultFormular: true },
              { label: "Кач. торм.", valueNotExist: "100", needToTakeCount: true, multiplicationOnFive: true }]
  },
  {
    table:"Ускорение",
    columns: [{ label:"Резкие ускорения, шт. на 100км", valueNotExist: "0", needToTakeCount: true, defaultFormular: true  },
              { label: "Кач. ускор.", valueNotExist: "100", needToTakeCount: true, multiplicationOnFive: true }]
  },
  {
    table:"Повороты налево",
    columns: [{ label:"Повороты налево, шт. на 100км ", valueNotExist: "0" },
              { label: "Качественные повороты налево", valueNotExist: "100" }]
  },
  {
    table:"Повороты направо",
    columns: [{ label:"Повороты направо, шт. на 100км", valueNotExist:"0" },
              { label: "Качественные повороты направо", valueNotExist:"100" }]
  },
  {
    table: "Собл. скор. режима",
    columns: [{ label:"Собл. скор. режима", valueNotExist:"100", needToTakeCount: true, multiplicationOnTen: true}]
  }
];

class Report extends Base {
  getFileName() {
    return `Group_report_${Date.now()}.xlsx`;
  }

  async getData(params) {
    if (params && (!params.startDate || !params.endDate || !params.group_name || params.userTimeMill == undefined)){
      return {
        error: 0,
        message: "Error. Not passed required params."
      }
    }
    params.userTimeMill = params.userTimeMill * -1 * 60;
    params.startDate = new Date(params.startDate).getTime()/1000 - ((this.loginData.user.prp.tz & 0xffff) -  params.userTimeMill);
    params.endDate = new Date (params.endDate).getTime()/1000 - ((this.loginData.user.prp.tz & 0xffff) - params.userTimeMill);
    let resourceId = await this.getIdOfResource();
    let reportTemplate = await this.generateReportTemplate(resourceId);
    var templateId = reportTemplate[0];
    try {
      //clean up results of a reports which was generated before
      let resultClean = await this.cleanUpResult(); // done
      if (resultClean.error > 0){
        await this.deleteReportTemplate(resourceId, templateId);
        return {
          error: 0,
          message: "Error clean up results"
        }
      }
      //get report data
      let resultRequestToCreate = await this.requestToCreateReport(resourceId, templateId); // done
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
      await this.makeForGetData(allData);
      // console.log("globalArray:",globalArray);
      return allData;
    } catch (e){
      return Promise.reject(e);
    } finally {
      if (resourceId != null && templateId != null){
        await this.deleteReportTemplate(resourceId, templateId);
      }
    }
  }

  //Clean up all reports of currently session
  async cleanUpResult() {
    return await this.callService("report/cleanup_result",{});
  }

  //Function for just check on exist
  async requestToCreateReport(idOfResource, idTemplate) {
    let params = {
      itemId: idOfResource,
      col: [idTemplate],
      flags: 0
    }
    return await this.callService("report/get_report_data",params);
  }

  //Getting id of resource for a create and generate report
  async getIdOfResource(){
    let params = {
        "spec":{
            "itemsType":"avl_resource",
            "propName":"reporttemplates",
            "propValueMask":"",
            "sortType":"sys_name",
            "propType":"propitemname"
        },
        "force":0,
        "flags":1,
        "from":0,
        "to":0
    }
    let result = await this.callService("core/search_items",params);
    if (result.items.length) {return result.items[0].id} else {return this.loginData.user.bact}
  }

  //Execute generation of report
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

  //Geting all rows for each table
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

  //Getting all data from repot
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

  //Create report template on account of user
  async generateReportTemplate(resourceId) {
    let generateReportParams = 
        {
            "id":0,
            "itemId": String (resourceId),
            "callMode":"create",
            "n":"ГПН",
            "ct":"avl_unit_group",
            "p":"{\"descr\":\"\",\"bind\":{\"avl_unit_group\":[]}}",
            "tbl":[
                {
                    "n":"unit_group_trips",
                    "l":"Поездки",
                    "c":"",
                    "cl":"",
                    "cp":"",
                    "s":"[\"render_trips\"]","sl":"[\"Треки поездок\"]",
                    "filter_order":[],
                    "p":"",
                    "sch":
                    {
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
                    "s":"[\"address_format\",\"time_format\",\"us_units\",\"multi_drivers\",\"trips_mileage\"]",
                    "sl":"[\"Address\",\"Time Format\",\"Measure\",\"Несколько водителей/прицепов\",\"Считать пробег только по поездкам\"]",
                    "filter_order":[],
                    "p":"{\"address_format\":\"1255211008_10_5\",\"time_format\":\"%E.%m.%Y_%p %I:%M:%S\",\"us_units\":0}",
                    "sch":
                    {
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
                    "n":"unit_group_ecodriving",
                    "l":"Статистика",
                    "c":"[\"user_column\",\"duration\",\"mileage\"]",
                    "cl":"[\"Взвеш. Оценка качества вождения\",\"Время в движении\",\"Пробег\"]",
                    "cp":"[{\"p\":\"(violation_rank) * const16.66666666666667\"},{},{}]",
                    "s":"",
                    "sl":"",
                    "filter_order":["violation_group_name","violation_duration","show_all_trips","mileage","colors","geozones_ex"],
                    "p":"{\"grouping\":\"{\\\"type\\\":\\\"total\\\",\\\"nested\\\":{\\\"type\\\":\\\"unit\\\"}}\",\"duration_format\":\"1\",\"violation_group_name\":\"*\"}",
                    "sch":
                    {
                        "f1":0,
                        "f2":0,
                        "t1":0,
                        "t2":0,
                        "m":0,
                        "y":0,
                        "w":0,
                        "fl":0
                    },
                    "f":16
                },
                {
                    "n":"unit_group_ecodriving",
                    "l":"Превышение доп. скорости",
                    "c":"[\"user_column\",\"violations_count\",\"duration\"]",
                    "cl":"[\"Превышение доп. скорости в процентах\",\"Кол-во\",\"Длительность\"]",
                    "cp":"[{\"p\":\"(violations_count) / (((mileage)) / const100)\",\"m\":\"%\"},{},{}]",
                    "s":"",
                    "sl":"",
                    "filter_order":["violation_group_name","violation_duration","show_all_trips","mileage","colors","geozones_ex"],
                    "p":"{\"grouping\":\"{\\\"type\\\":\\\"total\\\"}\",\"violation_group_name\":\"* доп.*\",\"violation_duration\":{\"min\":30,\"flags\":1},\"colors\":{\"1\":\"ff0000\",\"3\":\"ffc200\",\"5\":\"00c500\"}}",
                    "sch":
                    {
                        "f1":0,
                        "f2":0,
                        "t1":0,
                        "t2":0,
                        "m":0,
                        "y":0,
                        "w":0,
                        "fl":0
                    },
                    "f":272
                },
                {
                    "n":"unit_group_ecodriving",
                    "l":"Превышение крит. скорости",
                    "c":"[\"user_column\",\"violations_count\",\"duration\"]",
                    "cl":"[\"Превышение крит. скорости в процентах\",\"Кол-во\",\"Длительность\"]","cp":"[{\"p\":\"(violations_count) / (((mileage)) / const100)\",\"m\":\"%\"},{},{}]",
                    "s":"",
                    "sl":"",
                    "filter_order":["violation_group_name","violation_duration","show_all_trips","mileage","colors","geozones_ex"],
                    "p":"{\"grouping\":\"{\\\"type\\\":\\\"total\\\"}\",\"violation_group_name\":\"* крит.*\",\"violation_duration\":{\"min\":30,\"flags\":1},\"colors\":{\"1\":\"ff0000\",\"3\":\"ffc200\",\"5\":\"00c500\"}}",
                    "sch":
                    {
                        "f1":0,
                        "f2":0,
                        "t1":0,
                        "t2":0,
                        "m":0,
                        "y":0,
                        "w":0,
                        "fl":0
                    },
                    "f":272
                },
                {
                    "n":"unit_group_ecodriving",
                    "l":"Торможение",
                    "c":"[\"user_column\",\"user_column\",\"violations_count\"]","cl":"[\"Резкие торможения, шт на 100км\",\"Кач. торм.\",\"Кол-во\"]",
                    "cp":"[{\"p\":\"(violations_count) / ((mileage) / const100)\"},{\"p\":\"const100 - (const5 * ((violations_count) / ((mileage) / const100)))\"}]",
                    "s":"",
                    "sl":"",
                    "filter_order":["violation_group_name","violation_duration","show_all_trips","mileage","colors","geozones_ex"],
                    "p":"{\"grouping\":\"{\\\"type\\\":\\\"total\\\",\\\"nested\\\":{\\\"type\\\":\\\"unit\\\"}}\",\"violation_group_name\":\"*Резкие торможения*\"}",
                    "sch":
                    {
                        "f1":0,
                        "f2":0,
                        "t1":0,
                        "t2":0,
                        "m":0,
                        "y":0,
                        "w":0,
                        "fl":0
                    },
                    "f":16
                },
                {
                    "n":"unit_group_ecodriving",
                    "l":"Ускорение",
                    "c":"[\"user_column\",\"user_column\",\"violations_count\"]","cl":"[\"Резкие ускорения, шт. на 100км\",\"Кач. ускор.\",\"Кол-во\"]","cp":"[{\"p\":\"(violations_count) / ((mileage) / const100)\"},{\"p\":\"const100 - (const5 * ((violations_count) / ((mileage) / const100)))\"}]",
                    "s":"",
                    "sl":"",
                    "filter_order":["violation_group_name","violation_duration","show_all_trips","mileage","colors","geozones_ex"],
                    "p":"{\"grouping\":\"{\\\"type\\\":\\\"total\\\",\\\"nested\\\":{\\\"type\\\":\\\"unit\\\"}}\",\"violation_group_name\":\"*Резкие ускорения*\",\"colors\":{\"1\":\"ff0000\",\"3\":\"ffc200\",\"5\":\"00c500\"}}",
                    "sch":
                    {
                        "f1":0,
                        "f2":0,
                        "t1":0,
                        "t2":0,
                        "m":0,
                        "y":0,
                        "w":0,
                        "fl":0
                    },
                    "f":16
                },
                {
                    "n":"unit_group_ecodriving",
                    "l":"Повороты налево",
                    "c":"[\"user_column\",\"user_column\"]","cl":"[\"Повороты налево, шт. на 100км \",\"Качественные повороты налево\"]",
                    "cp":"[{\"p\":\"(violations_count) / ((mileage) / const100)\"},{\"p\":\"const100 - (const5 * ((violations_count) / ((mileage) / const100)))\"}]",
                    "s":"",
                    "sl":"",
                    "filter_order":["violation_group_name","violation_duration","show_all_trips","mileage","colors","geozones_ex"],"p":"{\"grouping\":\"{\\\"type\\\":\\\"total\\\",\\\"nested\\\":{\\\"type\\\":\\\"unit\\\"}}\",\"violation_group_name\":\"*налев*\",\"colors\":{\"1\":\"ff0000\",\"3\":\"ffc200\",\"5\":\"00c500\"}}",
                    "sch":
                    {
                        "f1":0,
                        "f2":0,
                        "t1":0,
                        "t2":0,
                        "m":0,
                        "y":0,
                        "w":0,
                        "fl":0
                    },
                    "f":16
                },
                {
                    "n":"unit_group_ecodriving",
                    "l":"Повороты направо",
                    "c":"[\"user_column\",\"user_column\"]","cl":"[\"Повороты направо, шт. на 100км\",\"Качественные повороты направо\"]","cp":"[{\"p\":\"(violations_count) / ((mileage) / const100)\"},{\"p\":\"const100 - (const5 * ((violations_count) / ((mileage) / const100)))\"}]",
                    "s":"",
                    "sl":"",
                    "filter_order":["violation_group_name","violation_duration","show_all_trips","mileage","colors","geozones_ex"],
                    "p":"{\"grouping\":\"{\\\"type\\\":\\\"total\\\",\\\"nested\\\":{\\\"type\\\":\\\"unit\\\"}}\",\"violation_group_name\":\"*направо*\",\"colors\":{\"1\":\"ff0000\",\"3\":\"ffc200\",\"5\":\"00c500\"}}",
                    "sch":
                    {
                        "f1":0,
                        "f2":0,
                        "t1":0,
                        "t2":0,
                        "m":0,
                        "y":0,
                        "w":0,
                        "fl":0
                    },
                    "f":16
                },
                {
                    "n":"unit_group_ecodriving",
                    "l":"Собл. скор. режима",
                    "c":"[\"user_column\",\"violations_count\"]",
                    "cl":"[\"Собл. скор. режима\",\"Кол-во\"]",
                    "cp":"[{\"p\":\"const100 - ((violations_count) / ((((mileage)) / const100)) * const10)\"},{}]",
                    "s":"",
                    "sl":"",
                    "filter_order":["violation_group_name","violation_duration","show_all_trips","mileage","colors","geozones_ex"],
                    "p":"{\"grouping\":\"{\\\"type\\\":\\\"total\\\",\\\"nested\\\":{\\\"type\\\":\\\"unit\\\"}}\",\"violation_group_name\":\"*превышение скорости*\",\"violation_duration\":{\"min\":1,\"flags\":1,\"max\":86400}}",
                    "sch":
                    {
                        "f1":0,
                        "f2":0,
                        "t1":0,
                        "t2":0,
                        "m":0,
                        "y":0,
                        "w":0,
                        "fl":0
                    },
                    "f":16
                }
            ]
        }
    let reportTemplateGeneratedData = await this.callService(
      "report/update_report",
      generateReportParams
    );
    return reportTemplateGeneratedData;
  }

  //Delete report template from account of user
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
      await this.changeOneTable(row.data, row.headers, row.label);
      xlsxData[tableCount].data = row.data;
      tableCount++;
    }
    return xlsxData;
  }

  async changeOneTable(tableData, headers, label) {
    let column = 0;
    let indexId = arrayWithTableAndColumns.findIndex(table => table.table === label);
    for(let chs of headers){
      let indexIdOfColumns = arrayWithTableAndColumns[indexId].columns.findIndex(column => column.label === chs);
      if (indexIdOfColumns > -1){
        arrayWithTableAndColumns[indexId].columns[indexIdOfColumns].index = column;
      }
      column++;
    };
    let objectCount = 0;
    for(let csvRow of tableData) {
      await this.changeOneObject(csvRow, indexId);
      tableData[objectCount] = csvRow;
      objectCount++;
    };
    countSpeed = 0;
    sumDuration = new Date(1970, 0,  1, 0, 0, 0, 0);
  }

  async changeOneObject(inputObject, indexId){
    let column = 0; let objectToPush = {};
    for (let element of inputObject.c) {
      let value = typeof (element) == "object" ? element.t.toString() : element.toString()
      if (value.length == 0) {value = "-----"}
      for (let columnOfTable of arrayWithTableAndColumns[indexId].columns){
        if (indexId > 0){
          if (arrayWithTableAndColumns[indexId].columns != undefined && value!= "Total" && column == columnOfTable.index
            && globalArray.findIndex(groupingValue => groupingValue.Grouping == inputObject.c[0]) > -1){
              let indexOfGlobalArray = globalArray.findIndex(groupingValue => groupingValue.Grouping == inputObject.c[0]);
              if (columnOfTable.needToSum == true) { 
                if (lastUnit.length == 0){
                  lastUnit = inputObject.c[0];
                }
                countSpeed++;
                if (inputObject.c[0] != lastUnit){
                  countSpeed = 1;
                  value = Number (value);
                  sumDuration = new Date (1970, 0, 1, 0, 0, 0, 0)
                }
                let globalObject = globalArray.find(groupingValue => groupingValue.Grouping == inputObject.c[0]);
                let mileageValue = globalObject["Пробег"];
                mileageValue = mileageValue.replace(" km", "");
                let currentlyDurationArray = inputObject.c[inputObject.c.length -1].split(":");
                sumDuration.setHours(sumDuration.getHours() + Number (currentlyDurationArray[0]));
                sumDuration.setMinutes(sumDuration.getMinutes() + Number (currentlyDurationArray[1]));
                sumDuration.setSeconds(sumDuration.getSeconds() + Number (currentlyDurationArray[2]));
                let hours = Math.floor((sumDuration.getTime() / 1000) / 60 / 60);
                let minutes = Math.floor((sumDuration.getTime() / 1000) / 60) - (hours * 60);
                let seconds = (sumDuration.getTime() / 1000) % 60;
                let formattedDate = [
                  hours.toString().padStart(2, '0'),
                  minutes.toString().padStart(2, '0'),
                  seconds.toString().padStart(2, '0')
                ].join(':');
                let someValue = Number ((countSpeed)/(mileageValue/100));
                if (columnOfTable.subLabel != undefined){
                  globalArray[indexOfGlobalArray][columnOfTable.subLabel] = String (someValue.toFixed(2) + (columnOfTable.postFix != undefined ? columnOfTable.postFix : ""));
                } else {
                  globalArray[indexOfGlobalArray][columnOfTable.label] = String (someValue.toFixed(2) + (columnOfTable.postFix != undefined ? columnOfTable.postFix : ""));
                }
                lastUnit = inputObject.c[0];
                if (columnOfTable.needToSum != undefined && columnOfTable.countPercentageTime != undefined){
                  globalArray[indexOfGlobalArray][columnOfTable.subLabel] = "\""+countSpeed+ "\"" + "&CHAR(10)&" + "\""  +globalArray[indexOfGlobalArray][columnOfTable.subLabel] + "\"" + "&CHAR(10)&" + "\""  + formattedDate + "\"";
                }
              } else if (columnOfTable.needToTakeCount != undefined){
                let globalObject = globalArray.find(groupingValue => groupingValue.Grouping == inputObject.c[0]);
                let mileageValue = globalObject["Пробег"];
                mileageValue = mileageValue.replace(" km", "");
                let countValue = inputObject.c[inputObject.c.length - 1];
                let someValue;
                if (columnOfTable.multiplicationOnFive){
                  someValue = Number (100 - (5 * (countValue/(mileageValue/100))));
                } else if (columnOfTable.multiplicationOnTen){
                  someValue = Number (100 - (countValue/(((mileageValue)/100)) * 10));
                } else if (columnOfTable.defaultFormular){
                  someValue = Number (countValue/(mileageValue/100));
                }
                globalArray[indexOfGlobalArray][columnOfTable.label] = String (someValue.toFixed(2));
              }else {
                globalArray[indexOfGlobalArray][columnOfTable.label] = value
              }
          }
        } else if (arrayWithTableAndColumns[indexId].columns != undefined && value!= "Total" && column == columnOfTable.index
        && globalArray.findIndex(groupingValue => groupingValue.Grouping == inputObject.c[0]) == -1){
          objectToPush[columnOfTable.label] = value;
        }
      }
      if (element && element.t) {
        inputObject.c[column].t = value;
      } else {
        inputObject.c[column] = value;
      }
      column++;
    };
    let keysOfObjectToPush = Object.keys(objectToPush);
    if (keysOfObjectToPush.length > 0){
      globalArray.push(objectToPush);
    }
    if (indexId > 0 && inputObject.c[0] != "Total"){
      for (let table of arrayWithTableAndColumns){
        for (let col of table.columns){
          let indexOfGlobalArray = globalArray.findIndex(groupingValue => groupingValue.Grouping == inputObject.c[0]);
          let keysOfGlobalObjectUnit = Object.keys(globalArray[indexOfGlobalArray]);
          if (keysOfGlobalObjectUnit.indexOf(col.label) == -1 && keysOfGlobalObjectUnit.indexOf(col.subLabel) == -1){
            if (col.subLabel != undefined){
              globalArray[indexOfGlobalArray][col.subLabel] = (col.countPercentageTime == true ? ('\"0\"&CHAR(10)&') : "")  + " " + ("\"" + col.valueNotExist + (col.postFix != undefined ? col.postFix : "") + "\"" + '&CHAR(10)&') + " "  + (col.countPercentageTime == true ? ("\"00:00:00\"") : "");
            } else {
              globalArray[indexOfGlobalArray][col.label] = col.valueNotExist;
            }
          }
        }
      }
    }
    if (inputObject.r){
      for(let subelement of inputObject.r){
        await this.changeOneObject(subelement, indexId);
      }
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

  insertFirstTable (styles){
    globalArray.shift();
    let headers = [
      { label: "Гос. номер ТС", indexKey: "Grouping" },
      { label: "Пробег", indexKey: "Пробег" },
      { label: "Время в движении", indexKey : "Время в движении" },
      { label: "Превышения доп. скорости", indexKey: "Кол-во Превышение доп. скорости в процентах", needToLineBreak: true },
      { label: "Превышения крит. скорости", indexKey: "Кол-во Превышение крит. скорости в процентах", needToLineBreak: true },
      { label: "Резкие торможения, шт. на 100 км", indexKey: "Резкие торможения, шт на 100км" },
      { label: "Резкие ускорения, шт. на 100 км", indexKey: "Резкие ускорения, шт. на 100км" }, 
      { label: "Повороты направо", indexKey: "Повороты направо, шт. на 100км" },
      { label: "Повороты налево", indexKey: "Повороты налево, шт. на 100км " },
      { label: "Собл. скор. режима", indexKey: "Собл. скор. режима" },
      { label: "Кач. торм.", indexKey: "Кач. торм." },
      { label: "Кач. ускор.", indexKey: "Кач. ускор." },
      { label: "Кач. повороты напаво", indexKey: "Качественные повороты направо" },
      { label: "Кач. повороты налево", indexKey: "Качественные повороты налево" },
      { label: "Взвеш. оценка качества вождения", indexKey: "Взвеш. Оценка качества вождения" }
    ];
    let ws = this.addWorksheet("Общая таблица");
    ws.row(1).freeze();
    ws.column(1).freeze();
    for (let i = 0; i < headers.length; i++){
      ws.cell(1, i+1)
        .string(headers[i].label.toString())
        .style(styles.headers);   
      ws.column(i+1).setWidth(headers[i].label.length + 2);
    }
    let row = 2;
    let column = 1;
    for (let i = 0; i < globalArray.length; i++){
      ws.row(row).setHeight(35);
      for (let header of headers){
        if (header.needToLineBreak != undefined){
          ws.cell(row, column)
          .formula('='+globalArray[i][header.indexKey.toString()])
          .style(styles.cellContent);
        } else {
          ws.cell(row, column)
          .string(globalArray[i][header.indexKey.toString()])
          .style(styles.cellContent);
        }
        column++;
      }
      column = 1;
      row++;
    }
  }

  make(xlsxData) {

    let defaultAlignment = {
        horizontal: 'center',
        vertical: 'center'
    }
    let wrapTextAligment = {
      horizontal: 'center',
      vertical: 'center',
      wrapText: true
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
        alignment: wrapTextAligment
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
    this.insertFirstTable(styles);
  }
}

module.exports = Report;
