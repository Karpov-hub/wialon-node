import db from "@lib/db";
import xlsx from "excel4node";
import FileProvider from "@lib/fileprovider";
import { CONSTANTS } from "./Global";
import { STRINGS } from "./Strings";
import { findUserRoleAndCheckAccess } from "@lib/utils";
import moment from "moment";

async function getUsageReport(data, realmId, userId) {
  const { user } = await findUserRoleAndCheckAccess(userId);

  const invoice = await db.invoice.findByPk(data.invoiceId, {
    raw: true,
    attributes: ["from_date", "to_date"]
  });

  if (!invoice) {
    throw "RECORDNOTFOUND";
  }

  await db.usage_report.belongsTo(db.rates_package, {
    targetKey: "id",
    foreignKey: "rates_package_id"
  });
  let { count, rows } = await db.usage_report
    .findAndCountAll({
      attributes: [
        "date",
        "cpu_time_taken",
        "bytes_from_wialon",
        "bytes_sent",
        "downloads_click",
        "generate_reports_click",
        "mob_cpu_time",
        "mob_bytes_sent",
        "mob_bytes_from_wialon"
      ],
      where: {
        organization_id: user.organization_id,
        [db.Sequelize.Op.and]: [
          { date: { [db.Sequelize.Op.gte]: invoice.from_date } },
          { date: { [db.Sequelize.Op.lte]: invoice.to_date } }
        ]
      },
      include: [
        {
          model: db.rates_package,
          attributes: [
            "cpu_time_taken",
            "bytes_from_wialon",
            "bytes_sent",
            "downloads_click",
            "generate_reports_click",
            "mob_cpu_time",
            "mob_bytes_sent",
            "mob_bytes_from_wialon"
          ]
        }
      ],
      order: [["date", "asc"]]
    })
    .catch((e) => {
      console.log(
        "auth-service, getUsageReport, error on getting data from usage_report error: ",
        e
      );
      throw "SEARCHINGERROR";
    });
  let organisationDetail = await db.organization.findByPk(
    user.organization_id,
    { attributes: ["organization_name"], raw: true }
  );
  let list = [];
  let organisation_name = organisationDetail.organization_name;
  let total_amount = 0;

  for (const item of rows) {
    let item_amount = (
      item.cpu_time_taken * item.rates_package.cpu_time_taken +
      item.bytes_from_wialon * item.rates_package.bytes_from_wialon +
      item.generate_reports_click * item.rates_package.generate_reports_click +
      item.mob_cpu_time * item.rates_package.mob_cpu_time +
      item.mob_bytes_sent * item.rates_package.mob_bytes_sent +
      item.mob_bytes_from_wialon * item.rates_package.mob_bytes_from_wialon +
      item.downloads_click * item.rates_package.downloads_click +
      item.bytes_sent * item.rates_package.bytes_sent
    ).toFixed(2);

    total_amount = total_amount + parseFloat(item_amount);

    list.push({
      date: moment(item.date).format("DD.MM.YYYY"),
      cpu_time_taken: {
        quantity: item.cpu_time_taken.toFixed(2),
        rate: item.rates_package.cpu_time_taken.toString(),
        amount: (
          item.cpu_time_taken.toFixed(2) * item.rates_package.cpu_time_taken
        ).toFixed(2)
      },
      bytes_from_wialon: {
        quantity: item.bytes_from_wialon.toString(),
        rate: item.rates_package.bytes_from_wialon.toString(),
        amount: (
          item.bytes_from_wialon * item.rates_package.bytes_from_wialon
        ).toFixed(2)
      },
      bytes_download: {
        quantity: item.bytes_sent.toString(),
        rate: item.rates_package.bytes_sent.toString(),
        amount: (item.bytes_sent * item.rates_package.bytes_sent).toFixed(2)
      },
      mob_cpu_time: {
        quantity: item.mob_cpu_time.toFixed(6),
        rate: item.rates_package.mob_cpu_time.toString(),
        amount: (
          item.mob_cpu_time.toFixed(6) * item.rates_package.mob_cpu_time
        ).toFixed(2)
      },
      mob_bytes_sent: {
        quantity: item.mob_bytes_sent.toString(),
        rate: item.rates_package.mob_bytes_sent.toString(),
        amount: (
          item.mob_bytes_sent * item.rates_package.mob_bytes_sent
        ).toFixed(2)
      },
      mob_bytes_from_wialon: {
        quantity: item.mob_bytes_from_wialon.toString(),
        rate: item.rates_package.mob_bytes_from_wialon.toString(),
        amount: (
          item.mob_bytes_from_wialon * item.rates_package.mob_bytes_from_wialon
        ).toFixed(2)
      },
      downloads_click: {
        quantity: item.downloads_click.toString(),
        rate: item.rates_package.downloads_click.toString(),
        amount: (
          item.downloads_click * item.rates_package.downloads_click
        ).toFixed(2)
      },
      generate_reports_click: {
        quantity: item.generate_reports_click.toString(),
        rate: item.rates_package.generate_reports_click.toString(),
        amount: (
          item.generate_reports_click *
          item.rates_package.generate_reports_click
        ).toFixed(2)
      },
      total_amount: item_amount
    });
  }

  return {
    success: true,
    res: {
      from_date: moment(invoice.from_date).format("DD.MM.YYYY"),
      to_date: moment(invoice.to_date).format("DD.MM.YYYY"),
      total_amount: total_amount.toFixed(2),
      organisation_name: organisation_name,
      list: list
    },
    count
  };
}

