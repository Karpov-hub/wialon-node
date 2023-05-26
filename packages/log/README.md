# Distributed logs

## Attention
We're using the distributed storage for the console logs. Please, make sure that your log messages doesn't contain any sensitive data, like personal information, transaction details, hidden environment variables, access keys etc.

## Description

The library permits to collect and store logs output in distributed ways:
- console logs
- log files with rotation
- remote graylog instance
- mongo DB

## Usage

1. Usual console outputs, like console.log, console.warn and console.error will be automatically captured in every service and libraries, imported to a service. If you create a new service, first make sure that the log capture function is imported and called in the service declaration:

```
import Service from "./Service";
import { capture } from "@lib/log"; // import capture function
const service = new Service({ name: "skeleton" });
service.run();
capture(); // call the capture for console logs
```

2. Advanced logging (recommended).
Importing the log function and using it directly allows to store the additional information.

```javascript
import { log } from "@lib/log";

function logUserInfo(data, realm, id) {
  log("Dummy message", arguments)
}
```

You are required to pass the service function arguments to collect the:
- method name
- profile and credential ids - if the user is logged in
- realm id
If you call log function outside a service method, just pass null as the second log function agruments.

As a third argument, you may pass the additional options object, if you are required to:
```javascript
log("Log message", null, {
  level: "warn", // "info", "warn", "error" levels, info level is set up by the default
  details: {}, // any additional information to store
})
```

## Log message structure example

```javascript
{
  level: 'info',
  message: {
    app: 'Novatum',
    env: 'localtest',
    message: 'User is logged in',
    level: 'info',
    server_ip: '172.26.66.137',
    timestamp: 2022-10-27T09:53:29.676Z,
    details: {
      id: '35b57050-55dd-11ed-8371-31d2e375a9aa',
      owner: '35b37480-55dd-11ed-8371-31d2e375a9aa',
      tariff: null,
      variables: null,
      type: null,
      email: 'personal@yy.tt',
      first_name: null,
      ...
    },
    realm: '345da880-55dd-11ed-abbb-456a50e24af1',
    profile: '35b57050-55dd-11ed-8371-31d2e375a9aa',
    process: 'auth-service',
    method: 'getProfile',
    client_ip: '127.0.0.1',
    credential: '35b37480-55dd-11ed-8371-31d2e375a9aa'
  },
  timestamp: '2022-10-27T09:53:29.677Z'
}
```

## Configuration

In your @lib/config environment file, you can find the setup:

```javascript
exports.log = {
  folder: "internal", // Internal - store log folder inside project root. External - in the project's parent folder.
  storagePeriod: "30d", // Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. It uses auditFile to keep track of the log files in a json format. It won't delete any file not contained in it. It can be a number of files or number of days (default: null)
  fileMaxSize: "1m", // Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. (default: null)
  transports: {
    file: true,
    graylog: false,
    mongo: true
  }
};
```

Default configurations:
- All transports, except console (which is can't be deactivated by the default) are disabled for all of the environments except staging and the production.
- Folder for log files storage is external for the staging and the production
- Log files storage period is 90 days for the production and 30 days for the staging
- Max log file size is 1MB in all of the cases

## TODO

- Set up distant server for graylog 
- Set up AWS Elasticsearch instance for graylog
- Decide where to store mongodb logs (currently it's free Atlas cluster)
- Inspect the necessity in encryted channel for sending the logs
- Log input for the frontend errors reporting
- Fix: gate-service errors doesn't contain error stack, when a string is thrown instead of a new Error
