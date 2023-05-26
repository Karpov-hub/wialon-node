const _PATH = `${__dirname}/../../../docs/index.pug`;
const _HTML_PATH = `${__dirname}/../../../docs/index.html`;
const _JSON_PATH = `${__dirname}/../../../docs/json`;
const _TESTS_PATH = `${__dirname}/../../../src/gate-service/test/services`;
const _SERVICES_PATH = `${__dirname}/../../../src`;
const _SWAGGER_PATH = `${__dirname}/../../../docs/swagger.json`;

const pug = require("pug");
const fs = require("fs");
const acquit = require("acquit");

let SERVICES = {};

let RESULT = {};
let itIndex = 0;
let services = [];

function readServices() {
  const out = {};
  fs.readdirSync(_SERVICES_PATH).forEach((dir) => {
    let package = JSON.parse(
      fs.readFileSync(_SERVICES_PATH + "/" + dir + "/package.json").toString()
    );
    const cls = getService(_SERVICES_PATH + "/" + dir);
    if (cls) out[package.name] = cls;
  });
  return out;
}

function getService(path) {
  if (!fs.existsSync(`${path}/dist/Service.js`)) return null;
  const cls = require(`${path}/dist/Service.js`);
  const instance = new cls.default({});
  const methods = instance.publicMethods();
  delete instance;
  return methods;
}

function prepareTestContent(content) {
  let out = [];
  content.split("\n").forEach((s) => {
    if (!/^import/.test(s)) {
      out.push(s);
    }
  });
  return out.join("\n");
}

function code(obj) {
  return JSON.stringify(obj, null, 4);
}

function addResultRecord(test, reqData) {
  const service = reqData.request.body.header.service;
  const method = reqData.request.body.header.method;

  if (!RESULT[service]) RESULT[service] = {};
  if (!RESULT[service][method]) RESULT[service][method] = [];

  RESULT[service][method].push({
    title: test.contents,
    comments: test.comments,
    requestHeaders: code(reqData.request["http-headers"]),
    request: code(reqData.request.body),
    responseHeaders: code(reqData.response["http-headers"]),
    response: code(reqData.response.body)
  });
}

function readParsedTest(arr, reqres) {
  arr.forEach((item) => {
    if (item.type == "it") {
      if (reqres[itIndex]) {
        addResultRecord(item, reqres[itIndex]);
        itIndex++;
      }
    } else {
      readParsedTest(item.blocks, reqres);
    }
  });
}

function prepareRequests(reqres, fileName) {
  let testName = fileName.split(".")[0];
  let content = prepareTestContent(
    fs.readFileSync(_TESTS_PATH + "/" + testName + ".js").toString()
  );
  itIndex = 0;
  const ret = acquit.parse(content);
  readParsedTest(ret, reqres);
}

function getSchema(service, method) {
  const conf = SERVICES[service][method];
  if (!conf || !conf.schema)
    return {
      type: "object",
      properties: {},
      required: []
    };
  return conf.schema;
}

SERVICES = readServices();

fs.readdirSync(_JSON_PATH).forEach((file) => {
  let content = JSON.parse(fs.readFileSync(_JSON_PATH + "/" + file).toString());
  prepareRequests(content.data, file);
});

Object.keys(RESULT).forEach((serviceName) => {
  let service = { name: serviceName, methods: [] };
  Object.keys(RESULT[serviceName]).forEach((methodName) => {
    service.methods.push({
      name: methodName,
      blocks: RESULT[serviceName][methodName]
    });
  });
  services.push(service);
});

const html = pug.renderFile(_PATH, {
  pretty: true,
  services
});

fs.writeFileSync(_HTML_PATH, html);

const swagger = require(`${__dirname}/../../../docs/swagger_tpl.json`);
swagger.paths = {};

services.forEach((service) => {
  swagger.tags.push({
    name: service.name,
    description: ""
  });
  service.methods.forEach((method) => {
    const path = `/rest/${service.name}/${method.name}`;
    const data = method.blocks[0];
    const body = JSON.parse(data.request);
    const schema = getSchema(service.name, method.name);
    let example = {};
    let exampleResponse = {};

    //method.blocks.forEach((block) => {
    if (method.blocks && method.blocks[0]) {
      let block = method.blocks[0];
      const data = JSON.parse(block.request);
      const rdata = JSON.parse(block.response);

      example = {
        summary: block.title,
        schema: {
          type: schema.type,
          example: data.data,
          properties: schema.properties,
          required: schema.required
        }
      };
      exampleResponse = {
        schema: {
          type: "object",
          example: rdata.data
        }
      };
    }
    //});

    let parameters = [
      {
        in: "header",
        name: "authorization",
        schema: {
          type: "string"
        },
        value: "bearer32c2f6be17a228de424a85c9be3851d1613144ae03cf76510e8",
        required: true
      },
      {
        in: "query",
        name: "id",
        schema: { type: "string" },
        required: true,
        value: body.header.id,
        description: "Request ID"
      },
      {
        in: "query",
        name: "version",
        schema: { type: "string" },
        required: true,
        value: body.header.version,
        description: "API current version"
      }
    ];

    if (body.header.token)
      parameters.push({
        in: "query",
        name: "token",
        schema: { type: "string" },
        required: true,
        value: body.header.token,
        description: "User's token"
      });

    swagger.paths[path] = {
      post: {
        tags: [service.name],
        summary: data.title,
        description: data.comments.join(" "),
        produces: ["application/json"],
        parameters,
        requestBody: {
          content: {
            "application/json": example
          }
        },
        responses: {
          "200": {
            content: {
              "application/json": exampleResponse
            }
          }
        }
      }
    };
  });
});

fs.writeFileSync(_SWAGGER_PATH, JSON.stringify(swagger));
console.log("fin");
process.exit(0);
