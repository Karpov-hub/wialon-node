import Base from "@lib/base";
import Unit from "./lib/Unit";
import Report from "./lib/Report";
import Card from "./lib/Card";
import Transaction from "./lib/Transaction";

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
      getUnits: {
        realm: true,
        user: true,
        description: "Get all units",
        schema: {
          type: "object",
          properties: {
            start: { type: "number" },
            end: { type: "number" },
            descending: { type: "boolean" },
            filter_by_name: { type: "string" },
            filter_by_card: { type: "string" }
          }
        },
        method: Unit.getUnits
      },
      getGroups: {
        realm: true,
        user: true,
        description: "Get all groups",
        method: Unit.getGroups
      },
      attachCardToUnit: {
        realm: true,
        user: true,
        description: "Attach the card to Unit in WH",
        method: Card.attachCardToUnit,
        schema: {
          type: "object",
          properties: {
            card_number: { type: "string" },
            wialon_account_id: { type: "number" },
            organization_aggregator_account_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            unit_id: { type: "number", minimum: 1 }
          },
          required: [
            "card_number",
            "wialon_account_id",
            "organization_aggregator_account_id",
            "unit_id"
          ]
        }
      },
      detachCardFromUnit: {
        realm: true,
        user: true,
        description: "Detach the card from unit on WH",
        method: Card.detachCardFromUnit,
        schema: {
          type: "object",
          properties: {
            wialon_account_id: { type: "number", minimum: 1 },
            unit_id: { type: "number", minimum: 1 },
            id_field: { type: "number", minimum: 1 },
            card_number: { type: "string" },
            card_id: {
              type: ["string", "null"],
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: ["wialon_account_id", "unit_id", "id_field", "card_number"]
        }
      },
      updateCard: {
        realm: true,
        user: true,
        description: "Update card information",
        method: Card.updateCard,
        schema: {
          type: "object",
          properties: {
            card_number: { type: "string" },
            organization_aggregator_account_id: {
              type: "string",
              minLength: 36,
              maxLength: 36,
              format: "uuid"
            },
            unit_id: { type: "number", minimum: 1 },
            wialon_account_id: { type: "number", minimum: 1 },
            id: {
              type: "string",
              minLength: 36,
              maxLength: 36,
              format: "uuid"
            }
          },
          required: [
            "card_number",
            "organization_aggregator_account_id",
            "unit_id",
            "wialon_account_id"
          ]
        }
      },
      deleteUnitTransactionsByCard: {
        realm: true,
        user: true,
        description: "Delete unit transaction by card",
        method: Transaction.deleteUnitTransactionsByCard,
        schema: {
          type: "object",
          properties: {
            wialon_account_id: { type: "number" },
            unit_id: { type: "number" },
            card_number: { type: "string" },
            start_date: { type: "number" },
            end_date: { type: "number" }
          },
          required: [
            "wialon_account_id",
            "unit_id",
            "card_number",
            "start_date",
            "end_date"
          ]
        }
      },
      uploadTransactions: {
        private: true,
        description: "Upload daily transactions",
        method: Transaction.uploadTransactions
      },
      getWialonProfile: {
        realm: true,
        user: false,
        description: "Get data about Wialon Profile",
        method: Unit.getWialonProfile
      },
      createReport: {
        realm: true,
        user: true,
        description: "Create a report for export",
        method: Report.createReport,
        schema: {
          type: "object",
          properties: {
            start_date: { type: "number" },
            end_date: { type: "number" },
            wialon_account_id: { type: "number", minimum: 1 },
            unit_ids: { type: "array" },
            type_report: { type: "string" },
            aggregator_ids: {
              type: "array",
              items: {
                type: "string",
                format: "uuid",
                minLength: 36,
                maxLength: 36
              }
            }
          },
          required: [
            "start_date",
            "end_date",
            "wialon_account_id",
            "type_report",
            "unit_ids",
            "aggregator_ids"
          ]
        }
      },
      uploadTransactionsForOneUnit: {
        realm: true,
        user: true,
        description: "Upload transaction for one unit",
        method: Transaction.uploadTransactionsForOneUnit,
        schema: {
          type: "object",
          properties: {
            start_date: { type: "number" },
            end_date: { type: "number" },
            organization_aggregator_account_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            wialon_account_id: { type: "number", minimum: 1 },
            card_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: ["start_date", "end_date", "wialon_account_id", "card_id"]
        }
      },
      getCards: {
        realm: true,
        user: true,
        description: "Get all cards those already attached to the cars",
        method: Card.getCards,
        schema: {
          type: "object",
          properties: {
            card_number: { type: "string" }
          }
        }
      }
    };
  }

  async ping(data) {
    console.log("ping");
    return { "test-pong": true };
  }
}
