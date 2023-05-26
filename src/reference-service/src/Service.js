import Base from "@lib/base";
import Reference from "./lib/Reference";

export default class Service extends Base {
  publicMethods() {
    return {
      serviceDescription: {},
      ping: {
        description: "Test ping-pong method"
      },
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods"
      },
      getReferences: {
        realm: true,
        user: true,
        description: "Get all references",
        method: Reference.getReferences,
        schema: {
          type: "object",
          properties: {
            start: { type: ["number", "null"], minimum: 0 },
            limit: { type: ["number", "null"], minimum: 1 }
          },
          required: ["start", "limit"]
        }
      },
      getReference: {
        realm: true,
        user: true,
        description: "Get reference by using language of the user and route_id",
        method: Reference.getReference,
        schema: {
          type: "object",
          properties: {
            route_id: {
              format: "uuid"
            }
          },
          required: ["route_id"]
        }
      },
      createReference: {
        private: true,
        description: "Create/Update a reference",
        method: Reference.createReference,
        schema: {
          type: "object",
          properties: {
            files: { type: "array" },
            id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            route_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            description: { type: "string" },
            lang: { type: "string", maxLength: 2, minLength: 2 },

            realm_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          required: [
            "files",
            "id",
            "route_id",
            "description",
            "lang",
            "realm_id"
          ]
        }
      },
      deleteFileFromReference: {
        private: true,
        description: "Delete file from Reference and file provider too",
        method: Reference.deleteFileFromReference,
        schema: {
          type: "object",
          properties: {
            recordData: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                  minLength: 36,
                  maxLength: 36
                }
              },
              required: ["id"]
            },

            file: {
              type: "object",
              properties: {
                code: { type: "string" }
              },
              required: ["code"]
            }
          },
          required: ["recordData", "file"]
        }
      }
    };
  }

  async ping(data) {
    console.log("ping");
    return { "test-pong": true };
  }
}
