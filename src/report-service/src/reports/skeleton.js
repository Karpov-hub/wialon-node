import Base from "../lib/base.js";

const Description = {
  name: "Skeleton report",
  text: "This is base template of report"
};

class Report extends Base {
  getFileName() {
    return `skeleton_report_${Date.now()}.xlsx`;
  }

  async getData(params) {
    let data = await this.callService("core/search_items", {
      spec: {
        itemsType: "avl_unit_group",
        propName: "sys_name",
        propValueMask: "*",
        sortType: "sys_name"
      },
      force: 0,
      flags: 1,
      from: 0,
      to: 0
    });
    return data;
  }

  make(data) {
    const ws = this.addWorksheet("Лист 1");

    ws.column(2).setWidth(20);
    ws.column(1).setWidth(5);
    ws.column(3).setWidth(5);

    let row = 0,
      col = 0;

    data.items.forEach(item => {
      row++;
      col = 1;
      ws.cell(row, col++).string(item.cls);
      ws.cell(row, col++).string(item.nm + "");
      ws.cell(row, col++).string(item.id + "");
    });
  }
}

export default {
  Description,
  Report
};
