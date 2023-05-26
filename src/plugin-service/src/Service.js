import Base from "@lib/base";
import Plugin from "./lib/Plugin";

export default class Service extends Base {
  publicMethods() {
    return {
      serviceDescription: {},
      ping: {
        description: "Test ping-pong method",
        schema: {
          type: "object",
          properties: {
            text: { type: "string" },
            num: { type: "number" }
          },
          required: ["text"]
        }
      },
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods"
      },
      getAllPlugins: {
        realm: true,
        user: true,
        description: "Get all plugins with organization connection status",
        method: Plugin.getAllPlugins
      },
      getApprovedOrganizationPlugins: {
        realm: true,
        user: true,
        description: "Get all approved organization plugins",
        method: Plugin.getApprovedOrganizationPlugins
      },
      pluginConnectionRequest: {
        realm: true,
        user: true,
        description: "Get plugin status for organization",
        method: Plugin.pluginConnectionRequest,
        schema: {
          type: "object",
          properties: {
            plugin_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: ["plugin_id"]
        }
      },
      updateStatusOrganizationPlugin: {
        realm: true,
        user: false,
        method: Plugin.updateStatusOrganizationPlugin,
        description: "Update status organization plugin",
        schema: {
          type: "object",
          properties: {
            organization_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            plugin_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            status: { type: "integer", minimum: 0, maximum: 4 },
            reject_reason: { type: "string" },
            plugin_fees: { type: "integer", minimum: 0 }
          },
          required: ["plugin_id", "status"]
        }
      },
      toggleCronOrganizationPlugin: {
        realm: true,
        user: true,
        description: "Toggle plugin cron for organization",
        method: Plugin.toggleCronOrganizationPlugin,
        schema: {
          type: "object",
          properties: {
            plugin_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: ["plugin_id"]
        }
      },
      calculatePluginsFees: {
        private: true,
        method: Plugin.calculatePluginsFees,
        description: "Calculate Plugins Fees for period",
        schema: {
          type: "object",
          properties: {
            organization_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            from_date: { type: "date-time" },
            to_date: { type: "date-time" }
          },
          required: ["organization_id", "from_date", "to_date"]
        }
      }
    };
  }

  async ping() {
    console.log("ping");
    return { "test-pong": true };
  }
}
