import Base from "@lib/base";
import Support from "./lib/Support";

export default class Service extends Base {
  publicMethods() {
    return {
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods"
      },
      getTickets: {
        realm: true,
        user: true,
        method: Support.getTickets,
        description: "get tickets",
        schema: {
          type: "object",
          properties: {
            start: { type: ["integer", "null"], minimum: 0 },
            limit: { type: ["integer", "null"], minimum: 1, maximum: 100 }
          },
          required: ["start", "limit"]
        }
      },
      createTicket: {
        realm: true,
        user: true,
        method: Support.createTicket,
        description: "create ticket",
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "number" },
            message: { type: "string" },
            files: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  data: { type: "string" }
                }
              }
            },
            is_user_message: { type: "boolean" }
          },
          required: ["title", "category", "message", "is_user_message"]
        },
        log: true
      },
      getComments: {
        realm: true,
        user: true,
        method: Support.getComments,
        description: "get comments",
        schema: {
          type: "object",
          properties: {
            ticketId: { type: "string" }
          },
          required: ["ticketId"]
        }
      },
      createComment: {
        realm: true,
        user: true,
        method: Support.createComment,
        description: "create comment",
        schema: {
          type: "object",
          properties: {
            ticket_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            message: { type: "string" },
            files: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  data: { type: "string" }
                }
              }
            },
            is_user_message: { type: "boolean" }
          },
          required: ["ticket_id", "message", "is_user_message"]
        },
        log: true
      },
      reopenTicket: {
        realm: true,
        user: true,
        method: Support.reopenTicket,
        description: "reopen ticket",
        schema: {
          type: "object",
          properties: {
            ticket_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: ["ticket_id"]
        },
        log: true
      },
      getCountOfNewComments: {
        realm: true,
        user: true,
        method: Support.getCountOfNewComments,
        description: "Get count all of comments, that were not readed by user",
        schema: {
          type: "object",
          properties: {}
        }
      },

      readNewComments: {
        realm: true,
        user: true,
        method: Support.readNewComments,
        description: "Read some errors, that were passed",
        schema: {
          type: "object",
          properties: {
            ids: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          required: ["ids"]
        }
      },

      resolveTicket: {
        realm: true,
        user: true,
        method: Support.resolveTicket,
        description: "Resolve the ticket from the client side",
        schema: {
          type: "object",
          properties: {
            id: {
              format: "uuid",
              maxLength: 36,
              minLength: 36
            }
          },
          required: ["id"]
        }
      },

      closeInactiveTickets: {
        private: true,
        method: Support.closeInactiveTickets,
        description:
          "Close automatically a tickets, those have no comments more than 1 week"
      }
    };
  }

  async ping(data) {
    console.log("ping");
    return {
      "test-pong": true
    };
  }
}