async function downloadUsageReport(data, realmId, userId) {
  try {
    let res = await getUsageReport(data, realmId, userId);
    let lang = data.lang;
    //STRINGS.resource[lang]
    let headers = [
      STRINGS.date[lang],
      STRINGS.cpu_time_for_reports[lang],
      STRINGS.bytes_from_wialon[lang],
      STRINGS.bytes_downloaded[lang],
      STRINGS.mobile_cpu_time[lang],
      STRINGS.mobile_bytes_from_wialon[lang],
      STRINGS.mobile_bytes_downloaded[lang],
      STRINGS.downloaded_reports[lang],
      STRINGS.generated_reports[lang],
      STRINGS.total_amount[lang]
    ];
    let subHeaders = [
      STRINGS.quantity[lang],
      STRINGS.rate[lang],
      STRINGS.amount[lang],
      STRINGS.quantity[lang],
      STRINGS.rate[lang],
      STRINGS.amount[lang],
      STRINGS.quantity[lang],
      STRINGS.rate[lang],
      STRINGS.amount[lang],
      STRINGS.quantity[lang],
      STRINGS.rate[lang],
      STRINGS.amount[lang],
      STRINGS.quantity[lang],
      STRINGS.rate[lang],
      STRINGS.amount[lang],
      STRINGS.quantity[lang],
      STRINGS.rate[lang],
      STRINGS.amount[lang],
      STRINGS.quantity[lang],
      STRINGS.rate[lang],
      STRINGS.amount[lang],
      STRINGS.quantity[lang],
      STRINGS.rate[lang],
      STRINGS.amount[lang]
    ];
    let xlsxData = await generateXlsxData(res.res, headers, subHeaders);
    let xlsx = await generateXlsx(xlsxData, lang);

    return {
      success: true,
      res: {
        downloadUrl:
          CONSTANTS.DOWNLOAD_DOMAIN + CONSTANTS.REPORT_DOWLOAD_PATH + xlsx.code
      }
    };
  } catch (e) {
    console.log("auth-service, downloadUsageReport, error: ", e);
    throw e;
  }
}

