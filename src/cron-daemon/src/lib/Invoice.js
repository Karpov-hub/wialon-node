import db from "@lib/db";
import Queue from "@lib/queue";

const Op = db.Sequelize.Op;

// Run every 5 sec
// const time = "0/5 * * * * *";

// Run every night 1.01
const time = "1 1 * * *";

const description = "Invoice-generator daemon";

async function run() {
  try {
    let currentDate = new Date();
    let day = currentDate.getDate();
    const organisations = await db.organization.findAll({
      where: { billing_day: day }
    });

    let out = [];
    for (const organisation of organisations) {
      const lastInvoice = await db.invoice.findOne({
        where: { organization_id: organisation.id },
        order: [["ctime", "DESC"]]
      });

      let invoiceFromDate = new Date();
      if (lastInvoice && lastInvoice.dataValues) {
        invoiceFromDate = new Date(lastInvoice.dataValues.to_date);
        invoiceFromDate.setDate(invoiceFromDate.getDate() + 1);
      } else {
        invoiceFromDate.setMonth(invoiceFromDate.getMonth() - 1);
      }

      let invoiceToDate = new Date();
      invoiceToDate.setDate(invoiceToDate.getDate() - 1);
      if (invoiceFromDate > invoiceToDate) {
        continue;
      }

      await db.package_subscription.belongsTo(db.rates_package, {
        targetKey: "id",
        foreignKey: "rates_package_id"
      });

      //retrive current packages
      const lastPkg = await db.package_subscription.findOne({
        where: {
          organization_id: organisation.id,
          [db.Sequelize.Op.or]: [
            { to_date: { [db.Sequelize.Op.gte]: invoiceFromDate } },
            {
              [db.Sequelize.Op.and]: [
                { from_date: { [db.Sequelize.Op.lte]: invoiceToDate } },
                { to_date: { [db.Sequelize.Op.eq]: null } }
              ]
            }
          ]
        },
        include: [{ model: db.rates_package }],
        order: [["from_date", "desc"]]
      });

      let usageReports = await db.usage_report.findAll({
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
              db.sequelize.fn("SUM", db.sequelize.col("downloads_click")),
              0
            ),
            "downloads_click"
          ],
          [
            db.sequelize.fn(
              "COALESCE",
              db.sequelize.fn(
                "SUM",
                db.sequelize.col("generate_reports_click")
              ),
              0
            ),
            "generate_reports_click"
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
          "rates_package_id"
        ],
        where: {
          organization_id: organisation.id,
          [db.Sequelize.Op.and]: [
            { date: { [db.Sequelize.Op.gte]: invoiceFromDate } },
            { date: { [db.Sequelize.Op.lte]: invoiceToDate } }
          ]
        },
        group: ["organization_id", "rates_package_id"]
      });

      let total_amount = 0;
      let cpu_time_taken = 0;
      let bytes_from_wialon = 0;
      let bytes_sent = 0;
      let mob_cpu_time = 0;
      let mob_bytes_sent = 0;
      let mob_bytes_from_wialon = 0;
      let downloads_click = 0;
      let generate_reports_click = 0;

      for (const usageReport of usageReports) {
        const currentPkg = await db.rates_package.findByPk(
          usageReport.dataValues.rates_package_id
        );
        cpu_time_taken =
          parseFloat(usageReport.dataValues.cpu_time_taken) + cpu_time_taken;
        bytes_from_wialon =
          parseFloat(usageReport.dataValues.bytes_from_wialon) +
          bytes_from_wialon;
        bytes_sent = parseFloat(usageReport.dataValues.bytes_sent) + bytes_sent;

        mob_cpu_time =
          parseFloat(usageReport.dataValues.mob_cpu_time) + mob_cpu_time;
        mob_bytes_sent =
          parseFloat(usageReport.dataValues.mob_bytes_sent) + mob_bytes_sent;
        mob_bytes_from_wialon =
          parseFloat(usageReport.dataValues.mob_bytes_from_wialon) +
          mob_bytes_from_wialon;

        downloads_click =
          parseFloat(usageReport.dataValues.downloads_click) + downloads_click;
        generate_reports_click =
          parseFloat(usageReport.dataValues.generate_reports_click) +
          generate_reports_click;

        total_amount =
          usageReport.dataValues.cpu_time_taken *
            currentPkg.dataValues.cpu_time_taken +
          usageReport.dataValues.bytes_from_wialon *
            currentPkg.dataValues.bytes_from_wialon +
          usageReport.dataValues.bytes_sent * currentPkg.dataValues.bytes_sent +
          usageReport.dataValues.mob_cpu_time *
            currentPkg.dataValues.mob_cpu_time +
          usageReport.dataValues.mob_bytes_sent *
            currentPkg.dataValues.mob_bytes_sent +
          usageReport.dataValues.mob_bytes_from_wialon *
            currentPkg.dataValues.mob_bytes_from_wialon +
          usageReport.dataValues.downloads_click *
            currentPkg.dataValues.downloads_click +
          usageReport.dataValues.generate_reports_click *
            currentPkg.dataValues.generate_reports_click +
          total_amount;
      }

      const no_of_wialon_acc = await db.wialon_accounts.count({
        where: { organization_id: organisation.id }
      });

      const no_of_employees = await db.user.count({
        where: { organization_id: organisation.id }
      });

      const mob_active_users = await db.mobile_usage_stat.count({
        where: {
          organization_id: organisation.id,
          [db.Sequelize.Op.and]: [
            { ctime: { [db.Sequelize.Op.gte]: invoiceFromDate } },
            { ctime: { [db.Sequelize.Op.lte]: invoiceToDate } }
          ]
        },
        distinct: true,
        col: "user_id"
      });

      total_amount =
        no_of_employees * lastPkg.dataValues.rates_package.no_of_employees +
        no_of_wialon_acc * lastPkg.dataValues.rates_package.no_of_wialon_acc +
        mob_active_users * lastPkg.dataValues.rates_package.mob_active_users +
        lastPkg.dataValues.rates_package.fixed_monthly_fees +
        total_amount;

      //plugins fees
      let pluginsFeesArray = [];
      let pluginFeesAmount = 0;

      const res = await Queue.newJob("plugin-service", {
        method: "calculatePluginsFees",
        data: {
          organization_id: organisation.id,
          from_date: invoiceFromDate,
          to_date: invoiceToDate
        }
      });
      if (res && res.result && res.result.success) {
        pluginsFeesArray = res.result.plugin_fees;
        pluginFeesAmount = res.result.plugin_fees_amount;
      }
      total_amount += pluginFeesAmount;

      //retrive current taxId
      const tax = await db.tax_information.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { from_date: { [db.Sequelize.Op.lte]: currentDate } },
            { to_date: { [db.Sequelize.Op.gte]: currentDate } }
          ]
        },
        raw: true
      });

      total_amount = (
        total_amount +
        (tax.percentage / 100) * total_amount
      ).toFixed(2);

      out.push({
        organization_id: organisation.id,
        total_fees: total_amount,
        plugins_fees: JSON.stringify(pluginsFeesArray),
        plugins_fees_amount: pluginFeesAmount,
        from_date: invoiceFromDate,
        to_date: invoiceToDate,
        invoice_date: currentDate,
        bytes_sent: bytes_sent,
        cpu_time_taken: cpu_time_taken,
        mob_cpu_time: mob_cpu_time,
        mob_bytes_sent: mob_bytes_sent,
        mob_bytes_from_wialon: mob_bytes_from_wialon,
        generate_reports_click: generate_reports_click,
        downloads_click: downloads_click,
        bytes_from_wialon: bytes_from_wialon,
        no_of_employees: no_of_employees,
        no_of_wialon_acc: no_of_wialon_acc,
        mob_active_users: mob_active_users,
        tax_id: tax.id,
        adjustment: 0
      });
    }

    await db.invoice.bulkCreate(out);

    //sendInvoiceGeneratedEmails Commented as we don't have proper package resource rates
    //await sendInvoiceGeneratedEmails(organisations);
  } catch (err) {
    console.log(description + " run err = ", err);
  }
}

async function sendEmail(user) {
  try {
    let data = {};
    data.code = "InvoiceGenerated";
    data.email = user.dataValues.email;
    data.to = user.dataValues.email;

    const { result } = await Queue.newJob("mail-service", {
      method: "send",
      data: {
        lang: "en",
        code: data.code,
        to: data.email,
        body: data
      },
      realmId: user.dataValues.realm
    });

    return { success: true };
  } catch (err) {
    console.log("@@sendEmail err", err);
    throw err;
  }
}

async function sendInvoiceGeneratedEmails(organisations) {
  try {
    const adminRole = await db.role.findOne({ where: { role: "Admin" } });
    for (const organisation of organisations) {
      const user = await db.user.findOne({
        where: {
          organization_id: organisation.dataValues.id,
          role_id: adminRole.id
        }
      });

      if (user && user.dataValues) await sendEmail(user);
    }
    return true;
  } catch (err) {
    console.log("@@sendInvoiceGeneratedEmails err", err);
    throw err;
  }
}

export default {
  time,
  description,
  run
};
