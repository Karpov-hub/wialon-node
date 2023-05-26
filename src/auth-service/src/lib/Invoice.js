import db from "@lib/db";
import xlsx from "excel4node";
import FileProvider from "@lib/fileprovider";
import { CONSTANTS } from "./Global";
import { STRINGS } from "./Strings";
import moment from "moment";
import { toUnderScore, findUserRoleAndCheckAccess } from "@lib/utils";

async function getInvoices(data, realmId, userId) {
  data.year = String(data.year);

  const { user } = await findUserRoleAndCheckAccess(userId);

  const list = await db.sequelize
    .query(
      'SELECT "id", "invoice_date", "total_fees" FROM  "invoices" WHERE extract (YEAR from "invoice_date") = :year and "organization_id" = :org_id LIMIT :limit OFFSET :offset',
      {
        replacements: {
          year: data.year,
          org_id: user.organization_id,
          limit: data.limit,
          offset: data.start
        },
        type: db.sequelize.QueryTypes.SELECT
      }
    )
    .catch((e) => {
      console.log(
        "auth-service, getInvoices, error while generating SQL request: ",
        e
      );
      throw "SEARCHINGERROR";
    });

  return { success: true, list: list, count: list.length };
}

async function getInvoiceDetails(data, realmId, userId) {
  await findUserRoleAndCheckAccess(userId);

  let lang = data.lang;

  await db.invoice.belongsTo(db.organization, {
    targetKey: "id",
    foreignKey: "organization_id"
  });
  await db.invoice.belongsTo(db.tax_information, {
    targetKey: "id",
    foreignKey: "tax_id"
  });

  let invoice = await db.invoice
    .findOne({
      where: { id: data.invoiceId },
      include: [
        { model: db.tax_information, attributes: ["percentage"] },
        { model: db.organization, attributes: ["organization_name"] }
      ]
    })
    .catch((e) => {
      console.log(
        "auth-service, getInvoiceDetails, error on getting data from invoice error: ",
        e
      );
      throw "SEARCHINGERROR";
    });

  if (!invoice) {
    throw "RECORDNOTFOUND";
  }

  await db.package_subscription.belongsTo(db.rates_package, {
    targetKey: "id",
    foreignKey: "rates_package_id"
  });

  //retrive current packages
  const packages = await db.package_subscription
    .findAll({
      attributes: ["from_date", "to_date"],
      where: {
        organization_id: invoice.dataValues.organization_id,
        [db.Sequelize.Op.or]: [
          { to_date: { [db.Sequelize.Op.gte]: invoice.dataValues.from_date } },
          {
            [db.Sequelize.Op.and]: [
              {
                from_date: { [db.Sequelize.Op.lte]: invoice.dataValues.to_date }
              },
              { to_date: { [db.Sequelize.Op.eq]: null } }
            ]
          }
        ]
      },
      include: [
        {
          model: db.rates_package,
          attributes: [
            "id",
            "fixed_monthly_fees",
            "bytes_sent",
            "cpu_time_taken",
            "bytes_from_wialon",
            "no_of_employees",
            "no_of_wialon_acc",
            "downloads_click",
            "generate_reports_click",
            "mob_cpu_time",
            "mob_bytes_sent",
            "mob_bytes_from_wialon",
            "mob_active_users"
          ]
        }
      ],
      order: [["from_date", "desc"]]
    })
    .catch((e) => {
      console.log(
        "auth-service, getInvoiceDetails, error on getting data from package_subscription error: ",
        e
      );
      throw "SEARCHINGERROR";
    });

  const usageReports = await db.usage_report
    .findAll({
      attributes: [
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("cpu_time_taken")),
            0
          ),
          "cpu_time_taken"
        ],
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("bytes_sent")),
            0
          ),
          "bytes_sent"
        ],
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("bytes_from_wialon")),
            0
          ),
          "bytes_from_wialon"
        ],
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("mob_cpu_time")),
            0
          ),
          "mob_cpu_time"
        ],
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("mob_bytes_sent")),
            0
          ),
          "mob_bytes_sent"
        ],
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("mob_bytes_from_wialon")),
            0
          ),
          "mob_bytes_from_wialon"
        ],
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("downloads_click")),
            0
          ),
          "downloads_click"
        ],
        [
          db.sequelize.fn(
            "COALESCE",
            db.sequelize.fn("SUM", db.sequelize.col("generate_reports_click")),
            0
          ),
          "generate_reports_click"
        ],
        "rates_package_id"
      ],
      where: {
        organization_id: invoice.organization_id,
        [db.Sequelize.Op.and]: [
          { date: { [db.Sequelize.Op.gte]: invoice.from_date } },
          { date: { [db.Sequelize.Op.lte]: invoice.to_date } }
        ]
      },
      raw: true,
      group: ["organization_id", "rates_package_id"]
    })
    .catch((e) => {
      console.log(
        "auth-service, getInvoiceDetails, error on getting data from usage_report error: ",
        e
      );
      throw "SEARCHINGERROR";
    });

  let cpu_time_taken = 0;
  let bytes_from_wialon = 0;
  let bytes_sent = 0;
  let mob_cpu_time = 0;
  let mob_bytes_sent = 0;
  let mob_bytes_from_wialon = 0;
  let downloads_click = 0;
  let generate_reports_click = 0;

  let cpu_time_taken_amount = 0;
  let bytes_from_wialon_amount = 0;
  let bytes_sent_amount = 0;
  let mob_cpu_time_amount = 0;
  let mob_bytes_sent_amount = 0;
  let mob_bytes_from_wialon_amount = 0;
  let downloads_click_amount = 0;
  let generate_reports_click_amount = 0;

  for (const usageReport of usageReports) {
    const currentPkg = await db.rates_package.findByPk(
      usageReport.rates_package_id,
      {
        raw: true
      }
    );
    cpu_time_taken = parseFloat(usageReport.cpu_time_taken) + cpu_time_taken;
    bytes_from_wialon =
      parseFloat(usageReport.bytes_from_wialon) + bytes_from_wialon;
    bytes_sent = parseFloat(usageReport.bytes_sent) + bytes_sent;
    mob_cpu_time = parseFloat(usageReport.mob_cpu_time) + mob_cpu_time;
    mob_bytes_sent = parseFloat(usageReport.mob_bytes_sent) + mob_bytes_sent;
    mob_bytes_from_wialon =
      parseFloat(usageReport.mob_bytes_from_wialon) + mob_bytes_from_wialon;
    downloads_click = parseFloat(usageReport.downloads_click) + downloads_click;
    generate_reports_click =
      parseFloat(usageReport.generate_reports_click) + generate_reports_click;

    cpu_time_taken_amount =
      parseFloat(usageReport.cpu_time_taken * currentPkg.cpu_time_taken) +
      cpu_time_taken_amount;
    bytes_from_wialon_amount =
      parseFloat(usageReport.bytes_from_wialon * currentPkg.bytes_from_wialon) +
      bytes_from_wialon_amount;
    bytes_sent_amount =
      parseFloat(usageReport.bytes_sent * currentPkg.bytes_sent) +
      bytes_sent_amount;
    mob_cpu_time_amount =
      parseFloat(usageReport.mob_bytes_sent * currentPkg.mob_bytes_sent) +
      mob_cpu_time_amount;
    mob_bytes_sent_amount =
      parseFloat(usageReport.mob_bytes_sent * currentPkg.mob_bytes_sent) +
      mob_bytes_sent_amount;
    mob_bytes_from_wialon_amount =
      parseFloat(
        usageReport.mob_bytes_from_wialon * currentPkg.mob_bytes_from_wialon
      ) + mob_bytes_from_wialon_amount;
    downloads_click_amount =
      parseFloat(usageReport.downloads_click * currentPkg.downloads_click) +
      downloads_click_amount;
    generate_reports_click_amount =
      parseFloat(
        usageReport.generate_reports_click * currentPkg.generate_reports_click
      ) + generate_reports_click_amount;
  }
  let invoiceDetail = {
    packages: packages,
    organization_name: invoice.dataValues.organization.organization_name,
    tax_percentage: invoice.dataValues.tax_information.percentage + "%",
    from_date: invoice.dataValues.from_date,
    to_date: invoice.dataValues.to_date,
    invoice_date: invoice.dataValues.invoice_date,
    total_amount: invoice.dataValues.total_fees,
    adjustment: invoice.dataValues.adjustment,
    plugins_fees_amount: invoice.dataValues.plugins_fees_amount,
    resources: [
      {
        key: "fixed_monthly_fees",
        title: STRINGS.fixed_monthly_fees[lang],
        quantity: 1,
        amount: packages[0].dataValues.rates_package.fixed_monthly_fees
      },
      {
        key: "cpu_time_for_reports",
        title: STRINGS.cpu_time_for_reports[lang],
        quantity: cpu_time_taken.toFixed(2),
        amount: cpu_time_taken_amount.toFixed(2)
      },
      {
        key: "bytes_from_wialon",
        title: STRINGS.bytes_from_wialon[lang],
        quantity: bytes_from_wialon,
        amount: bytes_from_wialon_amount.toFixed(2)
      },
      {
        key: "bytes_downloaded",
        title: STRINGS.bytes_downloaded[lang],
        quantity: bytes_sent,
        amount: bytes_sent_amount.toFixed(2)
      },
      {
        key: "employees",
        title: STRINGS.employees[lang],
        quantity: invoice.dataValues.no_of_employees,
        amount: (
          invoice.dataValues.no_of_employees *
          packages[0].dataValues.rates_package.no_of_employees
        ).toFixed(2)
      },
      {
        key: "mobile_cpu_time",
        title: STRINGS.mobile_cpu_time[lang],
        quantity: mob_cpu_time.toFixed(6),
        amount: mob_cpu_time_amount.toFixed(6)
      },
      {
        key: "mobile_bytes_from_wialon",
        title: STRINGS.mobile_bytes_from_wialon[lang],
        quantity: mob_bytes_from_wialon,
        amount: mob_bytes_from_wialon_amount.toFixed(2)
      },
      {
        key: "mobile_bytes_downloaded",
        title: STRINGS.mobile_bytes_downloaded[lang],
        quantity: mob_bytes_sent,
        amount: mob_bytes_sent_amount.toFixed(2)
      },
      {
        key: "mobile_active_users",
        title: STRINGS.mobile_active_users[lang],
        quantity: invoice.dataValues.mob_active_users,
        amount: (
          invoice.dataValues.mob_active_users *
          packages[0].dataValues.rates_package.mob_active_users
        ).toFixed(2)
      },
      {
        key: "wialon_accounts",
        title: STRINGS.wialon_accounts[lang],
        quantity: invoice.dataValues.no_of_wialon_acc,
        amount: (
          invoice.dataValues.no_of_wialon_acc *
          packages[0].dataValues.rates_package.no_of_wialon_acc
        ).toFixed(2)
      },
      {
        key: "downloaded_reports",
        title: STRINGS.downloaded_reports[lang],
        quantity: downloads_click,
        amount: downloads_click_amount.toFixed(2)
      },
      {
        key: "generated_reports",
        title: STRINGS.generated_reports[lang],
        quantity: generate_reports_click,
        amount: generate_reports_click_amount.toFixed(2)
      }
    ]
  };
  const pluginFeesArray = JSON.parse(invoice.dataValues.plugins_fees);
  if (pluginFeesArray && pluginFeesArray.length) {
    pluginFeesArray.map((plugin) => {
      invoiceDetail.resources.push({
        key: "fixed_monthly_plugin_fees_" + toUnderScore(plugin.name),
        title: STRINGS.fees_plugin[lang] + plugin.name,
        quantity: 1,
        amount: plugin.fee
      });
    });
  }

  return { success: true, invoice: invoiceDetail };
}

