/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * @Date 03 March 2020
 * @private
 */
Ext.define("Crm.modules.organizations.model.OrganizationsComboModel", {
  extend: "Core.data.DataModel",
  /* scope:server */
  getData: function (params, cb) {
    var me = this, sql, sqlPlaceholders = [];
    sql = 'select * from organizations where removed !=1 ';
    if (params._filters && params._filters[0] && params._filters[0]._value != undefined) {
      sqlPlaceholders.push(('%' + params._filters[0]._value + '%'));
      sql += ' and (organization_name ilike $' + sqlPlaceholders.length + ' ) ';
    }
    sql += ' limit 100 ';
    me.src.db.query(sql, sqlPlaceholders, function (err, data) {
      if (data && data.length > 0)
        cb({ total: data.length, list: data }, null)
      else
        cb({ total: 0, list: [] }, null)
    })
  }
 
});
