# Custom reports

## How it works

1. There is a docker image with nodejs base class of report. Tagname of the image is "customreport".
2. Each custom report has a particular folder in reports catalogue. Path of the report catalogue is in config param "custom_reports_dir". A name of a report folder is same as id of the report row in the DB table "customreports".
3. The report folder contains file "code.js" with js class of particular report and folder "results" for saved xlsx files.
4. When user calls API to generate report, system creates a new container based on the image (see item 1 of this list), mounts folder of the report as local dir in the container and start the container (see ./lib/custom.js strings 127-145).
5. The system calls method stats for the docker container (string 146). Result of stats contains info about cpu, memory and network usage.
6. Report XLSX file is saved in folder results and the system sends it into file provider service.
7. System removes container and xlsx file from results folder.

## Custom report JS code

An example of custom report you can see in ./test/asset/custom_report.js

```javascript
// The report code should contain just class Report axtends of Dase
// You can use standard node libs such as fs. Use "require" syntax for includes

class Report extends Base {
  // Asyn method for getting information from wialon servers
  async getData(params) {
    var params = {
      spec: {
        itemsType: "avl_unit_group",
        propName: "sys_name",
        propValueMask: "*",
        sortType: "sys_name",
      },
      force: 0,
      flags: 1,
      from: 0,
      to: 0,
    };
    let unitsData = await this.callService("core/search_items", params);

    return unitsData.items;
  }

  // Syncronouse method for generating XLSX file
  make(data) {
    const ws = this.addWorksheet("Лист 1");
    let x;
    for (let i = 0; i < 10000000; i++) x = Math.random();

    const style = this.wb.createStyle({
      font: {
        size: 12,
      },
    });
    let row = 1;

    data.forEach((item) => {
      ws.cell(row, 1)
        .string(item.nm)
        .style(style);
      ws.cell(row, 2)
        .number(item.id)
        .style(style);
      ws.cell(row, 3)
        .number(item.cls)
        .style(style);
      ws.cell(row, 4)
        .number(item.uacl)
        .style(style);

      row++;
    });
  }
}
```

## API methods

There are 5 api methods for manage of custom reports.

### buildCustom

Create a new custom report

```javascript
data: {
    name: "custom report",
    description: "custom report description",
    codeInBase64: true,
    code: Buffer.from("class Report exists Base {...").toString("base64"),
}
```

### updateCustom

Update exists

```javascript
data: {
    id: <UUID of the report>,
    name: "custom report",
    description: "custom report description",
    codeInBase64: true,
    code: Buffer.from("class Report exists Base {...").toString("base64"),
}
```

### getAllReports

Gel available reports list

```javascript
data: {
}
```

### buildReport

Generate XLSX file

```javascript
data: {
    report: "custom",
    report_id: <UUID of the report>,
    wialonAccountId: <ID of wialon account in the database>,
    params: {  // extra params
        routeId: "00c07ba3-580a-4a5b-b699-b53f737a3bca",
        startDate: "2020-02-03T06:30:00.000Z",
        endDate: "2020-02-06T06:30:00.000Z",
        unit: 19929450,
    }
}
```

### removeCustom

Delete exists report

```javascript
data: {
    id: <UUID of the report>
}
```

## How to edit base class in docker

There is folder "custom_report_generator" in the root directory of the platform.
Export next environments:

```
export NODE_TLS_REJECT_UNAUTHORIZED=0
export wialon_outfile=myfile.xlsx
export organization_id=...
export wialon_hosting_url=...
export wialon_token=...
export wialon_username=...
```

Catalogue "custom_report_generator/src/report" contains an example of the custom report class and folder "results" for xlsx rusult files.
Run report building for developing (you are in custom_report_generator):

```
node src/index
```

You can build docker image locally for local tests:

```
docker build -t customreport .
```

## ToDo

1. There is an information of utilizated sources in custom.js (string 147). Save it into database table.
2. Check tests, vesta report doesn't work
3. I think it would be nice to transfer the generation of all reports to docker.
