const Base = require("../lib/base");

let row = 2;

let ws = null;

const minorRooms = {
  hallway: 1,
  corridor: 2,
  kitchen: 3,
  kitchen_louge: 4,
  room_1: 5,
  room_2: 6,
  room_3: 7,
  room_4: 8,
  balcony: 9,
  loggia: 10,
  wardrobe: 11,
  pantry: 12,
  laundry_room: 13,
  bathroom_1: 14,
  bathroom_2: 15,
  bathroom_3: 16,
  another_room: 17,
  outside: 30,
  charging: 31
};

class Report extends Base {
  getFileName() {
    return `РОМИР_РЕПОРТ_${Date.now()}.xlsx`;
  }

  async getData(params) {
    if (params && (!params.startDate || params.userTimeMill == undefined || !params.group_name)){
      return {
        error: 0,
        message: "Error. Not passed required params."
      }
    }
    // console.log("params:", params);
    params.startDate = new Date(params.startDate);
    // console.log("params.startDate:", params.startDate);
    params.startDate.setHours(0); params.startDate.setMinutes(0); params.startDate.setSeconds(0); params.startDate.setMilliseconds(0);
    // console.log("params.startDate after all execute:", params.startDate);
    params.userTimeMill = params.userTimeMill * -1 * 60;
    // console.log("params.userTimeMill:", params.userTimeMill);
    // console.log("this.loginData.user.prp.tz & 0xffff:", this.loginData.user.prp.tz & 0xffff);
    params.startDate = params.startDate.getTime()/1000 - params.userTimeMill;
    // console.log("params.startDate finnaly:", params.startDate);
    params.endDate = params.startDate + 86399;
    // console.log("params.endDate:", params.endDate);
    try {
      //Get all Data from Report
      let items  = await this.getAllUnits();
      let group = await this.getGroupAndUIDUnits(params.group_name);
      let allData = await this.getDataForUnits(group, params.startDate, params.endDate, items);
      const xlsxData = {allData, groupName: group.nm};
      return xlsxData;
    } catch (e){
      console.log("Error in the 9c317886-0532-4aa8-b71a-6cbc4a92657/code.js:", e);
      return {
        error: 0,
        message: "Error. Something went wrong. Please, contact to Admind/Dev Team."
      }
      // return Promise.reject(e);
    }
  }
  async getMessagesOfUnit(unitId, dateFrom, dateTo) {
    let params = {
      itemId: unitId,
      timeFrom: Number(dateFrom),
      timeTo: Number(dateTo),
      flags:0,
      flagsMask:65280,
      loadCount:4294967295
    }
    let result = await this.callService("messages/load_interval", params);
    return result;
  }

