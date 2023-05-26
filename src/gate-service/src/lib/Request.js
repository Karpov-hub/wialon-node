/**
 * Class Request incapsules separate request
 */
console.log("NODE_ENV", process.env.NODE_ENV);

import config from "@lib/config";
import Queue from "@lib/queue";
import MemStore from "@lib/memstore";
import ipLib from "ip";
import { ERROR_MESSAGES } from "./Error";
import FileProvider from "@lib/fileprovider";
import CLog from "@lib/clog";
import { log } from "@lib/log";

export default class Request {
  constructor(request, responce, server) {
    // console.log('request = ', request);
    this.request = request;
    this.responce = responce;
    this.requestId = null;
    this.server = server;
  }

  error(code, errorReport, messages) {
    if (this.isSent) return;
    this.isSent = true;
    if (!!errorReport) console.error(errorReport);
    let lang = "EN";
    if (
      this.request.body &&
      this.request.body.header &&
      this.request.body.header.lang
    ) {
      lang = this.request.body.header.lang;
      lang = lang.toUpperCase();
      if (!ERROR_MESSAGES[lang]) lang = "EN";
    }
    const message = Array.isArray(messages)
      ? messages.join("<br>\n")
      : ERROR_MESSAGES[lang][code] || "Undefined";
    const responseBody = {
      header: {
        id: this.requestId,
        status: "ERROR"
      },
      error: {
        code: code,
        message
      }
    };
    this.responce.send(responseBody);
    this.log(true, responseBody);
  }

  send(data) {
    if (this.isSent) return;
    this.isSent = true;
    this.responce.send({
      header: {
        id: this.requestId,
        status: "OK"
      },
      data
    });
  }

  async run() {
    // console.log('this.request = ', this.request);

    const data = this.request.body;

    await CLog.log("request", data);

    //console.log("@@@@@@@@@@@@ REQUEST data="+JSON.stringify(data));
    let server, userId;

    if (!this.checkInputData(data)) return;

    await CLog.log("request:1", this.server);

    if (!this.server.services[data.header.service])
      return this.error("SERVICENOTFOUND:" + data.header.service);
    await CLog.log("request:2");
    if (!this.server.services[data.header.service][data.header.method])
      return this.error(
        "METHODNOTFOUND:" + data.header.service + "." + data.header.method
      );
    await CLog.log("request:3");

    if (this.server.services[data.header.service][data.header.method].realm) {
      server = await this.checkServerPermissions(
        this.request.headers.authorization,
        data.header
      );
      await CLog.log("request:4", !!server);
      if (!server) return;

      if (server.ip && !this.checkRequestIp(server.ip, this.request))
        return this.error("ACCESSDENIEDFORIP");
    }
    await CLog.log("request:5");
    if (this.server.services[data.header.service][data.header.method].user) {
      userId = await this.checkUserPermissions(data);
      if (!userId) {
        return this.error("ACCESSDENIED");
      }
    }
    await CLog.log("request:6");
    if (this.server.services[data.header.service][data.header.method].schema) {
      const validateResult = this.validateSchema(
        data,
        this.server.services[data.header.service][data.header.method].schema
      );
      if (validateResult !== true) {
        let validateMessage;
        if (Array.isArray(validateResult)) {
          validateMessage = validateResult.map((el) => el.stack);
        }
        return this.error("INVALIDSCHEMA", null, validateMessage);
      }
    }
    await CLog.log("request:7");
    if (data.data && data.data.files && Array.isArray(data.data.files)) {
      data.data.files = await this.prepareFiles(data.data.files);
    }
    if (!data.data) {
      data.data = {};
    }

    data.data.lang = data.header.lang;
    const resultData = await this.doJob(
      data.header.service,
      data.header.method,
      data.data,
      server ? server.id : null,
      userId
    );
    await CLog.log("request:8:", resultData);

    if (resultData) {
      if (data.data && data.data.files) {
        await FileProvider.accept(data.data.files);
      }
      this.send(resultData);
      this.log(false, resultData);
    } else {
      if (data.data && data.data.files)
        await this.removeTemplatedFiles(data.data.files);
    }
  }
  detectTags(data) {
    return /<[a-z]{1,}[^>]{0,}>/i.test(JSON.stringify(data));
  }

