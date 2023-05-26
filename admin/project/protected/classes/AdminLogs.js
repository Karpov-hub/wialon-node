const db = require("@lib/db");

Ext.define("Crm.classes.AdminLogs", {
  noLogMethods: [],
  noLogModels: ["Crm.modules.support.view.SupportGrid"],

  async logPush(data, result, saveOld = false) {
    const admin_id =
      (data && data.data && data.data._admin_id) || (data && data._admin_id);
    const oldRecord = {};

    if (this.noLogModels.includes(data.model)) {
      return;
    }

    if (saveOld) {
      oldRecord.result = await this.getOldRecord(data);
    }

    if (!this.noLogMethods.includes(data.method))
      await db.admin_logs.create({
        date: new Date(),
        data: saveOld ? oldRecord.result : data,
        result: saveOld ? data : result,
        admin_id
      });
  },

  async getOldRecord(data) {
    if (data && data.model && (data.id || data._id)) {
      const Model = Ext.create(data.model);
      const Collection = Model.collection;
      const idField = Model.idField || "id";
      const oldRecord = await db.sequelize.query(
        `select * from ${Collection} where ${idField || "id"} = :id `,
        {
          replacements: { id: data[idField] || data.id },
          raw: true,
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return oldRecord;
    }
    return {};
  }
});
