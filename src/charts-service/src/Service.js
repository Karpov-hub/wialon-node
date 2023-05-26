import Base from "@lib/base";
import Charts from "./lib/charts";

export default class Service extends Base {
  publicMethods() {
    return {
      serviceDescription: {},
      sign_in: {
        //realm: true,
        method: Charts.sign_in,
        description: "Sign in Service",
        schema: {
          type: "object",
          properties: {
            host: { type: "string", maxLength: 255 },
            token: { type: "string", maxLength: 255 },
            hash: { type: "string" }
          },
          required: ["host"]
        }
      },
      set_templates: {
        //realm: true,
        method: Charts.set_templates,
        description: "Set templates",
        schema: {
          type: "object",
          properties: {
            host: { type: "string", maxLength: 255 },
            token: { type: "string", maxLength: 255 },
            engineReportResource: { type: "string", maxLength: 255 },
            engineReportTemplate: { type: "string", maxLength: 255 },
            ecoReportResource: { type: "string", maxLength: 255 },
            ecoReportTemplate: { type: "string", maxLength: 255 }
          },
          required: ["host", "token", "engineReportResource", "engineReportTemplate", "ecoReportResource", "ecoReportTemplate"]
        }
      },
      charts_data: {
        method: Charts.charts_data,
        description: "Generate reports data for charts",
        schema: {
          type: "object",
          properties: {
            host: { type: "string", maxLength: 255 },
            token: { type: "string", maxLength: 255 },
            group: { type: "number" },
            from: { type: "number" },
            to: { type: "number" }
          },
          required: ["host", "group", "from", "to"]
        }
      },
      ping: {
        //realm: true,
        method: Charts.ping,
        description: "Request ping"
      },
      get_mailing_list: {
        method: Charts.getMailingList,
        description: "Get mailing list",
        schema: {
          type: "object",
          properties: {
            host: { type: "string", maxLength: 255 },
            token: { type: "string", maxLength: 255 }
          },
          required: ["host", "token"]
        }
      },
      update_mailing: {
        method: Charts.updateMailing,
        description: "Update mailing",
        schema: {
          type: "object",
          properties: {
            host: { type: "string", maxLength: 255 },
            token: { type: "string", maxLength: 255 },
            id: { type: "string" },
            email: { type: "string", maxLength: 255 },
            hour: { type: "number" }
          },
          required: ["host", "token", "id", "email", "hour"]
        }
      },
      add_mailing: {
        method: Charts.addMailing,
        description: "Add mailing",
        schema: {
          type: "object",
          properties: {
            host: { type: "string", maxLength: 255 },
            token: { type: "string", maxLength: 255 },
            email: { type: "string", maxLength: 255 },
            hour: { type: "number" }
          },
          required: ["host", "token", "email", "hour"]
        }
      },
      remove_mailing: {
        method: Charts.removeMailing,
        description: "Remove mailing",
        schema: {
          type: "object",
          properties: {
            host: { type: "string", maxLength: 255 },
            token: { type: "string", maxLength: 255 },
            id: { type: "string" }
          },
          required: ["host", "token", "id"]
        }
      },
      test_error: {
        method: Charts.test_error,
        description: "Test error"
      },
      switch_mailings: {
        method: Charts.switchMailings,
        description: "Mailing list switching",
        schema: {
          type: "object",
          properties: {
            host: { type: "string", maxLength: 255 },
            token: { type: "string", maxLength: 255 },
            mailing: { type: "boolean" }
          },
          required: ["host", "token", "mailing"]
        }
      },
      set_mailing_group: {
        method: Charts.setMailingGroup,
        description: "Setting up a distribution group",
        schema: {
          type: "object",
          properties: {
            host: { type: "string", maxLength: 255 },
            token: { type: "string", maxLength: 255 },
            defaultGroup: { type: "number" }
          },
          required: ["host", "token", "defaultGroup"]
        }
      },
      scheduled_mailings: {
        method: Charts.scheduledMailings
      },
      /* test_mailings: {
        method: Charts.testMailings,
        description: "Scheduled Mailings"
      }, */
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods"
      }
    };
  }

  async ping(data) {
    console.log("ping");
    return { "test-pong": true };
  }
}