async function generateXlsx(xlsxData, lang) {
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
          size: 12
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#b7acac",
          fgColor: "#b7acac"
        }
      }),
      boldTextTitle: wb.createStyle({
        font: {
          size: 12,
          bold: true
        },
        alignment: {
          horizontal: "center"
        }
      }),
      boldTextTitle2: wb.createStyle({
        font: {
          size: 10,
          bold: true
        },
        alignment: {
          horizontal: "right"
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
      headers: wb.createStyle({
        font: {
          size: 11,
          bold: true
        },
        fill: {
          type: "pattern",
          patternType: "solid",
          bgColor: "#b8bab8",
          fgColor: "#b8bab8"
        },
        alignment: {
          horizontal: "center"
        },
        border: {
          bottom: {
            style: "thin",
            color: "#000000"
          },
          left: {
            style: "thin",
            color: "#000000"
          },
          right: {
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
          horizontal: "right"
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

    let ws = wb.addWorksheet("Sheet 1");
    let style = styles.boldText;
    let row = 1;
    let column = 1;

    ws.cell(row, column)
      .string(STRINGS.usage_report[lang])
      .style(style);
    row++;

    ws.cell(++row, column)
      .string(`${STRINGS.from_date[lang]}: ` + xlsxData.from_date)
      .style(style);
    ws.cell(row, column + 4)
      .string(`${STRINGS.organization[lang]}: ` + xlsxData.title)
      .style(style);

    ws.cell(++row, column)
      .string(`${STRINGS.to_date[lang]}: ` + xlsxData.to_date)
      .style(style);
    ws.cell(row, column + 4)
      .string(`${STRINGS.total_amount[lang]}: ` + xlsxData.total_amount)
      .style(style);

    style = styles.headers;
    row = row + 2;

    xlsxData.csvHeaders.forEach((chs) => {
      ws.column(column).setWidth(13);
      let column2 = column;
      if (column > 1 && column < 24) {
        column2 = column + 2;
      }
      ws.cell(row, column, row, column2, true)
        .string(chs.toString())
        .style(style);

      if (column > 1 && column < 26) {
        column = column + 3;
      } else {
        column = column + 1;
      }
    });

    column = 2;
    row++;
    style = styles.boldTextTitle2;
    xlsxData.subHeaders.forEach((chs) => {
      ws.column(column).setWidth(10);
      ws.cell(row, column)
        .string(chs.toString())
        .style(style);
      column++;
    });

    column = 1;
    row++;
    xlsxData.csv.forEach((csvRow) => {
      column = 1;

      csvRow.forEach((rowData) => {
        if (typeof rowData === "object") rowData = JSON.stringify(rowData);
        style = styles.cellContent;
        ws.cell(row, column)
          .string(rowData != null ? rowData.toString() : "")
          .style(style);
        column++;
      });

      row++;
    });

    ws.row(7).freeze();

    let b64 = null;
    let buffer = await wb.writeToBuffer();
    b64 = buffer.toString("base64");
    b64 =
      "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
      b64;

    let result = await FileProvider.push({
      name: "usagereport.xlsx",
      data: b64
    });
    resolve(result);
  });
}

function generateXlsxData(res, headers, subHeaders) {
  return new Promise((resolve, reject) => {
    let xlsxData = {};
    xlsxData.csvHeaders = [];
    xlsxData.subHeaders = [];
    xlsxData.csv = [];
    xlsxData.title = res.organisation_name;
    xlsxData.total_amount = res.total_amount;
    xlsxData.from_date = res.from_date;
    xlsxData.to_date = res.to_date;

    let data = res.list;
    data.forEach((row) => {
      let csvData = [];
      Object.keys(row).forEach((key) => {
        if (typeof row[key] === "object") {
          Object.keys(row[key]).forEach((key2) => {
            csvData.push(row[key][key2]);
          });
        } else {
          csvData.push(row[key]);
        }
      });

      xlsxData.csv.push(csvData);
    });

    xlsxData.csvHeaders = headers;
    xlsxData.subHeaders = subHeaders;

    resolve(xlsxData);
  });
}

export default {
  getUsageReport,
  downloadUsageReport
};