async function downloadInvoice(data, realmId, userId) {
  try {
    let res = await getInvoiceDetails(data, realmId, userId);
    let xlsx = await generateXlsx(res.invoice, data.lang);

    return {
      success: true,
      res: {
        downloadUrl:
          CONSTANTS.DOWNLOAD_DOMAIN + CONSTANTS.REPORT_DOWLOAD_PATH + xlsx.code
      }
    };
  } catch (e) {
    console.log("auth-service, downloadInvoice, error: ", e);
    throw e;
  }
}

async function generateXlsx(invoiceData, lang) {
  return new Promise(async (resolve, reject) => {
    let wb = new xlsx.Workbook();
    let styles = {
      boldText: wb.createStyle({
        font: {
          size: 12,
          bold: true
        }
      }),
      boldTextRight: wb.createStyle({
        font: {
          size: 11,
          bold: true
        },
        alignment: {
          horizontal: "right"
        }
      }),
      packageTitle: wb.createStyle({
        font: {
          size: 10,
          bold: true
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
      packageContent: wb.createStyle({
        font: {
          size: 9
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
          horizontal: "right"
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
          size: 11
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
      .string(STRINGS.invoice[lang])
      .style(style);
    row++;

    ws.cell(++row, column)
      .string(
        `${STRINGS.from_date[lang]}: ` +
          moment(invoiceData.from_date).format("DD.MM.YYYY")
      )
      .style(style);
    ws.cell(row, column + 2)
      .string(`${STRINGS.organization[lang]}: ` + invoiceData.organization_name)
      .style(style);
    ws.cell(++row, column)
      .string(
        `${STRINGS.to_date[lang]}: ` +
          moment(invoiceData.to_date).format("DD.MM.YYYY")
      )
      .style(style);
    ws.cell(row, column + 2)
      .string(
        `${STRINGS.invoice_date[lang]}: ` +
          moment(invoiceData.invoice_date).format("DD.MM.YYYY")
      )
      .style(style);
    style = styles.headers;
    row = row + 3;

    let xlsxData = {};
    xlsxData.csvHeaders = [
      STRINGS.resource_description[lang],
      STRINGS.quantity[lang],
      STRINGS.amount[lang]
    ];
    xlsxData.csvHeaders.forEach((chs) => {
      if (column == 1) ws.column(column).setWidth(26);
      else ws.column(column).setWidth(16);
      ws.cell(row, column)
        .string(chs.toString())
        .style(style);
      column++;
    });

    style = styles.cellContent;
    let resources = invoiceData.resources;
    for (let i = 0; i < resources.length; i++) {
      column = 1;
      row++;
      const obj = resources[i];
      ws.cell(row, column++)
        .string(obj["title"].toString())
        .style(style);
      ws.cell(row, column++)
        .string(obj["quantity"].toString())
        .style(style);
      ws.cell(row, column++)
        .string(obj["amount"].toString())
        .style(style);
    }

    ws.cell(++row, 2)
      .string(`${STRINGS.tax[lang]}: `)
      .style(styles.boldTextRight);
    ws.cell(row, 3)
      .string(invoiceData.tax_percentage.toString())
      .style(styles.cellContent);
    ws.cell(++row, 2)
      .string(`${STRINGS.adjustment[lang]}: `)
      .style(styles.boldTextRight);
    ws.cell(row, 3)
      .string(invoiceData.adjustment.toString())
      .style(styles.cellContent);

    ws.cell(++row, 2)
      .string(`${STRINGS.total_amount[lang]}: `)
      .style(styles.boldTextRight);
    ws.cell(row, 3)
      .string(invoiceData.total_amount.toString())
      .style(styles.cellContent);
    row = 7;
    column = 5;
    let packages = invoiceData.packages;
    ws.column(column).setWidth(20);
    ws.column(column + 1).setWidth(9);
    for (let i = 0; i < packages.length; i++) {
      const obj = packages[i]["dataValues"];

      let toDate = obj["to_date"];
      let fromDate = moment(obj["from_date"]).format("DD.MM.YYYY");

      if (toDate) {
        toDate = ` ${STRINGS.to[lang]} ` + moment(toDate).format("DD.MM.YYYY");
      } else {
        toDate = ` ${STRINGS.till_now[lang]}`;
      }

      ws.cell(row, column, row, column + 1, true)
        .string(`${STRINGS.package[lang]} ` + (i + 1))
        .style(styles.packageTitle);
      ws.cell(++row, column, row, column + 1, true)
        .string(fromDate + toDate)
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.resource[lang])
        .style(styles.packageTitle);
      ws.cell(row, column + 1)
        .string(STRINGS.rate[lang])
        .style(styles.packageTitle);

      ws.cell(++row, column)
        .string(STRINGS.fixed_monthly_fees[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["fixed_monthly_fees"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.fees_plugins[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(invoiceData.plugins_fees_amount.toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.cpu_time_for_reports[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["cpu_time_taken"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.bytes_from_wialon[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["bytes_from_wialon"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.bytes_downloaded[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["bytes_sent"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.wialon_accounts[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["no_of_wialon_acc"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.employees[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["no_of_employees"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.downloaded_reports[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["downloads_click"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.generated_reports[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["generate_reports_click"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.mobile_cpu_time[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["mob_cpu_time"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.mobile_bytes_downloaded[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["mob_bytes_sent"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.mobile_bytes_from_wialon[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["mob_bytes_from_wialon"].toString())
        .style(styles.packageContent);

      ws.cell(++row, column)
        .string(STRINGS.mobile_active_users[lang])
        .style(styles.packageContent);
      ws.cell(row, column + 1)
        .string(obj["rates_package"]["mob_active_users"].toString())
        .style(styles.packageContent);

      row = row + 2;
    }

    let b64 = null;
    let buffer = await wb.writeToBuffer();
    b64 = buffer.toString("base64");
    b64 =
      "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
      b64;

    let result = await FileProvider.push({
      name: "invoice.xlsx",
      data: b64
    });
    resolve(result);
  });
}

export default {
  getInvoices,
  getInvoiceDetails,
  downloadInvoice
};
