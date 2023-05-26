import xlsx from "excel4node";
import FileProvider from "@lib/fileprovider";
import moment from "moment";

// input data format
// {
//   wbName: "report.xlsx",
//   meta: {},
//   lists: [
//     {
//       title: "List 1",
//       headers: [
//         {
//           text: "1 column name",
//           width: 50
//         },
//         {
//           text: "2 column name",
//           width: 50
//         }
//       ],
//       data: [[1, "352094082090793"], [2, "352094082090793"]]
//     }
//   ]
// }

async function generateXlsx(xlsxData) {
  return new Promise(async (resolve, reject) => {
    let wb = new xlsx.Workbook();

    let styles = {
      boldText: wb.createStyle({
        font: {
          size: 12,
          bold: true
        }
      }),
      plainText: wb.createStyle({
        font: {
          size: 12
        }
      }),
      groupName: wb.createStyle({
        font: {
          size: 12,
          bold: true
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#b8bab8",
          fgColor: "#b8bab8"
        }
      }),
      headersCell2: wb.createStyle({
        font: {
          size: 12,
          bold: true
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#b8bab8",
          fgColor: "#b8bab8"
        },
        border: {
          bottom: {
            style: "thin",
            color: "#000000"
          }
        }
      }),
      headers: wb.createStyle({
        font: {
          size: 12,
          bold: true
        },
        alignment: {
          horizontal: "center"
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#b8bab8",
          fgColor: "#b8bab8"
        },
        border: {
          bottom: {
            style: "thin",
            color: "#000000"
          }
        }
      }),
      cellContent: wb.createStyle({
        font: {
          size: 12
        },
        alignment: {
          horizontal: "center"
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
      }),
      cellContent2nd: wb.createStyle({
        font: {
          size: 12
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

    for (const list of xlsxData.lists) {
      let ws = wb.addWorksheet(list.title);
      let style = styles.boldText;
      let row = 1;
      let column = 1;

      ws.cell(row, column)
        .string(
          "Дата создания отчёта: " + moment(new Date()).format("DD.MM.YYYY")
        )
        .style(style);

      style = styles.plainText;
      style = styles.headers;
      row = row + 3;

      // Headers
      list.headers.forEach(csvColumn => {
        ws.column(column).setWidth(csvColumn.width);
        if (column == 2) {
          style = styles.headersCell2;
        } else {
          style = styles.headers;
        }
        ws.cell(row, column)
          .string(csvColumn.text.toString())
          .style(style);
        column++;
      });

      row++;

      // Body data
      list.data.forEach(csvRow => {
        column = 1; // reset column from 1 for next row
        if (isArray(csvRow)) {
          csvRow.forEach(rowData => {
            if (column == 2) {
              style = styles.cellContent2nd;
              ws.cell(row, column)
                .string(rowData.toString())
                .style(style);
            } else {
              style = styles.cellContent;
              ws.cell(row, column)
                .string(rowData.toString())
                .style(style);
            }
            column++;
          });
        } else {
          style = styles.groupName;
          row++;
          column++;
          ws.cell(row, column)
            .string(csvRow.toString())
            .style(style);
        }
        row++;
      });
    }

    let b64 = null;
    let buffer = await wb.writeToBuffer();
    b64 = buffer.toString("base64");
    b64 =
      "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
      b64;

    let result = await FileProvider.push({
      name: xlsxData.wbName,
      data: b64
    });
    resolve(result);
  });
}

function isArray(obj) {
  return !!obj && obj.constructor === Array;
}

export default {
  generateXlsx
};