  validateSchema(data, schema) {
    if (this.detectTags(data.data) && !schema.tagsAllowed)
      return this.error("TAGDETECTED");

    const res = this.server.schemaValidator.validate(
      data.data,
      schema
      //"/" + data.header.service + "_" + data.header.method
    );
    if (!res.errors || !res.errors.length) return true;
    return res.errors;
  }

  checkRequestIp(allowedIP, request) {
    const ip =
      request.headers["x-forwarded-for"] || request.connection.remoteAddress;
    if (!ip) return false;
    // return ipLib.isEqual(ip, allowedIP);
    return true;
  }

  checkInputData(data) {
    // Need to add but with carrefull a testing all of functionality
    // if (!data || typeof data !== "object" || typeof data.data !=="object" ||!this.checkHeader(data.header))
    //   return this.error("INPDATAFORMAT");
    if (!data || typeof data !== "object" || !this.checkHeader(data.header))
      return this.error("INPDATAFORMAT");

    if (!this.checkVersion(data.header.version)) return this.error("VERSION");

    return true;
  }

  checkHeader(header) {
    if (!header) return false;
    if (!header.version) return false;
    if (!header.service) return false;
    if (!header.method) return false;

    //Default Lang
    if (!header.lang) header.lang = "RU";

    this.requestId = header.id;
    return true;
  }

  checkVersion(version) {
    return config.apiVersion == version;
  }

  async checkServerPermissions(token, header) {
    const serverObject = await this.checkServerToken(token || "");
    if (
      serverObject &&
      this.checkServicePermissions(serverObject, header.service, header.method)
    ) {
      return serverObject;
    }

    return this.error("SERVERACCESSDENIED");
  }

  checkServicePermissions(server, service, method) {
    return (
      server.permissions &&
      server.permissions[service] &&
      server.permissions[service][method]
    );
  }

  async checkServerToken(token) {
    let serverObject, res;
    const tokenCode = token.substr(6);
    // try {
    //   res = await MemStore.get(`srv${tokenCode}`);
    //   serverObject = JSON.parse(res);
    // } catch (e) {
    //   return false;
    // }
    if (!serverObject) {
      serverObject = await this.getServerByToken(tokenCode);

      if (serverObject) {
        await MemStore.set(`srv${tokenCode}`, JSON.stringify(serverObject));
      }
    }
    return serverObject || false;
  }

  // get server id by token in db
  async getServerByToken(token) {
    const resultData = await this.doJob("auth-service", "getServerByToken", {
      token
    });

    if (!resultData || !resultData.id) return null;
    return resultData;
  }

  async checkUserPermissions(data) {
    // check authorized user by token
    let userId;
    if (data && data.header && data.header.token) {
      userId = await MemStore.get(`usr${data.header.token}`);
      if (userId) {
        await MemStore.set(`usr${data.header.token}`, userId, 1200); // Refresh token 1200second i.e. 20min
      }
    }
    return userId;
  }

  async doJob(service, method, data, realmId, userId) {
    const res = await Queue.newJob(service, { method, data, realmId, userId });

    if (res.error) {
      this.error(res.error);
      return null;
    } else {
      return res.result;
    }
  }

