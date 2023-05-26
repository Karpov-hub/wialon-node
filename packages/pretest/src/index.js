import db from "@lib/db";
import uuidGenerator from "uuid";
import CONFIG from "@lib/config";
import MemStore from "@lib/memstore";
import { CONSTANTS } from "@lib/utils";
import { hashPassword, createSalt } from "@lib/utils";

let result = {};

function wait(tm) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, tm);
  });
}

async function before() {
  await MemStore.flushAll();
  await db.realm.destroy({ truncate: true, cascade: true });
  await db.role.destroy({ truncate: true, cascade: true });
  await db.route.destroy({ truncate: true, cascade: true });
  await db.user.destroy({ truncate: true, cascade: true });
  await db.wialon_accounts.destroy({ truncate: true, cascade: true });
  await db.card.destroy({ truncate: true, cascade: true });
  await db.custom_report_request.destroy({ truncate: true, cascade: true });
  await db.download_stats.destroy({ truncate: true, cascade: true });
  await db.mobile_usage_stat.destroy({ truncate: true, cascade: true });
  await db.transporter.truncate();
  await db.letter.truncate();
  await db.aggregator.truncate();
  await db.plugin.truncate();
  await db.system_variable.truncate();

  const transporterId = "21efa1a9-5dd0-4279-a796-9acb8014fe43";
  const realmId = "56e4a6bb-8fde-445d-bc73-08c93f3f0e27";

  await db.realm.create({
    id: realmId,
    name: "UI"
  });
  result.realmId = realmId;

  await db.transporter.create({
    id: transporterId,
    host_transporter: "smtp.yandex.ru",
    port_transporter: 587,
    secure_transporter: true,
    user_transporter: "repogen@getgps.pro",
    password_transporter: "gwviscuqgilaxior"
  });

  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "dev-notification",
    letter_name: "Repogen technical issue notification",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "dm112@tadbox.com",
    lang: "en",
    subject: "REPOGEN | TECH ISSUE NOTIFICATION",
    text: "Alarm notification",
    html: `p Hi! Informing you about a significant issue in Repogen project on the #{body.env} server. Please, inform the team and apply the required actions immediately.
p Level: "#{body.level}".
p Timestamp: "#{body.timestamp}".
p Message: "#{body.message}".
p Debug information: "#{body.debug}"
p Stack: "#{body.stack}"`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      body: {
        from: "repogen@getgps.pro",
        to: "dm112@tadbox.com",
        env: "staging",
        message: "Error: Wrong http request [INPDATAFORMAT]",
        level: "http",
        app: "Repogen",
        server_ip: "172.21.0.2",
        timestamp: "Wed Dec 07 2022 15:10:48 GMT+0400",
        debug:
          '{"requestId":null,"request":{"headers":{"host":"89.221.54.198","connection":"upgrade","x-real-ip":"45.185.153.34","x-forwarded-for":"45.185.153.34","user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36","accept-encoding":"gzip"},"body":{}},"response":{"header":{"id":null,"status":"ERROR"},"error":{"code":"INPDATAFORMAT","message":"Error in input format."}}}',
        stack: ""
      }
    }),
    ctime: new Date(),
    mtime: new Date()
  });

  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "plugin-request",
    letter_name: "plugin request from company",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "Company has requested access to plugin ",
    text: "",
    html: `p Company #{body.organization_name} has requested access to plugin #{body.plugin_name}`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "EN",
      code: "plugin-request",
      to: "repogen@getgps.eu",
      body: {
        organization_id: "144513a0-70bb-11ed-b2c1-fb5e93cdeb88",
        plugin_id: "ee7c4508-7c45-11ed-a1eb-0242ac120002",
        lang: "EN",
        organization_name: "Test",
        plugin_name: "Fuel Cards"
      }
    }),
    ctime: new Date(),
    mtime: new Date()
  });
  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "plugin-request-approve",
    letter_name: "Plugin connection request approved",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "Repogen | Notification about plugin connection request approved",
    text: "",
    html: `p #{body.plugin_name} plugin is connected to your organization`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "plugin-request-approve",
      to: "id102@tadbox.com",
      body: {
        plugin_name: "Test"
      }
    }),
    ctime: new Date(),
    mtime: new Date()
  });
  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "inform-user-about-success-registration",
    letter_name: "inform-user-about-success-registration",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "Repogen | Your account was created into the system!",
    text: "",
    html: `p inform-user-about-success-registration`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "inform-user-about-success-registration",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });
  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "inform-user-about-reject-request",
    letter_name: "inform-user-about-reject-request",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "Repogen | Your request on registration was rejected",
    text: "",
    html: `p inform-user-about-reject-request`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "inform-user-about-reject-request",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });

  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "remind-password",
    letter_name: "remind-password",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "Repogen | Password was reset",
    text: "",
    html: `p remind-password`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "remind-password",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });

  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "signup-admin",
    letter_name: "signup-admin",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "signup-admin",
    text: "",
    html: `p signup-admin`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "signup-admin",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });

  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "invite-user",
    letter_name: "invite-user",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "invite-user",
    text: "",
    html: `p invite-user`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "invite-user",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });
  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "custom_request_report",
    letter_name: "custom_request_report",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "custom_request_report",
    text: "",
    html: `p custom_request_report`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "custom_request_report",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });
  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "new_ticket_notification",
    letter_name: "new_ticket_notification",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "new_ticket_notification",
    text: "",
    html: `p new_ticket_notification`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "new_ticket_notification",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });
  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "admin_ticket_answer_notification",
    letter_name: "admin_ticket_answer_notification",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "admin_ticket_answer_notification",
    text: "",
    html: `p admin_ticket_answer_notification`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "admin_ticket_answer_notification",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });
  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "custom_request_report_notification",
    letter_name: "custom_request_report_notification",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "custom_request_report_notification",
    text: "",
    html: `p custom_request_report_notification`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "custom_request_report_notification",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });

  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "notify-supervisor-about-new-ticket",
    letter_name: "Notify Supervisor about new ticket",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "Repogen | User created new Support Ticket",
    text: "",
    html: `p notify-supervisor-about-new-ticket`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "custom_request_report_notification",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });

  await db.system_variable.create({
    id: uuidGenerator.v4(),
    code: "EMAIL_FOR_NOTIFICATIONS_ABOUT_REGISTRATION",
    value: "id102@tadbox.com",
    ctime: new Date(),
    mtime: new Date(),
    maker: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2dbcce4"
  });

  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "notification-for-admin-about-request",
    letter_name: "Notify supervisor about new request on registration",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "Repogen | Notify supervisor about new request on registration",
    text: "",
    html: `p notification-for-admin-about-request`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "notification-for-admin-about-request",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });

  await db.letter.create({
    id: uuidGenerator.v4(),
    realm: realmId,
    code: "notify-admin-about-request-on-sandbox",
    letter_name: "Notify organization admins about access to the Sandbox",
    from: "repogen@getgps.pro",
    from_email: "repogen@getgps.pro",
    to: "id102@tadbox.com",
    lang: "en",
    subject: "Repogen | Notify organization admins about access to the Sandbox",
    text: "",
    html: `p notify-admin-about-request-on-sandbox`,
    transporter: transporterId,
    data: JSON.stringify({
      lang: "en",
      code: "notify-admin-about-request-on-sandbox",
      to: "id102@tadbox.com",
      body: {}
    }),
    ctime: new Date(),
    mtime: new Date()
  });

  await db.role.create({
    id: "c17e791c-f0c6-11e9-81b4-2a2ae2dbcce4",
    role: "Admin",
    description: "admin",
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });

  await db.role.create({
    id: "c17e7bd8-f0c6-11e9-81b4-2a2ae2dbcce4",
    role: "SuperAdmin",
    description: "super admin",
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });

  await db.role.create({
    id: "c17e7d36-f0c6-11e9-81b4-2a2ae2dbcce4",
    role: "User",
    description: "user",
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });

  result.route1 = await db.route.create({
    id: "07e5bbc4-284c-4fe5-9506-447061396709",
    method: "getReportGeneric2",
    service: "report-service",
    description: "Get All Units",
    type: 1,
    organization_id: null,
    requirements: null,
    removed: 0,
    ctime: new Date(),
    mtime: new Date(),
    removed: 0
  });

  await db.references_report.create({
    id: uuidGenerator.v4(),
    route_id: result.route1.dataValues.id,
    description: "DESCRIPTION",
    file_id: [],
    file_name: [],
    file_size: [],
    files: [],
    realm_id: realmId,
    lang: "EN"
  });

  result.route2 = await db.route.create({
    id: "580f07da-5a3a-4c3d-968b-ae2c5c96c87b",
    method: "getReportGeneric1",
    service: "report-service",
    description: "Report With Sensors",
    type: 1,
    organization_id: null,
    requirements: null,
    removed: 0,
    ctime: new Date(),
    mtime: new Date()
  });

  result.plugin = await db.plugin.create({
    id: CONSTANTS.PLUGIN_FUEL_CARDS_ID,
    name: "Fuel Cards",
    removed: 0,
    maker: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2dbcce4"
  });

  result.organization = await db.organization.create({
    organization_name: "Test organization",
    billing_day: 23,
    removed: 0,
    delete_old_reports_period: 14
  });
  const salt = createSalt();
  const pass = hashPassword("Passw0rd!#", salt);
  result.user1 = await db.user.create({
    name: "testuser",
    email: "testuser@user.com",
    pass,
    removed: 0,
    role_id: "c17e791c-f0c6-11e9-81b4-2a2ae2dbcce4",
    organization_id: result.organization.id,
    realm: result.realmId,
    is_active: true,
    userlevel: 2,
    salt
  });

  result.aggregator = await db.aggregator.create({
    name: "ROSNEFT",
    host: `${CONFIG.DEFAULT_HOST_WITHOUT_AJAX}-aggregator`,
    name_for_custom_field: "rcard",
    removed: 0,
    api_key_required: false,
    log_pas_required: true,
    method_for_check: "testMethodRosneft",
    service_for_method: "aggregator-service",
    method_for_get_data: "getTransactionsRosneft",
    contract_number_required: true
  });

  await db.organization_plugin.create({
    organization_id: result.user1.organization_id,
    plugin_id: result.plugin.id,
    status: 2,
    is_cron_enabled: true,
    removed: 0,
    reject_reason: null,
    last_deactivated_date: null,
    last_activated_date: null,
    plugin_fees: 50.0
  });

  result.aggregatorAccount = await db.organization_aggregator_accounts.create({
    organization_id: result.user1.organization_id,
    aggregator_id: result.aggregator.id,
    api_key: "",
    password: "rcard",
    login: "rcard",
    removed: 0,
    contract_number: "",
    status: 3,
    name: "ROSNEFT"
  });

  await db.organization_aggregator_account_permissions.create({
    organization_id: result.organization.id,
    aggregator_id: result.aggregator.id,
    removed: 0
  });

  result.wialonAccount = await db.wialon_accounts.create({
    wialon_username: "tk_card",
    wialon_token: "example_token",
    wialon_hosting_url: CONFIG.DEFAULT_HOST_WITHOUT_AJAX,
    organization_id: result.user1.organization_id,
    removed: 0
  });

  return result;
}

async function after() {}

export default {
  before,
  after,
  wait
};