  async parseDateForUnit(arrayWithData, itemId, arrayWithName){
    let allData = [], objectToPush = {}, tempMinimumArray = [], skiped = true;
    let tempCode = null, tempTime = 0, isUnitCharging = false;
    let count = 0, countAllMesage = 1;
    for (let item of arrayWithData.messages) {
      objectToPush.name_unit = arrayWithName[0];
      objectToPush.tracker_id = itemId;
      objectToPush.date = this.getDateString(item.t);
      objectToPush.grouping = 1;
      if (item.ble_major_1){
        objectToPush.apartment_id = item.ble_major_1;
      }

      if (item.p.io_116 != undefined){
        isUnitCharging = item.p.io_116 == 1 ? true : false;
      }

      if (isUnitCharging && item.p.ble_str_1 && tempMinimumArray.length > 0 && tempTime) {
        let arrayWithDataAverage = await this.calculateAverage(tempMinimumArray);
        let closestToZeroObject = await this.getClosestToZero(arrayWithDataAverage, tempCode);
        objectToPush.sumTime = item.t - objectToPush.startTimeNum;
        objectToPush.sumTimeString = this.getTimeString(objectToPush.sumTime, true)
        objectToPush.endTime = this.getTimeString(item.t, false);
        objectToPush.endTimeNum = item.t;
        objectToPush.room_id = closestToZeroObject.code;

        tempCode = closestToZeroObject.code;
        tempTime = item.t;

        allData.push(objectToPush);
        objectToPush = {};
        tempMinimumArray = [];

        count = 0;
      } else if (isUnitCharging && item.p.ble_str_1 && tempMinimumArray.length == 0 && tempTime){
        objectToPush.startTimeNum = tempTime;
        objectToPush.startTime = this.getTimeString(objectToPush.startTimeNum)
        objectToPush.sumTime = item.t - objectToPush.startTimeNum;
        objectToPush.sumTimeString = this.getTimeString(objectToPush.sumTime, true)
        objectToPush.endTime = this.getTimeString(item.t, false);
        objectToPush.endTimeNum = item.t;
        objectToPush.room_id = 31;

        tempCode = 31;
        tempTime = item.t;

        allData.push(objectToPush);
        objectToPush = {};

        count = 0;
      }

      if (!isUnitCharging && item.p.ble_str_1) {
        if ((tempTime && (item.t - tempTime >= 900 || item.p.ble_count == 0))){
          objectToPush.startTimeNum = tempTime;
          objectToPush.startTime = this.getTimeString(objectToPush.startTimeNum)
          objectToPush.sumTime = item.t - objectToPush.startTimeNum;
          objectToPush.sumTimeString = this.getTimeString(objectToPush.sumTime, true)
          objectToPush.endTime = this.getTimeString(item.t, false);
          objectToPush.endTimeNum = item.t;
          objectToPush.room_id = 30;

          tempCode = 30;
          tempTime = item.t;

          allData.push(objectToPush);
          objectToPush = {};
          tempMinimumArray = [];

          count = 0;
        } else {
          if (count == 0){
            objectToPush.startTimeNum = tempTime ? tempTime : item.t;
            objectToPush.startTime = this.getTimeString(objectToPush.startTimeNum)
          }
          let rawArray = await this.getObjectToPushTempMinimumArray(item)
          for (const rawRow of rawArray){
            tempMinimumArray.push(rawRow);
          }
          if (count != 0 && count % 10 == 0){  
            let arrayWithDataAverage = await this.calculateAverage(tempMinimumArray);
            let closestToZeroObject = await this.getClosestToZero(arrayWithDataAverage, tempCode);
            objectToPush.sumTime = item.t - objectToPush.startTimeNum;
            objectToPush.sumTimeString = this.getTimeString(objectToPush.sumTime, true)
            objectToPush.endTime = this.getTimeString(item.t, false);
            objectToPush.endTimeNum = item.t;
            objectToPush.room_id = closestToZeroObject.code;
  
            tempCode = closestToZeroObject.code;
            tempTime = item.t;

            allData.push(objectToPush);
            objectToPush = {};
            tempMinimumArray = [];
          }
          if (count == 10){
            count = 0;
          } else {
            count++;
          }
        }
      }
      if (count != 0 && tempMinimumArray.length > 0 && countAllMesage == arrayWithData.messages.length){
        let arrayWithDataAverage = await this.calculateAverage(tempMinimumArray);
        let closestToZeroObject = await this.getClosestToZero(arrayWithDataAverage, tempCode);
        objectToPush.sumTime = item.t - objectToPush.startTimeNum;
        objectToPush.sumTimeString = this.getTimeString(objectToPush.sumTime, true)
        objectToPush.endTime = this.getTimeString(item.t, false);
        objectToPush.endTimeNum = item.t;
        objectToPush.room_id = closestToZeroObject.code;

        tempCode = closestToZeroObject.code;
        tempTime = item.t;

        allData.push(objectToPush);
      }
      countAllMesage++;
    }
    return allData;
  }
 
  async getObjectToPushTempMinimumArray(item) {
    let arrayToReturn = [];
    let keys = Object.keys(item.p);
    keys = keys.filter(item => item.includes("ble_str"));
    for (let i = 1; i < keys.length + 1; i++){
      let objectToPush = {};
      objectToPush.value = item.p["ble_str_" + i] > 0 ? item.p["ble_str_" + i] : item.p["ble_str_" + i] * -1;
      objectToPush.code = parseInt(item.p["ble_minor_" + i], 16);
      arrayToReturn.push(objectToPush);
    }
    return arrayToReturn;
  }

  async calculateAverage(arrayWithValue) {
    let arrayToReturn = [];
    for (let item of arrayWithValue){
      let sum = 0, count  = 0;
      for (let itemForSum of arrayWithValue){
        if (item.code == itemForSum.code){
          sum += itemForSum.value;
          count++;
        }
      }
      let average = sum / count;
      arrayToReturn.push({average, code: item.code});
    }
    return arrayToReturn;
  }

  async getClosestToZero(arrayWithValue, tempCode) {
    let objectToReturn = null;
    let arrayForCheckMinimum = arrayWithValue.map(item => item.average);
    let min = Math.min(...arrayForCheckMinimum);
    let tempMininmumArray = [];
    for (let item of arrayWithValue) {
      if (item.average == min){
        tempMininmumArray.push(item);
      }
    }

    if (tempMininmumArray.length > 1 && tempCode){
      for (let item of tempMininmumArray){
        if (tempCode == item.code){
          objectToReturn = item;
          break;
        }
      }
    }

    if (objectToReturn == null){
      objectToReturn = tempMininmumArray[0];
    }
    
    return objectToReturn
  }
  
