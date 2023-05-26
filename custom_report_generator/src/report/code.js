const Base = require("../lib/base");

class Report extends Base {
  async getData(params) {
    console.log("params:", params);

    const opt = {
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
    let unitsData = await this.callService("core/search_items", opt);

    //console.log("unitsData:", unitsData);

    return unitsData.items;
  }

  make(data) {
    const ws = this.addWorksheet("Лист 1");
    let tm = Date.now();
    //let x = 1;
    //for (let i = 0; i < 100000000; i++) x = Math.random();
    //console.log("time:", Date.now() - tm);

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

module.exports = Report;
