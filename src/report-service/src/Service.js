import Base from "@lib/base";
import commonMethods from "./lib/common-methods";
import custom from "./lib/custom";
import db from "@lib/db";
import Reports from "./reports/index";
import uuid from "uuid";
import fs from "promise-fs";
import config from "@lib/config";

import ReportProcessing from "./lib/reportProcessing";

export default class Service extends Base {
  publicMethods() {
    return {
      buildReport: {
        realm: true,
        user: true,
        description: "Build report by report_id and filters these were passed",
        method: this.buildReport,
        schema: {
          type: "object",
          properties: {
            report: { type: "string" },
            report_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            wialonAccountId: { type: "number" },
            params: {
              type: "object",
              properties: {
                routeId: {
                  type: "string",
                  format: "uuid",
                  minLength: 36,
                  maxLength: 36
                },

                startDate: { type: "string" },
                endDate: { type: "string" },
                unit: { type: "number" },

                date: { type: "string" },
                fromUnit: { type: "number" },
                toUnit: { type: "number" }
              },
              required: ["routeId"]
            }
          },
          required: ["report", "report_id", "wialonAccountId", "params"]
        },
        log: true
      },
      buildReportAwait: {
        description: "Group report generation"
      },

      getAllUnits: {
        realm: true,
        user: true,
        description: "Get All Units",
        method: this.getAllUnits,
        schema: {
          type: "object",
          properties: {
            wialonAccountId: { type: "number" }
          },
          required: ["wialonAccountId"]
        }
      },

      updateReportStats: {
        private: true,
        description: "Update Report Stats"
      },

      buildCustom: {
        realm: true,
        user: true,
        description: "Build Custom Report",
        method: custom.build,
        schema: {
          type: "object",
          properties: {
            routeId: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            codeInBase64: { type: "boolean" },
            code: { type: "string", secure: true }
          },
          required: [
            "routeId",
            "name",
            "description",
            "codeInBase64",
            "codeInBase64"
          ]
        },
        log: true
      },

      updateCustom: {
        realm: true,
        user: true,
        description: "Update Custom Report",
        method: custom.update,
        schema: {
          type: "object",
          properties: {
            routeId: { type: "string" },
            id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            },
            name: { type: "string" },
            description: { type: "string" },
            codeInBase64: { type: "boolean" },
            code: { type: "string", secure: true }
          },
          required: ["routeId", "id", "name", "description", "code"]
        },
        log: true
      },

      removeCustom: {
        realm: true,
        user: true,
        description: "Remove Custom Report",
        method: custom.remove,
        schema: {
          type: "object",
          properties: {
            route_id: { format: "uuid" }
          },
          required: ["route_id"]
        },
        log: true
      },

      getAllReports: {
        realm: true,
        user: true,
        description: "get all available reports",
        method: this.getAllReports,
        schema: {
          type: "object",
          properties: {
            start: { type: "integer", minimum: 0 },
            limit: { type: "integer", minimum: 0, maximum: 100 }
          },
          required: ["start", "limit"]
        }
      },

      getAllGroups: {
        realm: true,
        user: true,
        description: "get all available groups",
        method: this.getAllGroups
      },

      getReportsInProcess: {
        realm: false,
        user: true,
        description: "get all reports in the process",
        method: custom.getReportsInProcess
      },

      generateReport: {
        realm: true,
        user: true,
        description: "Generate report",
        method: this.generateReport
      },

      createCustomizeReport: {
        realm: true,
        user: true,
        description: "Create a report with code from Report Generator on UI",
        method: this.createCustomizeReport,
        schema: {
          type: "object",
          properties: {
            route_id: {
              type: "string",
              minLength: 10,
              maxLength: 36
            },
            filters: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "DP_START",
                  "DP_END",
                  "DTP_START",
                  "DTP_END",
                  "S_GROUP",
                  "S_UNIT",
                  "SY",
                  "SM"
                ]
              }
            },
            descriptionReport: { type: "string", minLength: 1, maxLength: 500 },
            nameReport: { type: "string", minLength: 1, maxLength: 255 }
          },
          required: ["route_id", "descriptionReport", "nameReport"]
        }
      },

      getCode: {
        realm: true,
        user: true,
        description: "Get code from report file by report_id in route record.",
        method: this.getCode,
        schema: {
          type: "object",
          properties: {
            route_id: {
              type: "string",
              format: "uuid",
              minLength: 36,
              maxLength: 36
            }
          },
          reqiured: ["route_id"]
        }
      },

      buildReportCustomizeReport: {
        realm: true,
        user: true,
        description: "Create report with await result, with return logs.",
        method: this.buildReportCustomizeReport
        // schema: {
        //   type: "object",
        //   properties: {
        //     wialonAccountId: {
        //       type: "number",
        //     },
        //     params: {
        //       type: "object",
        //     }
        //   },
        //   reqiured: ["wialonAccountId", "params"]
        // }
      },

      previewReport: {
        realm: true,
        user: true,
        method: ReportProcessing.previewReport,
        description: "Return report data by report_id",
        schema: {
          type: "object",
          properties: {
            report_id: {
              type: "string"
            }
          },
          required: ["report_id"]
        }
      }
    };
  }

  async buildReportCustomizeReport(params, realmId, userId) {
    let res = {};

    const checkAccess = await commonMethods.checkAllowToUser({
      userId,
      route_id: params.params.routeId
    });
    if (checkAccess && checkAccess.length) throw "CERTAINPERMISSIONERROR";

    let result = await custom.make(params, realmId, userId);
    let { logs, success } = result;

    res.logs = logs;
    res.success = success;
    if (success) {
      res.messageCode = "message_report_successfully_generated";
    } else {
      res.messageCode = "message_report_error_generation";
    }

    return res;
  }

  async checkAdmin() {}

  async getCode(data, realmId, userId) {
    try {
      //Step 0 - check if user is an admin
      if (!data || !data.route_id) {
        throw "INVALIDDATA";
      }

      //Step 1 - getReportId from route_id
      const route = await db.route.findOne({
        where: {
          id: data.route_id
        },
        raw: true
      });

      if (route == null) {
        throw "ROUTENOTFOUND";
      }

      const report_id = route.report_id;

      const path = config.custom_reports_dir + "/" + report_id + "/code.js";
      // const isFileExist = await fs.readFile(path);

      // if (!isFileExist) {
      //   throw "FILENOTFOUND";
      // }

      const contentFile = await fs.readFile(path, "utf8");

      return {
        success: true,
        data: {
          file: contentFile,
          route
        }
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async createCustomizeReport(data, realmId, userId) {
    try {
      let isNew = false,
        route,
        report_id,
        requirements = "",
        messageCode = "";
      //Step 0 - check if user is an admin
      const user = await db.user.findOne({
        where: {
          id: userId
        },
        raw: true
      });

      if (user == null) {
        throw "INVALIDDATA";
      }

      const userRole = db.role.findOne({
        where: {
          id: user.role_id
        },
        raw: true
      });

      if (!userRole) {
        throw "INVALIDDATA";
      }

      if (
        (userRole.role != "Admin" || userRole.role != "SuperAdmin") &&
        user.userlevel != 2
      ) {
        throw "ROLEUSERISNOTADMIN";
      }
      // Step 1 - check if exist a route, if not - create, if yes - update;

      if (data.route_id == "NEW_REPORT") {
        data.route_id = uuid.v4();
        report_id = uuid.v4();
        isNew = true;
      } else {
        route = await db.route.findOne({
          where: {
            id: data.route_id
          }
        });
      }

      if (!route && !isNew) {
        throw "ROUTENOTFOUND";
      }

      if (data.filters) {
        requirements = this.parseFilters(data.filters);
      }

      if (isNew) {
        route = await db.route.create({
          id: data.route_id,
          description: data.descriptionReport,
          report_name: data.nameReport,
          organization_id: user.organization_id,
          maker: userId,
          method: "buildReport",
          service: "report-service",
          report_id,
          type: 2, // type 2, mean custom report
          removed: 0,
          ctime: new Date(),
          mtime: new Date(),
          requirements: JSON.stringify(requirements),
          original_requirements: JSON.stringify(data.filters)
        });
        messageCode = "message_report_successfully_added";
      } else {
        await db.route.update(
          {
            description: data.descriptionReport,
            report_name: data.nameReport,
            mtime: new Date(),
            requirements: JSON.stringify(requirements),
            original_requirements: JSON.stringify(data.filters)
          },
          {
            where: {
              id: data.route_id
            }
          }
        );
        messageCode = "message_report_successfully_updated";
      }

      // Step 2 Create a permissions;
      if (isNew) {
        let roles = await db.role.findAll({
          raw: true
        });

        for (let role of roles) {
          let lastNumber = await db.Permissions.findOne({
            attributes: [db.sequelize.fn("MAX", db.sequelize.col("id"))],
            raw: true
          });

          await db.Permissions.create({
            id: lastNumber.max + 1,
            route_id: route.id,
            role_id: role.id,
            organization_id: user.organization_id,
            is_permissible: true,
            ctime: new Date(),
            mtime: new Date(),
            removed: 0,
            maker: user.id
          });
        }
      }

      // Step 3 Create a files in repots and presets_reports folders
      const path = config.custom_reports_dir + "/" + route.get("report_id");

      // const pathToPreset = config.preset_reports_dir + "/" + route.get("report_id");

      if (isNew) {
        // Create a file for reports
        await fs.mkdir(path);
        await fs.mkdir(path + "/results");
        // Create a file for preset (using on CI/CD)
        // await fs.mkdir(pathToPreset);
        // await fs.mkdir(pathToPreset + "/results");
      }
      await this.writeCodeFile(path, data.code);

      // await this.writeCodeFile(pathToPreset, data.code);

      // Step 4 return response;
      return {
        success: true,
        messageCode,
        route_id: route.get("id")
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async writeCodeFile(path, code) {
    await fs.writeFile(path + "/code.js", code);
  }

  parseFilters(filters) {
    let arrResponse = [];
    let preparedRequirements = {
      DTP: {
        type: "DTP",
        name: "{filter_type}Date",
        display: "Select {filter_type} date and time",
        method: null
      },
      DP: {
        type: "DP",
        name: "{filter_type}Date",
        display: "Select {filter_type} date",
        method: null
      },
      TP: {
        type: "TP",
        name: "{filter_type}Date",
        display: "Select {filter_type} time",
        method: null
      },
      S: {
        type: "S",
        name: "{filter_type}",
        display: "Select {filter_type}",
        method: "getAll{filter_type}s",
        service: "report-service",
        items: null
      },
      SY: {
        type: "SY",
        name: "year",
        display: "Select year",
        method: null
      },
      SM: {
        type: "SM",
        name: "month",
        display: "Select month",
        method: null
      }
    };

    for (const filter of filters) {
      const splitedFilter = filter.split("_");
      const type = splitedFilter[0];
      let filter_type = splitedFilter[1] || "";

      const out = { ...preparedRequirements[type] };

      out.name = out.name.replace("{filter_type}", filter_type.toLowerCase());
      if (out.name == "group") out.name += "_name";

      out.display = out.display.replace(
        "{filter_type}",
        filter_type.toLowerCase()
      );

      filter_type = filter_type.toLowerCase();

      out.method = out.method
        ? out.method.replace(
            "{filter_type}",
            filter_type.charAt(0).toUpperCase() + filter_type.slice(1)
          )
        : null;

      arrResponse.push(out);
    }

    return arrResponse;
  }

  // ---- Old code ----------
  async getAllUnits(data, realmId, userId) {
    let responseData = [];
    try {
      responseData = await commonMethods.getAllUnits(data);
      return {
        status: "success",
        data: responseData
      };
    } catch (err) {
      //  responseData = err;
      throw "WIALONLOGINERROR";
    }
  }

  async getAllGroups(data, realmId, userId) {
    let responseData = [];
    try {
      responseData = await commonMethods.getAllGroups(data);
      return {
        status: "success",
        data: responseData
      };
    } catch (err) {
      //  responseData = err;
      throw "WIALONLOGINERROR";
    }
  }

  async updateReportStats(data, realmId, userId) {
    let responseData = [];
    try {
      responseData = await commonMethods.updateReportStats(data);
      return {
        status: "success",
        data: responseData
      };
    } catch (err) {
      //  responseData = err;
      throw "Error Updating report stats";
    }
  }

  async generateReport(params, realmId, userId) {
    await custom.make(params, realmId, userId);
    return true;
  }

  async buildReport(params, realmId, userId) {
    if (!params || !params.report || !params.wialonAccountId || !params.params)
      throw "REQUESTFORMATERROR";

    const checkAccess = await commonMethods.checkAllowToUser({
      userId,
      route_id: params.params.routeId
    });
    if (checkAccess && checkAccess.length) throw "CERTAINPERMISSIONERROR";

    if (params.report == "custom") {
      custom.make(params, realmId, userId);
    }

    return {
      message:
        "Report is being generated and will be available in Generated Reports section in a few minutes.",
      success: true
    };

    // if (!Reports[params.report]) throw "REPORTTYPENOTFOUND";

    // const reportInstance = new Reports[params.report].Report(
    //   params.wialonAccountId,
    //   realmId,
    //   userId
    // );

    // const result = await reportInstance.run(params.params);

    // if (result && result.success) {
    //   result.message =
    //     "Report is being generated and will be available in Generated Reports section in a few minutes.";
    //   result.totalDownloaded = reportInstance.service.totalDownloaded;
    //   result.cpuTime = reportInstance.cpuTime;
    // }

    // return result;
  }

  async buildReportAwait(params, realmId, userId) {
    let arrResponse = [];
    if (!params || !params.wialonAccountId || !params.params)
      throw "REQUESTFORMATERROR";
    let allGroups = await commonMethods.getAllGroups(params);
    for (let itemOfGroup of allGroups) {
      params.params.group_name = itemOfGroup.id;
      let result = await custom.make(params, realmId, userId);
      arrResponse.push(result);
    }
    return arrResponse;
  }

  async getAllReports(params, realm, user, data) {
    let out = Object.keys(Reports).map((key) => {
      return {
        key,
        type: "built-in",
        name: Reports[key].Description.name,
        text: Reports[key].Description.text
      };
    });
    const customReports = await custom.getAll(user, data);
    customReports.res.forEach((item) => {
      out.push({
        key: item.id,
        type: "custom",
        name: item.name,
        text: item.description
      });
    });
    return out;
  }

  async getGroupReport(params, realm, user, data) {
    let responseData = [];
    try {
      responseData = await commonMethods.getAllUnits(data);
      return {
        status: "success",
        data: responseData
      };
    } catch (err) {
      //  responseData = err;
      throw "WIALONLOGINERROR";
    }
  }
}