  //this method prepare files
  //he need structure
  // files: [
  //   {
  //     name: "avatar.png",
  //     data: file_data
  //   }
  // ]
  //sус
  // async prepareFiles(data) {
  //   if (!data.data || !data.data.files || !Array.isArray(data.data.files))
  //     return;
  //   try {
  //     for (let i = 0; i < data.data.files.length; i++) {
  //       data.data.files[i].data = await FileProvider.push(
  //         data.data.files[i],
  //         config.new_file_hold_timeout || 300
  //       );
  //     }
  //   } catch (e) {
  //     this.error("FILEUPLOADERROR");
  //   }
  // }
  async prepareFiles(files) {
    let fileData,
      out = [];
    try {
      for (let i = 0; i < files.length; i++) {
        fileData = await FileProvider.push(
          files[i],
          config.new_file_hold_timeout || 300
        );
        if (fileData && fileData.success) {
          out.push({
            name: files[i].name,
            code: fileData.code,
            size: fileData.size
          });
        }
      }
    } catch (e) {
      console.log("e:", e);
      this.error("FILEUPLOADERROR");
    }
    return out;
  }

  async removeTemplatedFiles(files) {
    for (let i = 0; i < files.length; i++) {
      await FileProvider.del(files[i].data);
    }
  }

  async log(error, response) {
    const userId = await this.checkUserPermissions(this.request.body);
    const { headers, body } = this.secureBodyAndHeaders();
    const securedResponse = this.secureResponse(response);
    const reqHeader = body ? body.header : null;
    const reqService = reqHeader ? reqHeader.service : null;
    const reqMethod = reqHeader ? reqHeader.method : null;
    const serviceExists = this.server.services[reqService] ? reqService : null;
    const methodExists = serviceExists
      ? this.server.services[reqService][reqMethod]
        ? reqMethod
        : null
      : null;
    // const level = error ? "error" : "http";

    const method =
      reqService &&
      reqMethod &&
      this.server.services[reqService] &&
      this.server.services[reqService][reqMethod]
        ? this.server.services[reqService][reqMethod]
        : false;

    const errorCode = response
      ? response.error
        ? response.error.code
        : null
      : null;

    const message = error
      ? `Error: ${
          method ? method.description : "Wrong http request"
        } [${errorCode}]`
      : `Success: ${method ? method.description : null}`;

    if (error || (method && method.log))
      log(message, null, {
        level: "http",
        details: {
          requestId: this.requestId,
          request: {
            headers,
            body
          },
          response: securedResponse
        },
        profile: userId,
        process: serviceExists,
        method: methodExists
      });
  }

  secureBodyAndHeaders() {
    const body = JSON.parse(JSON.stringify(this.request.body));
    const headers = JSON.parse(JSON.stringify(this.request.headers));

    if (headers.authorization) headers.authorization = "Bearer***";

    if (
      body.data &&
      this.server &&
      this.server.services &&
      this.server.services[body.header.service] &&
      this.server.services[body.header.service][body.header.method] &&
      this.server.services[body.header.service][body.header.method].schema &&
      this.server.services[body.header.service][body.header.method].schema
        .properties
    ) {
      const props = this.server.services[body.header.service][
        body.header.method
      ].schema.properties;

      maskBody(body.data);

      function maskBody(data) {
        for (const [key, value] of Object.entries(props)) {
          if (value.secure && data[key]) data[key] = "***";
        }
      }
    }
    return { headers, body };
  }

  secureResponse(resBody) {
    const res = JSON.parse(JSON.stringify(resBody));
    const body = this.request.body;
    if (
      body &&
      body.header &&
      this.server &&
      this.server.services &&
      this.server.services[body.header.service] &&
      this.server.services[body.header.service][body.header.method] &&
      this.server.services[body.header.service][body.header.method]
        .secureResponse
    ) {
      const resSchema = this.server.services[body.header.service][
        body.header.method
      ].secureResponse;

      maskResponse(res, resSchema);

      function maskResponse(data, schema) {
        for (const [key, value] of Object.entries(schema)) {
          if (
            typeof value === "object" &&
            data[key] &&
            typeof data[key] === "object"
          )
            maskResponse(data[key], value);
          else if (data[key] && value === true) data[key] = "***";
        }
      }
    }
    return res;
  }
}
