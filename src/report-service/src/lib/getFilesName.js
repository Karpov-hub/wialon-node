import commonMethods from "./common-methods";

async function getFileName(params) {
    let reportName = "Unknown_report_name";
    let objectName = "Unknown_name_object";
    let startDateString = "Start_date_not_setted", endDateString = "End_date_not_setted";
    try {
        switch (params.report_id) {
            default: {
                reportName = await commonMethods.getReportName(params.params.routeId);
                if (params && params.params) {
                    if (params.params.group_name) {
                        objectName = await getNameFromArray("getAllGroups", params.params.group_name, params);
                    } else if (params.params.unit) {
                        objectName = await getNameFromArray("getAllUnits", params.params.unit, params);
                    } else {
                        objectName = "";
                    }
                }
                startDateString = params.params.startDateMill ? await getDateString(params.params.startDateMill) : "Start_date_not_setted";
                endDateString = params.params.endDateMill ? await getDateString(params.params.endDateMill) : "End_date_not_setted";
            }
        }
    } catch (e) {
        console.log(e);
    } finally {
        return [
            reportName,
            objectName,
            startDateString,
            endDateString,
            Date.now()].join("_");
    }
}

async function getNameFromArray(method, filterValue, params) {
    let objectName;
    let allObjects = await commonMethods[method](params);
    let filteredArray = allObjects.filter(item => item.id == filterValue);
    if (filteredArray.length > 0) {
        objectName = filteredArray[0].name;
    }
    return objectName;
}

async function getDateString(timespan) {
    return [getSomeDateValue("getDate", 9, 0, timespan),
    (getSomeDateValue("getMonth", 8, 1, timespan)),
    convertToDate(timespan).getFullYear()].join(".");
}
async function getTimeString(timespan) {
    return [(getSomeDateValue("getHours", 9, 0, timespan)),
    (getSomeDateValue("getMinutes", 9, 0, timespan)),
    (getSomeDateValue("getSeconds", 9, 0, timespan))].join(":");
}

function convertToDate(timespan) {
    return new Date(timespan)
}

function getSomeDateValue(method, moreThan, plusForMonth, timespan) {
    return convertToDate(timespan)[method]() > moreThan ? (convertToDate(timespan)[method]() + plusForMonth).toString() : `0${convertToDate(timespan)[method]() + plusForMonth}`;
}

export default {
    getFileName
};