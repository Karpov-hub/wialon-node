const Base = require("../lib/base");

const h_t = {
  connected: {
    en: "Created in software",
    ru: "Создан в ПО"
  },
  not_connected: {
    en: "---",
    ru: "---"
  },
  sensors_list_name: {
    en: "Sensors status",
    ru: "Статус датчиков"
  },
  total_sensors: {
    en: "Total sensors",
    ru: "Общее количество датчиков"
  },
  total_units: {
    en: "Total units",
    ru: "Общее количество объектов"
  },
  units_without_group: {
    en: "Unit without group",
    ru: "Объекты вне групп"
  },
  name: {
    en: "Name",
    ru: "Наименование"
  }
};
let lang = "en";
class Report extends Base {
  getFileName() {
    return `Generic_report_${Date.now()}.xlsx`;
  }

  async getData(params) {
    if (params.lang) {
      lang = params.lang.toLowerCase();
    }
    var vehicles = await this.getAllUnits();
    if (!vehicles)
      return {
        error: 0,
        message: "No units founds."
      };

    var groups = await this.getAllUnitGroups();
    if (!groups)
      return {
        error: 0,
        message: "Error getting groups."
      };

    var xlsxData = await this.generateXlsxData(vehicles, groups);
    xlsxData.totalUnits = vehicles.length;

    return xlsxData;
  }

  async generateXlsxData(vehicles, groups) {
    var orphan = [];
    // merge data of units into unit groups on the basis of unitIds
    // add as orphan if a unit does not exist in any group
    vehicles.forEach((vehicle) => {
      var found = false;
      groups.forEach((grp, key) => {
        if (!grp["vehicles"]) {
          grp["vehicles"] = [];
        }

        for (let i = 0; i < grp["u"].length; i++) {
          var unitId = grp["u"][i];
          if (unitId == vehicle["id"]) {
            // if id matches add the data of unit into array of unit groups (groups)
            grp["vehicles"].push(vehicle);
            found = true;
            break;
          }
        }
        groups[key] = grp;
      });
      if (!found) {
        orphan.push(vehicle);
      }
    });

    var orphanData = {
      nm: h_t.units_without_group[lang],
      u: [],
      id: 0,
      vehicles: orphan
    };

    groups.push(orphanData);

    var csv = [];
    var csvHeader = {
      Blank: ""
    };

    var csvHeadersSorted = [];

    groups.forEach((grp) => {
      csv.push({
        Name: grp["nm"],
        Id: -1
      });
      grp["vehicles"].forEach((vehicle, key) => {
        var row = {
          Name: vehicle["nm"],
          Id: vehicle["id"]
        };
        if (vehicle["sens"] && Object.keys(vehicle["sens"]).length > 0) {
          // get all sensor names and set their values
          Object.keys(vehicle["sens"]).forEach((sensor) => {
            var sensorData = vehicle["sens"][sensor];
            row[sensorData["n"]] = h_t.connected[lang];
            csvHeader[sensorData["n"]] = h_t.not_connected[lang];
            if (!csvHeadersSorted.includes(sensorData["n"]))
              csvHeadersSorted.push(sensorData["n"]);
          });
        }
        csv.push(row);
      });
    });
    var csvData = [];
    csvHeadersSorted.sort();

    var index = 0;
    csv.forEach((csvRow) => {
      // var currentRow = [csvRow.Name];
      var currentRow = {
        isGroup: false,
        value: []
      };
      if (csvRow.Id != -1) {
        currentRow.value.push(++index);
        currentRow.value.push(csvRow.Name);
        currentRow.value.push("");
        csvHeadersSorted.forEach((chs) => {
          if (csvRow[chs]) currentRow.value.push(h_t.connected[lang]);
          else currentRow.value.push(h_t.not_connected[lang]);
        });
      } else {
        currentRow.isGroup = true;
        currentRow.value = ["", csvRow.Name];
      }
      csvData.push(currentRow);
    });

    var totalSensors = csvHeadersSorted.length;
    csvHeadersSorted = [...["№", h_t.name[lang], ""], ...csvHeadersSorted];

    return {
      csvData,
      csvHeadersSorted,
      totalSensors
    };
  }

  async getAllUnitGroups() {
    var params = {
      spec: {
        itemsType: "avl_unit_group",
        propName: "sys_name",
        propValueMask: "*",
        sortType: "sys_name"
      },
      force: 0,
      flags: 1,
      from: 0,
      to: 0
    };
    let unitsData = await this.callService("core/search_items", params);
    return unitsData.items;
  }

  async getAllUnits() {
    var params = {
      spec: {
        itemsType: "avl_unit",
        propName: "sys_name",
        propValueMask: "*",
        sortType: "sys_name"
      },
      force: 0,
      flags: 4097,
      from: 0,
      to: 0
    };
    let unitsData = await this.callService("core/search_items", params);
    return unitsData.items;
  }
  make(xlsxData) {
    const ws = this.addWorksheet(h_t.sensors_list_name[lang]);

    var styles = {
      plainText: this.wb.createStyle({
        font: {
          size: 12
        },
        alignment: {
          horizontal: ["center"]
        }
      }),
      groupName: this.wb.createStyle({
        font: {
          size: 12
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#b7acac",
          fgColor: "#b7acac"
        },
        border: {
          left: {
            style: "medium",
            color: "#000000"
          },
          right: {
            style: "medium",
            color: "#000000"
          },
          top: {
            style: "medium",
            color: "#000000"
          },
          bottom: {
            style: "medium",
            color: "#000000"
          }
        }
      }),
      headers: this.wb.createStyle({
        font: {
          size: 12
        }
      }),
      cellContent: this.wb.createStyle({
        font: {
          size: 12
        },
        alignment: {
          wrapText: true,
          indent: 3
        },
        border: {
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
      })
    };

    var style = styles.headers;

    var column = 1;
    xlsxData.csvHeadersSorted.forEach((chs) => {
      ws.column(column).setWidth(17);
      ws.cell(1, column)
        .string(chs.toString())
        .style(style);
      column++;
    });
    ws.column(2).setWidth(32);
    ws.column(1).setWidth(5);
    ws.column(3).setWidth(5);
    ws.column(2).freeze();
    ws.row(1).freeze();

    var row = 2;
    column = 1;

    xlsxData.csvData.forEach((csvRow) => {
      if (csvRow.isGroup) {
        row++;
      }
      column = 1; // reset column from 1 for next row
      csvRow.value.forEach((rowData) => {
        style = styles.plainText;

        if (csvRow.isGroup && rowData > "") {
          style = styles.groupName;
        } else if (!csvRow.isGroup && column == 2) style = styles.cellContent;
        ws.cell(row, column)
          .string(rowData.toString())
          .style(style);
        column++;
      });
      row++;
    });

    style = styles.cellContent;

    // setting total info
    row += 2;
    ws.cell(row, 2)
      .string(h_t.total_units[lang])
      .style(style);
    ws.cell(row, 3)
      .number(xlsxData.totalUnits)
      .style(style);
    row++;
    ws.cell(row, 2)
      .string(h_t.total_sensors[lang])
      .style(style);
    ws.cell(row, 3)
      .number(xlsxData.totalSensors)
      .style(style);

    ws.row(1).filter({
      firstRow: 1,
      firstColumn: 1,
      lastRow: row,
      lastColumn: xlsxData.csvHeadersSorted.length
    });
  }
}

module.exports = Report;