  async findRoomByCode(code){
    let room;
    let arrayKeys = Object.keys(minorRooms);
    for (let i = 0; i < arrayKeys.length; i++){
      if (code == minorRooms[arrayKeys[i]]){
        room = arrayKeys[i];
        break;
      }
    }

    return room;
  }
  async getDataForUnits(group, dateFrom, dateTo, allUnits){
    let dataForReturn = [];
    let objectToPush = {};
    for (let itemUnit of group.u){
      objectToPush.apartment = group.nm;
      objectToPush.messages = [];
      let arrayWithName = allUnits.filter(item => item.id == itemUnit);
      let firstObject = {
        name_unit: arrayWithName[0].nm, 
        date: this.getDateString(dateFrom),
        apartment: group.nm,
        grouping: 1
      };
      let messages = await this.getMessagesOfUnit(itemUnit, dateFrom, dateTo, arrayWithName);
      if (messages && messages.count == 0){
        firstObject.startTime = "---";
        firstObject.endTime = "---";
      } else {
        let parsedMessages = await this.parseDateForUnit(messages, itemUnit, arrayWithName);
        if (parsedMessages.length == 0){
          firstObject.startTime = "---";
          firstObject.endTime = "---";
          objectToPush.messages = [];
        } else {
          firstObject.startTime = parsedMessages[0].startTime;
          firstObject.endTime = parsedMessages[parsedMessages.length-1].endTime;

          let mergeAllWhatNeedsLatest = await this.mergeRecordWithSameRoomId(parsedMessages);
          let mergeAllWhatNeeds = await this.mergeRepeatRoomRecords(mergeAllWhatNeedsLatest);
          let onceAgainMergedDoubleRoomId = await this.mergeRecordWithSameRoomId(mergeAllWhatNeeds);

          firstObject.startTime = parsedMessages[0].startTime;
          firstObject.endTime = parsedMessages[parsedMessages.length-1].endTime;
          objectToPush.messages = onceAgainMergedDoubleRoomId;

        }
      }
      objectToPush.firstObject = firstObject;
      dataForReturn.push(objectToPush);
      objectToPush = {};
      }
    return dataForReturn;
  }

  async mergeRepeatRoomRecords(messages) {
    let arrayRoomNumbers = [], indexToSum = null;
    for (let i = 0; i < messages.length; i++){
      if (messages[i].sumTime > 90) {
        indexToSum = i;
        arrayRoomNumbers = [];
        arrayRoomNumbers.push(messages[i].room_id);
      } else if (indexToSum && i != 0){
        if (arrayRoomNumbers.length == 1){
          arrayRoomNumbers.push(messages[i].room_id);
        }
        if (messages[i].sumTime <= 90 && arrayRoomNumbers.indexOf(messages[i].room_id) > -1) {
          messages[indexToSum].sumTime += messages[i].sumTime;
          messages[indexToSum].endTimeNum += messages[i].sumTime;
          messages[indexToSum].endTime = this.getTimeString(messages[indexToSum].endTimeNum, false);
          messages[indexToSum].sumTimeString = this.getTimeString(messages[indexToSum].sumTime, true) || "---"
          messages.splice(i, 1);
          i -= 1;
        } else if (arrayRoomNumbers.length && arrayRoomNumbers.indexOf(messages[i].room_id) == -1) {
          indexToSum = i;
          arrayRoomNumbers = [];
          arrayRoomNumbers.push(messages[i].room_id);
        }
      }
    }
    return messages;
  }

  async mergeRecordWithSameRoomId(messages) {
    for (let i = 0; i < messages.length; i++){
      if (i!=0){
        if (messages[i].sumTime && messages[i].room_id && messages[i].room_id == messages[i-1].room_id){
          messages[i-1].sumTime += messages[i].sumTime;
          messages[i-1].endTime = this.getTimeString(messages[i-1].endTimeNum + messages[i].sumTime, false);
          messages[i-1].endTimeNum += messages[i].sumTime;
          messages[i-1].sumTimeString = this.getTimeString(messages[i-1].endTimeNum - messages[i-1].startTimeNum, true)
          messages.splice(i, 1);
          i -= 1;
        }
      }
    }
    return messages;
  }
  async getGroupAndUIDUnits(group_name) {
    var params = {
      spec:{
        itemsType:"avl_unit_group",
        propName:"sys_id",
        propValueMask: group_name,
        sortType:"sys_id",
        propType:"sys_id"
      },
      force:0,
      flags:1,
      from:0,
      to:0
    };
    let unitsData = await this.callService("core/search_items", params);
    return unitsData.items[0];
  }

