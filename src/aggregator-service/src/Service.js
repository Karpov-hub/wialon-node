import Base from "@lib/base";
import Aggregator from "./lib/Aggregator";
import GarveksController from "./lib/GarveksController";
import PRRController from "./lib/PPRController";
import RosneftController from "./lib/RosneftController";

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
      getAllAggregators: {
        realm: true,
        user: true,
        description: "Get all aggregators",
        method: Aggregator.getAllAggregators
      },
      getAllAggregatorOrganizationRecords: {
        realm: true,
        user: true,
        description: "Get all credentials of aggregators for one organization",
        method: Aggregator.getAllAggregatorOrganizationRecords
      },
      attachApiKeyLoginPasswordToOrganization: {
        realm: true,
        user: true,
        description: "Create/Update Aggregator credentials",
        method: Aggregator.attachApiKeyLoginPasswordToOrganization,
        schema: {
          type: "object",
          properties: {
            record_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            aggregator_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            name: { type: "string" },
            login: { type: "string" },
            password: { type: "string" },
            contract_number: { type: "string" },
            api_key: { type: "string" }
          },
          required: ["aggregator_id", "name"]
        }
      },
      testMethodGarveks: {
        realm: true,
        user: true,
        description: "Method for test login and password of Garveks",
        method: GarveksController.testMethodGarveks
      },
      testMethodPPR: {
        realm: true,
        user: true,
        description: "Method for test api-key of PPR",
        method: PRRController.testMethodPPR
      },
      testMethodRosneft: {
        realm: true,
        user: true,
        description: "Method for test login and password of Rosneft",
        method: RosneftController.testMethodRosneft
      },
      getTransactionsGarveks: {
        realm: true,
        user: true,
        description: "Get all transactions from Garveks Service",
        method: GarveksController.getTransactions,
        schema: {
          type: "object",
          properties: {
            startDate: { type: "date-time" },
            endDate: { type: "date-time" },
            login: { type: "string" },
            password: { type: "string" }
          },
          required: ["startDate", "endDate", "login", "password"]
        }
      },
      getTransactionsPPR: {
        realm: true,
        user: true,
        description: "Get all transactions from PPR Service",
        method: PRRController.getTransactions,
        schema: {
          type: "object",
          properties: {
            start_date: { type: "date-time" },
            end_date: { type: "date-time" },
            api_key: { type: "string" }
          }
        }
      },
      getTransactionsRosneft: {
        realm: true,
        user: true,
        description:
          "Get all transaction by contract number from Rosneft Service",
        method: RosneftController.getTransactions
      },
      deleteCredentialsForAggregator: {
        realm: true,
        user: true,
        description: "Delete credentials for aggregator from the system",
        method: Aggregator.deleteCredentialsForAggregator,
        schema: {
          type: "object",
          properties: {
            organization_aggregator_account_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: ["organization_aggregator_account_id"]
        }
      },
      updateStatusOrganizationAggregatorAccount: {
        realm: true,
        user: false,
        method: Aggregator.updateStatusOrganizationAggregatorAccount,
        description: "Update status organization aggregator account",
        schema: {
          type: "object",
          properties: {
            organization_aggregator_account_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            status: { type: "integer", minimum: 1, maximum: 3 }
          },
          required: ["organization_aggregator_account_id", "status"]
        }
      },
      setUserAccess: {
        realm: true,
        user: true,
        method: Aggregator.setUserAccess,
        description:
          "Set / Revoke access to the organization aggregator account for the user",
        schema: {
          type: "object",
          properties: {
            user_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            organization_aggregator_account_permissions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  organization_aggregator_account_id: {
                    type: "string",
                    format: "uuid",
                    minLength: 36,
                    maxLength: 36
                  },
                  is_user_has_access: { type: "boolean" }
                },
                required: [
                  "organization_aggregator_account_id",
                  "is_user_has_access"
                ]
              }
            }
          },
          required: ["user_id", "organization_aggregator_account_permissions"]
        }
      },
      getUserAggregatorAccountPermissions: {
        realm: true,
        user: true,
        method: Aggregator.getUserAggregatorAccountPermissions,
        description:
          "Get organization aggregator accounts list with user permissions",
        schema: {
          type: "object",
          properties: {
            user_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: ["user_id"]
        }
      },
      getAllOrganizationAggregatorAccounts: {
        realm: true,
        user: true,
        description: "Get all organization accounts without their credentials.",
        method: Aggregator.getAllOrganizationAggregatorAccounts,
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 0 }
          }
        }
      }
    };
  }

  async ping() {
    console.log("ping");
    return { "test-pong": true };
  }
}
