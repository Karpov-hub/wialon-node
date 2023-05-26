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