  async getAllMessages(groupId) {
    var params = {
      spec: {
        itemsType:"avl_unit_group",
        propName:"sys_id",
        propValueMask: groupId.toString(),
        sortType:"sys_name",
        propType:"sys_name"
      },
      force:0,
      flags:1,
      from:0,
      to:0
    };
    let unitsData = await this.callService("core/search_items", params);
    return unitsData.items;
  }

  async getAllUnits() {
    var params = {
      spec:{
        itemsType:"avl_unit",
        propName:"sys_id",
        propValueMask:"",
        sortType:"sys_id",
        propType:"sys_id"
      },
      force:0,
      flags:1,
      from:0,
      to:0
    };
    let unitsData = await this.callService("core/search_items", params);
    return unitsData.items;
  }

  insertOneTable(tableData, styles) {
    tableData.forEach(csvRow => {
      this.insertOneObject(csvRow, styles, ws);
    });
  }
  insertOneCell(type, value, style, column) {
      if (value == undefined || value == null){
        ws.cell(row, column).string("---").style(style)
      } else {
        ws.cell(row, column)[type](value).style(style);
      }
      
  }
  insertOneObject(inputObject, styles){
    if (inputObject.sumTime == 0){
      return;
    }
    let column = 1, style;
    style = styles.cellContent;
    this.insertOneCell('string', inputObject.date, style, column++);
    this.insertOneCell('number', inputObject.apartment_id, style, column++);
    // ws.cell(row, ++column).number(inputObject.tracker_id).style(style);
    this.insertOneCell('string', inputObject.name_unit.nm, style, column++);
    this.insertOneCell('string', inputObject.startTime, style, column++);
    this.insertOneCell('string', inputObject.endTime, style, column++);
    this.insertOneCell('number', inputObject.room_id, style, column++);
    this.insertOneCell('string', inputObject.sumTimeString, style, column++);
    ws.row(row).group(inputObject.grouping, false);
    row++;
  }

  insertFirstObject(styles, inputObject) {
    let column = 1, style;
    style = styles.cellContent;
    this.insertOneCell('string', inputObject.date, style, column++);
    this.insertOneCell('string', inputObject.apartment, style, column++);
    this.insertOneCell('string', inputObject.name_unit, style, column++);
    this.insertOneCell('string', inputObject.startTime, style, column++);
    this.insertOneCell('string', inputObject.endTime, style, column++);
    ws.cell(row, column++).string("---").style(style);
    ws.cell(row, column++).string("---").style(style);
    row++;
  }

  make(xlsxData) {
    let nameOfSheets = xlsxData.groupName
    let headers = ["Дата","Код квартиры", "Трекер (ID)", "Начало", "Завершение", "Помещение ID", "Сумма времени"];

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

    this.insertHeaders(nameOfSheets,headers, styles);
    for (let itemGroup of xlsxData.allData){
      this.insertFirstObject(styles, itemGroup.firstObject);
      this.insertOneTable(itemGroup.messages, styles);
    }
  }
  insertHeaders(nameOfSheets, headers, styles){
    ws = this.addWorksheet(nameOfSheets);
    let column = 1; let style;
    style = styles.headers;
    headers.forEach((chs) => {
      ws.column(column).setWidth(14);
      ws.cell(1, column)
        .string(chs.toString())
        .style(style);
      column++;
    });
    ws.row(1).freeze();
  }

  getDateString(timespan) {
    let currentySpan = timespan + 10800;
    return (new Date(currentySpan * 1000).getDate() > 9 ? new Date(currentySpan * 1000).getDate() : "0" + new Date(currentySpan * 1000).getDate().toString())  
    + "." + (new Date(currentySpan * 1000).getMonth() > 8 ? new Date(currentySpan * 1000).getMonth() + 1 : "0" + (new Date(currentySpan * 1000).getMonth() + 1).toString())
    + "." + new Date(currentySpan * 1000).getFullYear();
  }
  getTimeString(timespan, isSumTime) {
    let currentySpan = timespan + 10800;
    if (isSumTime){
      currentySpan = timespan;
    }
    return (new Date(currentySpan * 1000).getHours() > 9 ? new Date(currentySpan * 1000).getHours()  : "0" + new Date(currentySpan * 1000).getHours().toString()) + ":"  
    + (new Date(currentySpan * 1000).getMinutes() > 9 ? new Date(currentySpan * 1000).getMinutes()  : "0" + new Date(currentySpan * 1000).getMinutes().toString()) + ":" 
    + (new Date(currentySpan * 1000).getSeconds() > 9 ? new Date(currentySpan * 1000).getSeconds()  : "0" + new Date(currentySpan * 1000).getSeconds().toString()) ;
  }
}

module.exports = Report;