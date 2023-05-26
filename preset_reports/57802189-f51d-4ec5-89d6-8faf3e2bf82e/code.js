const Base = require("../lib/base");

const moment = require("moment");

let fromUnit = 0;
let toUnit = 0;

class Report extends Base {
    getFileName() {
        return `Kazan_Group_Report_${Date.now()}.xlsx`;
    }

    async getData(params) {
        fromUnit = 0;
        toUnit = 0;
        if (params.fromUnit) fromUnit = params.fromUnit;
        if (params.toUnit) toUnit = params.toUnit;
        // await this.updateCustomProperty(this.loginData.user.bact);
        // await this.setLocale();

        let displayFromDate = moment(params.startDate + " 00:00:00", "YYYY-MM-DD HH:mm:ss");
        let displayToDate = moment(params.endDate + " 23:59:59", "YYYY-MM-DD HH:mm:ss");
        let toDate = (displayToDate.valueOf() / 1000) - 10800;
        let fromDate = (displayFromDate.valueOf() / 1000) - 10800;
        try {
            var resourceId = this.loginData.user.bact;
            var unitsData = await this.getAllUnits();

            var templateData = await this.generateReportTemplate(resourceId);
            var templateId = templateData[0];
            var executedReportData = await this.executeReport({
                resourceId,
                templateId,
                fromDate,
                toDate,
                unitsData
            });
            var reportData = await this.getResultOfExecutedReport(executedReportData);
            var processedReportData = await this.processRawReportData(reportData);

            var xlsxData = {
                unitsData,
                templateId,
                executedReportData,
                displayToDate,
                displayFromDate,
                reportData,
                processedReportData
            }
            await this.deleteReportTemplate(resourceId, templateId);
            return xlsxData;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async updateCustomProperty(resourceId) {
        const setLocaleParams = { "params": [{ "svc": "item/update_custom_property", "params": { "itemId": resourceId, "name": "tz", "value": 134228528 } }, { "svc": "item/update_custom_property", "params": { "itemId": resourceId, "name": "dst", "value": -1 } }, { "svc": "item/update_custom_property", "params": { "itemId": 17940065, "name": "notify_block_account", "value": "0" } }], "flags": 0 };
        await this.callService("core/batch", setLocaleParams);
        return true;
    }

    async setLocale() {
        const setLocaleParams = {
            tzOffset: 134228528,
            language: "en",
            flags: "256",
            formatDate: "%Y-%m-%E %H:%M:%S",
        };
        await this.callService("render/set_locale", setLocaleParams);
        return true;
    }

    async processRawReportData(rawReportData) {
        let tripsData = await this.processTripsData(rawReportData.tripsData);
        let stopsData = await this.processStopsData(rawReportData.stopsData);
        let parkingsData = await this.processParkingsData(rawReportData.parkingsData);
        return { tripsData, stopsData, parkingsData };
    }


    async processParkingsData(rawParkingsData) {
        let pl = []; // processed parking list per unit
        for (let i = 0; i < rawParkingsData.length; i++) {
            const cp = rawParkingsData[i].c; // cp - current parking
            // parking overall data
            let parking = {...this.commonStopAndParkingData(cp), datewiseData: [] }

            // date wise parkings data
            if (rawParkingsData[i].d > 0) {
                const datelist = rawParkingsData[i].r;
                for (let j = 0; j < datelist.length; j++) {
                    const cdd = datelist[j].c; // cdd - current date data
                    let dateData = {...this.commonStopAndParkingData(cdd), parkings: [] }

                    // parkings done on current date
                    if (datelist[j].d > 0) {
                        const parkings = datelist[j].r;
                        for (let k = 0; k < parkings.length; k++) {
                            const p = parkings[k].c; // current parking
                            let currentParking = this.commonStopAndParkingData(p);
                            dateData.parkings.push(currentParking);
                        }
                    }
                    parking.datewiseData.push(dateData);
                }
            }
            pl.push(parking);
        }
        return pl;
    }

    commonStopAndParkingData(rawData) {
        return {
            no: rawData[0],
            grouping: rawData[1],
            startedAt: rawData[2] && rawData[2].t ? rawData[2].t + "" : "",
            endedAt: rawData[3] && rawData[3].t ? rawData[3].t : "",
            duration: rawData[4],
            endLocation: rawData[5] && rawData[5].t ? rawData[5].t : "",
            qty: rawData[6],
        }
    }

    async processStopsData(rawStopsData) {
        let sl = []; // processed stops list per unit
        for (let i = 0; i < rawStopsData.length; i++) {
            const cs = rawStopsData[i].c; // cs - current stop 
            // trip overall data
            let stop = {...this.commonStopAndParkingData(cs), datewiseData: [] }

            // date wise trips data
            if (rawStopsData[i].d > 0) {
                const datelist = rawStopsData[i].r;
                for (let j = 0; j < datelist.length; j++) {
                    const cdd = datelist[j].c; // cdd - current date data
                    let dateData = {...this.commonStopAndParkingData(cdd), stops: [] }

                    // stops done on current date
                    if (datelist[j].d > 0) {
                        const stops = datelist[j].r;
                        for (let k = 0; k < stops.length; k++) {
                            const s = stops[k].c; // current stop
                            let currentStop = this.commonStopAndParkingData(s);
                            dateData.stops.push(currentStop);
                        }
                    }
                    stop.datewiseData.push(dateData);
                }
            }
            sl.push(stop);
        }
        return sl;
    }


    commonTripData(rawData) {
        return {
            no: rawData[0],
            grouping: rawData[1],
            startedAt: rawData[2] && rawData[2].t ? rawData[2].t + "" : "",
            startLocation: rawData[3] && rawData[3].t ? rawData[3].t + "" : "",
            endedAt: rawData[4] && rawData[4].t ? rawData[4].t : "",
            endLocation: rawData[5] && rawData[5].t ? rawData[5].t : "",
            duration: rawData[6],
            mileage: rawData[7],
            avgSpeed: rawData[8],
            maxSpeed: rawData[9] && rawData[9].t ? rawData[9].t : ""
        }
    }

    async processTripsData(rawTripsData) {
        let tl = []; // processed trips list per unit
        for (let i = 0; i < rawTripsData.length; i++) {
            const ct = rawTripsData[i].c; // ctd - current trip 
            // trip overall data
            let trip = {...this.commonTripData(ct), datewiseData: [] }

            // date wise trips data
            if (rawTripsData[i].d > 0) {
                const datelist = rawTripsData[i].r;
                for (let j = 0; j < datelist.length; j++) {
                    const cdd = datelist[j].c; // cdd - current date data
                    let dateData = {...this.commonTripData(cdd), trips: [] }

                    // trips done on current date
                    if (datelist[j].d > 0) {
                        const trips = datelist[j].r;
                        for (let k = 0; k < trips.length; k++) {
                            const t = trips[k].c; // trip
                            let currentTrip = this.commonTripData(t);
                            dateData.trips.push(currentTrip);
                        }
                    }
                    trip.datewiseData.push(dateData);
                }
            }
            tl.push(trip);
        }
        return tl;
    }

    async getResultOfExecutedReport(executedReportData) {
        var reportDataOutput = [];
        var reportData = {};
        var tables = executedReportData["reportResult"]["tables"];
        var tablesWithData = []; // table names which have data in the report executed
        var reportDataParams = []; // params that will be passed to api to get data of tables
        var tableIndex = 0;
        // {"tableIndex":-1,"config":{"type":"range","data":{"from":0,"to":4,"level":0,"unitInfo":1}}}
        tables.forEach((table) => {
            var params = {
                svc: "report/select_result_rows",
                params: {
                    tableIndex: tableIndex,
                    config: {
                        type: "range",
                        data: {
                            from: 0,
                            unitInfo: 1,
                            level: 2
                        }
                    }
                }
            };

            if (table.name) {
                params.params.config.data.to = table.rows;
            }

            if (table.name == "unit_group_trips") {
                reportData.tripsHeaders = [];
                reportData.tripsHeaders = table.header;
                reportData.tripsTotal = table.total;

                reportDataParams.push(params);
                tablesWithData.push("trips");
                tableIndex++;
            }
            if (table.name == "unit_group_stops") {
                reportData.stopsHeaders = [];
                reportData.stopsHeaders = table.header;
                reportData.stopsTotal = table.total;
                reportDataParams.push(params);
                tablesWithData.push("stops");
                tableIndex++;
            }
            if (table.name == "unit_group_stays") {
                reportData.parkingsHeaders = [];
                reportData.parkingsHeaders = table.header;
                reportData.parkingsTotal = table.total;
                reportDataParams.push(params);
                tablesWithData.push("parkings");
                tableIndex++;
            }
        });

        let tableData = await this.callService("core/batch", reportDataParams);
        reportDataOutput = tableData;
        tableIndex = 0;

        reportData.tripsRowCount = 0;
        reportData.stopsRowCount = 0;
        reportData.parkingsRowCount = 0;
        if (reportDataOutput) {
            if (tablesWithData.includes("trips")) {
                reportData.tripsData = reportDataOutput[tableIndex];
                reportData.tripsRowCount = reportDataOutput[tableIndex].length;
                tableIndex++;
            }
            if (tablesWithData.includes("stops")) {
                reportData.stopsData = reportDataOutput[tableIndex];
                reportData.stopsRowCount = reportDataOutput[tableIndex].length;
                tableIndex++;
            }

            if (tablesWithData.includes("parkings")) {
                reportData.parkingsData = reportDataOutput[tableIndex];
                reportData.parkingsRowCount = reportDataOutput[tableIndex].length;
                tableIndex++;
            }
        }
        return reportData;
    }

    async executeReport(reportParams) {
        let unitIds = reportParams.unitsData.map(u => u.id);
        // unitIds = [21387427, 21319894, 777522, 20052700, 20054397, 20055004, 20053970, 21319818, 21326044, 20053267, 20053112, 21258472, 21256619, 21256996, 21258246, 21257754, 21257349, 21256009, 21256293, 20021710, 20020821, 20020091, 20021380, 20020375, 20021298, 20021580, 20020570, 20021028, 21715769];
        // return unitIds;
        var executeReportParams = {
            reportResourceId: reportParams.resourceId,
            reportTemplateId: reportParams.templateId,
            reportObjectId: unitIds[0],
            reportObjectIdList: unitIds,
            reportObjectSecId: 0,
            interval: {
                from: reportParams.fromDate,
                to: reportParams.toDate,
                flags: 16777216
            }
        };


        let data = this.callService("report/exec_report", executeReportParams);
        return data;
    }

    async generateReportTemplate(resourceId) {
        var generateReportParams = {
            id: 0,
            ct: "avl_unit_group",
            n: "Group report basic - zzzzz",
            p: "{\"descr\":\"\",\"bind\":{\"avl_unit_group\":[]}}",
            tbl: [{
                    n: "unit_group_stats",
                    l: "Statistics",
                    f: 0,
                    c: "",
                    cl: "",
                    cp: "",
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
                    sl: "[\"Отчет\",\"Группа\",\"Начало интервала\",\"Окончание интервала\",\"Время выполнения отчета\"]",
                    s: "[\"report_name\",\"unit_group_name\",\"time_begin\",\"time_end\",\"current_time\"]",
                    filter_order: []
                },
                {
                    n: "unit_group_trips",
                    l: "Поездки",
                    f: 4369,
                    c: "[\"time_begin\",\"location_begin\",\"time_end\",\"location_end\",\"duration\",\"mileage\",\"avg_speed\",\"max_speed\"]",
                    cl: "[\"Beginning\",\"Start Position\",\"End\",\"End Position\",\"Duration\",\"Mileage\",\"Avg. Speed\",\"Max Speed\"]",
                    cp: "[{},{},{},{},{},{},{}]",
                    p: "{\"grouping\":\"{\\\"type\\\":\\\"unit\\\",\\\"nested\\\":{\\\"type\\\":\\\"day\\\"}}\"}",
                    sch: {
                        f1: 0,
                        f2: 0,
                        t1: 0,
                        t2: 0,
                        m: 0,
                        y: 0,
                        w: 0,
                        fl: 0
                    },
                    sl: "",
                    s: "",
                    filter_order: [
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
                    ]
                },
                {
                    n: "unit_group_stops",
                    l: "Остановки(менее 10 минут)",
                    f: 4369,
                    c: "[\"time_begin\",\"time_end\",\"duration\",\"location\",\"stops_count\"]",
                    cl: "[\"Start\",\"End\",\"Duration\",\"Position\",\"Qty.\"]",
                    cp: "[{},{},{},{},{}]",
                    p: "{\"grouping\":\"{\\\"type\\\":\\\"unit\\\",\\\"nested\\\":{\\\"type\\\":\\\"day\\\"}}\",\"duration_format\":\"1\",\"duration\":{\"max\":599,\"flags\":1}}",
                    sch: {
                        f1: 0,
                        f2: 0,
                        t1: 0,
                        t2: 0,
                        m: 0,
                        y: 0,
                        w: 0,
                        fl: 0
                    },
                    sl: "",
                    s: "",
                    filter_order: [
                        "duration",
                        "sensors",
                        "sensor_name",
                        "driver",
                        "trailer",
                        "fillings",
                        "thefts",
                        "geozones_ex"
                    ]
                },
                {
                    n: "unit_group_stays",
                    l: "Стоянки(более 10 минут)",
                    f: 4369,
                    c: "[\"time_begin\",\"time_end\",\"duration\",\"location\",\"stays_count\"]",
                    cl: "[\"Start\",\"End\",\"Duration\",\"Position\",\"Qty.\"]",
                    cp: "[{},{},{},{},{}]",
                    p: "{\"grouping\":\"{\\\"type\\\":\\\"unit\\\",\\\"nested\\\":{\\\"type\\\":\\\"day\\\"}}\",\"duration_format\":\"1\",\"duration\":{\"min\":600,\"flags\":1}}",
                    sch: {
                        f1: 0,
                        f2: 0,
                        t1: 0,
                        t2: 0,
                        m: 0,
                        y: 0,
                        w: 0,
                        fl: 0
                    },
                    sl: "",
                    s: "",
                    filter_order: [
                        "duration",
                        "sensors",
                        "sensor_name",
                        "fillings",
                        "thefts",
                        "driver",
                        "trailer",
                        "geozones_ex"
                    ]
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

    async getAllUnits() {
        // console.log("fromUnit, toUnit = ", fromUnit, toUnit);
        var params = {
            spec: {
                itemsType: "avl_unit",
                propName: "sys_name",
                propValueMask: "*",
                sortType: "sys_name"
            },
            force: 0,
            flags: 1,
            from: fromUnit,
            to: toUnit
        };
        let unitsData = await this.callService("core/search_items", params);
        return unitsData.items;
    }

    async deleteReportTemplate(resourceId, templateId) {
        var setLocaleParams = {
            id: templateId,
            itemId: resourceId,
            callMode: "delete"
        };

        await this.callService("report/update_report", setLocaleParams);
        return "Template Deleted.";
    }
    updateSheet(sheet, data) {
        data.keys.forEach(key => {
            if (key != 'qty' && typeof data.rw[key] == "string") {
                sheet.cell(data.r, data.c).string(data.rw[key]).style(data.style);
            } else {
                sheet.cell(data.r, data.c).number(parseInt(data.rw[key])).style(data.style);
            }
            data.c++;
        });
    }
    make(xlsxData) {
        var ws = this.wb.addWorksheet('Content');
        var metaSheet = this.wb.addWorksheet('Статистика');
        var tripSheet = this.wb.addWorksheet('Поездки');
        var stopsSheet = this.wb.addWorksheet('Остановки (менее 10 минут)');
        var parkingsSheet = this.wb.addWorksheet('Стоянки (более 10 минут)');
        const lightBgStyle = this.wb.createStyle({
            font: {
                size: 12
            },
            fill: {
                type: "pattern",
                patternType: "solid",
                bgColor: "#e8e6e6",
                fgColor: "#e8e6e6"
            },
            border: {
                left: {
                    style: "thin",
                    color: "#7a7878"
                },
                right: {
                    style: "thin",
                    color: "#7a7878"
                },
                top: {
                    style: "thin",
                    color: "#7a7878"
                },
                bottom: {
                    style: "thin",
                    color: "#7a7878"
                }
            }
        })
        const darkBgStyle = this.wb.createStyle({
            font: {
                size: 12
            },
            fill: {
                type: "pattern",
                patternType: "solid",
                bgColor: "#9c9898",
                fgColor: "#9c9898"
            },
            border: {
                left: {
                    style: "thin",
                    color: "#7a7878"
                },
                right: {
                    style: "thin",
                    color: "#7a7878"
                },
                top: {
                    style: "thin",
                    color: "#7a7878"
                },
                bottom: {
                    style: "thin",
                    color: "#7a7878"
                }
            }
        })
        const dottedBgStyle = this.wb.createStyle({
            fill: {
                type: "pattern",
                patternType: "lightTrellis",
            },
            alignment: {
                vertical: "center"
            }
        });
        let row = 1;
        let column = 1;
        const reportLinks = [
            { type: "string", link: "_Групповой отчёт - Базовый", style: dottedBgStyle },
            { type: "formula", link: "=HYPERLINK(\"#\'Статистика\'!A1\", \"Статистика\")" },
            { type: "formula", link: "=HYPERLINK(\"#\'Поездки\'!A1\", \"Поездки\")" },
            { type: "formula", link: "=HYPERLINK(\"#\'Остановки (менее 10 минут)\'!A1\", \"Остановки (менее 10 минут)\")" },
            { type: "formula", link: "=HYPERLINK(\"#\'Стоянки (более 10 минут)\'!A1\", \"Стоянки (более 10 минут)\")" }
        ];
        ws.row(1).setHeight(60);
        ws.column(1).setWidth(20);

        reportLinks.forEach(r => {
            let s = ws.cell(row, column);
            if (r.type == 'formula') {
                s.formula(r.link);
            } else if (r.type == 'string') {
                s.string(r.link)
            }
            if (r.style) s.style(r.style);
            row++;
        });

        const metaData = [
            ["Отчет", "_Групповой отчёт - Базовый"],
            ["Группа", ""],
            ["Начало интервала", xlsxData.displayFromDate.format('YYYY-MM-DD HH:mm:ss')],
            ["Окончание интервала", xlsxData.displayToDate.format('YYYY-MM-DD HH:mm:ss')],
        ];
        row = 1;
        column = 1;
        metaSheet.column(column).setWidth(20);
        metaSheet.column(column + 1).setWidth(20);
        metaData.forEach(metaRow => {
            column = 1;
            metaRow.forEach(m => {
                metaSheet.cell(row, column).string(m);
                column++;
            });
            row++;
        });


        let tripsData = xlsxData.processedReportData.tripsData;
        const tripKeys = ["grouping", "startedAt", "startLocation", "endedAt", "endLocation", "duration", "mileage", "avgSpeed", "maxSpeed"];

        const headers = [
            { sheetName: tripSheet, headers: ["Группировка", "Начало", "Нач. положение", "Конец", "Конеч. положение", "Длительность", "Пробег", "Ср. скорость", "Макс. скорость"] },
            { sheetName: stopsSheet, headers: ["Группировка", "Начало", "Конец", "Длительность", "Положение", "Кол-во"] },
            { sheetName: parkingsSheet, headers: ["Группировка", "Начало", "Конец", "Длительность", "Положение", "Кол-во"] }
        ];
        xlsxData.reportData.tripsTotal.shift();
        xlsxData.reportData.stopsTotal.shift();
        xlsxData.reportData.parkingsTotal.shift();
        let tripsTotal = xlsxData.reportData.tripsTotal;
        let stopsTotal = xlsxData.reportData.stopsTotal;
        let parkingsTotal = xlsxData.reportData.parkingsTotal;
        tripsTotal[0] = "Итого";
        stopsTotal[0] = "Итого";
        parkingsTotal[0] = "Итого";

        row = 1;
        column = 1;

        headers.forEach(headerRow => {
            const sheet = headerRow.sheetName;
            row = 1;
            column = 1;
            headerRow.headers.forEach(h => {
                sheet.cell(row, column).string(h).style(darkBgStyle);
                sheet.column(column).setWidth(15);
                column++;
            });

        });

        let dateRow = 1;
        let groupLevel = 2;

        row = 2;
        column = 1;
        tripsData.forEach(unit => {
            this.updateSheet(tripSheet, { rw: unit, keys: tripKeys, r: row, c: column, style: lightBgStyle });
            row++;
            unit.datewiseData.forEach((date, dateIdx) => {
                this.updateSheet(tripSheet, { rw: date, keys: tripKeys, r: row, c: column, style: lightBgStyle });
                tripSheet.row(row).group(dateRow, true);
                row++;
                date.trips.forEach(trip => {
                    this.updateSheet(tripSheet, { rw: trip, keys: tripKeys, r: row, c: column, style: lightBgStyle });
                    tripSheet.row(row).group(groupLevel, true);
                    row++;
                });
                tripSheet.row(row).group(dateRow, true);
                if (unit.datewiseData.length - 1 == dateIdx) row++;
            });
        });
        column = 1;
        tripsTotal.forEach((trip, idx) => {
            tripSheet.cell(row, column).string(trip).style(darkBgStyle);
            column++;
        });


        let stopsData = xlsxData.processedReportData.stopsData;
        let parkingsData = xlsxData.processedReportData.parkingsData;
        const stopAndParkingKeys = ["grouping", "startedAt", "endedAt", "duration", "endLocation", "qty"];

        row = 2;
        column = 1;
        stopsData.forEach(unit => {
            this.updateSheet(stopsSheet, { rw: unit, keys: stopAndParkingKeys, r: row, c: column, style: lightBgStyle });
            row++;
            unit.datewiseData.forEach((date, dateIdx) => {
                this.updateSheet(stopsSheet, { rw: date, keys: stopAndParkingKeys, r: row, c: column, style: lightBgStyle });
                stopsSheet.row(row).group(dateRow, true);
                row++;
                date.stops.forEach(stop => {
                    this.updateSheet(stopsSheet, { rw: stop, keys: stopAndParkingKeys, r: row, c: column, style: lightBgStyle });
                    stopsSheet.row(row).group(groupLevel, true);
                    row++;
                });
                stopsSheet.row(row).group(dateRow, true);
                if (unit.datewiseData.length - 1 == dateIdx) row++;
            });
        });
        column = 1;
        stopsTotal.forEach((stop, idx) => {
            if (idx != stopsTotal.length - 1) {
                stopsSheet.cell(row, column).string(stop).style(darkBgStyle);
            } else {
                stopsSheet.cell(row, column).number(parseInt(stop)).style(darkBgStyle);
            }
            column++;
        });

        row = 2;
        column = 1;
        parkingsData.forEach(unit => {
            this.updateSheet(parkingsSheet, { rw: unit, keys: stopAndParkingKeys, r: row, c: column, style: lightBgStyle });
            row++;
            unit.datewiseData.forEach((date, dateIdx) => {
                this.updateSheet(parkingsSheet, { rw: date, keys: stopAndParkingKeys, r: row, c: column, style: lightBgStyle });
                parkingsSheet.row(row).group(dateRow, true);
                row++;
                date.parkings.forEach(parking => {
                    this.updateSheet(parkingsSheet, { rw: parking, keys: stopAndParkingKeys, r: row, c: column, style: lightBgStyle });
                    parkingsSheet.row(row).group(groupLevel, true);
                    row++;
                });
                parkingsSheet.row(row).group(dateRow, true);
                if (unit.datewiseData.length - 1 == dateIdx) row++;
            });
        });
        column = 1;
        parkingsTotal.forEach((parking, idx) => {
            if (idx != parkingsTotal.length - 1) {
                parkingsSheet.cell(row, column).string(parking).style(darkBgStyle);
            } else {
                parkingsSheet.cell(row, column).number(parseInt(parking)).style(darkBgStyle);
            }
            column++;
        });

    }
}

module.exports = Report;