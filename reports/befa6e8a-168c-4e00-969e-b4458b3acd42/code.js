const Base = require("../lib/base");

let row = 1;
let GlobalStartDate;
let GlobalEndDate;
let stringForHeader;
const regex = new RegExp('(\ km)|(\ l)', 'gm');

class Report extends Base {
    //7. Ежедневный отчет по посещению геозон

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

    stringForHeader = `7. Ежедневный отчет по посещению геозон за период с ${GlobalStartDate.getDate()}-${GlobalStartDate.getMonth()+1 > 9 ? GlobalStartDate.getMonth()+1 : "0" + (GlobalStartDate.getMonth()+1).toString()}-${GlobalStartDate.getFullYear()} по ${GlobalEndDate.getDate()}-${GlobalEndDate.getMonth()+1 > 9 ? GlobalEndDate.getMonth()+1 : "0" + (GlobalEndDate.getMonth()+1).toString()}-${GlobalEndDate.getFullYear()} АТТ АО "Каражанбасмунай"`;

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
      let intervalForStart = 0;
      let intervalForEnd = Math.trunc((Number(params.endDate) - Number(params.startDate)) / 2);
      let globalArray;
      for(let i = 0; i < 2; i++){
        let resultExecReport = await this.execReport(params.group_name,Number (params.startDate) + intervalForStart, Number (params.endDate) - intervalForEnd, resourceId, templateId);
        //Get all Data from Report
        let allData = await this.getAllDataFromReport(resultExecReport);
        await this.makeForGetData(allData);

        if (i >= 1) {
          await this.mergeTwoReportsToOne(globalArray, allData);
        } else {
          intervalForEnd = 0;
          intervalForStart = Math.trunc((Number(params.endDate) - Number(params.startDate)) / 2) + 2;
          globalArray = allData;
        }
        // allData.push({header: [], data: resultExecReport.reportResult.stats});
      }
      await this.calculateSumColumnAndTotal(globalArray);
      return globalArray;
    } catch (e){
      return Promise.reject(e);
    } finally {
        if (resourceId && templateId){
            await this.deleteReportTemplate(resourceId, templateId);
        }
    }
  }

  async calculateSumColumnAndTotal(globalArray){
    let sumForTotal = 0;
    for (let i = 0; i < globalArray[0].data.length; i++){
      let sumForOneObject = 0;
      for(let j = 0; j < globalArray[0].data[i].r.length; j++){
        let seconds = await this.convertFromDateStringToSeconds(globalArray[0].data[i].r[j].c[6]);
        sumForOneObject += seconds;
        sumForTotal += seconds;
      }
      globalArray[0].data[i].c[6] = await this.convertFromSecondsToDateString(sumForOneObject);
    }
    globalArray[0].total[6] = await this.convertFromSecondsToDateString(sumForTotal);
  }

  async mergeTwoReportsToOne(globalArray, secondReportObject) {
    for (let i = 0; i < secondReportObject[0].data.length; i++){
      globalArray[0].data[i].c[5] = secondReportObject[0].data[i].c[5]
      for (let j = 0; j < secondReportObject[0].data[i].r.length; j++){
        let numberValue = globalArray[0].data[i].r[globalArray[0].data[i].r.length-1].c[0];
        numberValue = numberValue.split(".");

        if (globalArray[0].data[i].c[6] == "0:00:00" && secondReportObject[0].data[i].c[6] != "0:00:00"){
          globalArray[0].data[i]= secondReportObject[0].data[i]
          break;
        } else if (globalArray[0].data[i].c[6] == "0:00:00" && secondReportObject[0].data[i].c[6] == "0:00:00"){
          break;
        } else {
          secondReportObject[0].data[i].r[j].c[0] = String(numberValue[0] + "." + Number(Number(numberValue[1]) + 1));
          globalArray[0].data[i].r.push(secondReportObject[0].data[i].r[j]);
        }
      }
    }
    return;
  }

  async convertFromDateStringToSeconds(string){
    if (!string || !string.length || typeof(string) != "string"){
      return 0;
    }
    let valueToConvert = string;
    valueToConvert = valueToConvert.split(":");
    let seconds = valueToConvert[2] ,minutes = valueToConvert[1], hours = valueToConvert[0];
    return Number (Number(minutes) * 60 + Number(hours) * (Math.pow(60,2)) + Number(seconds));
  }

   async convertFromSecondsToDateString(rawSeconds){
    if (!rawSeconds || typeof(rawSeconds) != "number") {
      return "0:00:00";
    }
    let days = Math.floor((rawSeconds) / 24 / 60 / 60), 
    hours = Math.floor((rawSeconds) / 60 / 60 - days * 24),
    minutes = Math.floor((rawSeconds) / 60) - (hours * 60 + days * 24 * 60),
    seconds = (rawSeconds) % 60,
    daysTitles = ["день", "дня", "дней"];
    let daysAndHours = null;
    if (days != 0){
      daysAndHours = `${days} ${await this.declOfNum(days ,daysTitles)} ${hours}`;
    }
    return [
      daysAndHours ? daysAndHours : hours,
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }

  async declOfNum(number, titles) {  
    let cases = [2, 0, 1, 1, 1, 2];  
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
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

  async generateReportTemplate(resourceId) {
    var generateReportParams = 
    {
        "id": 0,
        "itemId": resourceId,
        "callMode": "create",
        "n":"7. Ежедневный отчет по посещению геозон АТТ АО  «Каражанбасмунай», создан с помощью Repogen ",
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
            "n":"unit_group_stats",
            "l":"Статистика",
            "c":"",
            "cl":"",
            "cp":"",
            "s":"[\"report_name\",\"time_begin\",\"time_end\"]",
            "sl":"[\"Отчет\",\"За период с \",\"по\"]",
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
            "n":"unit_group_trips",
            "l":"Поездки",
            "c":"[\"user_column\",\"location_begin\",\"time_begin\",\"time_end\",\"duration\"]",
            "cl":"[\"Группа/ Автоколонна\",\"Наименование геозоны\",\"Начало движения\",\"Конец движения\",\"Проведенное время\"]",
            "cp":"[{\"p\":\"profile_field(model)\",\"vt\":\"0\"},{},{},{},{}]",
            "s":"",
            "sl":"",
            "filter_order":[
              "custom_sensors_col",
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
            "p":"{\"duration\":{\"min\":10,\"flags\":1},\"custom_sensors_col\":[\"\"],\"geozones_ex\":{\"zones\":\"2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,543,545,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575,577,578,579,580,581,582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,598,599,600,601,602,603,604,605,606,607,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,641,642,643,644,645,646,647,648,649,650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,700,701,702,703,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,764,765,766,767,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827,828,829,830,831,833,834,835,836,837,838,839,840,841,842,843,844,845,846,847,848,849,850,851,852,853,854,855,856,857,858,859,860,861,862,863,865,1,866,867,868,869,870,871,872,879,874,875,876,877,878,873,880,881,882,883,884,885,886,887,888,889,890,892,891,893,894,895,897,898,899,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922\",\"types\":\"1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1\",\"split\":1,\"flags\":0}}",
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

    // delete xlsxData[xlsxData.length-1];
    xlsxData.forEach((row) => {
      this.insertOneTable("Отчёт по посещению геозон",row.data, row.headers, row.total, styles);
    })
  }
}

module.exports = Report;
