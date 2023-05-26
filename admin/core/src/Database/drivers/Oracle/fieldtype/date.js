/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.date
 * @extend Database.drivers.Mysql.fieldtype.date
 * Date field. Use date field in the form for this data type.
 */
Ext.define('Database.drivers.Oracle.fieldtype.date', {
    extend: 'Database.drivers.Mysql.fieldtype.date'

    ,createField: function(field, collection, db, callback) {
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " DATETIME NULL DEFAULT NULL");
    }
    
    ,getFilterValue: function(mdl, filter, name, cb) {

        if(filter) {
            var 
                param = {},
                operator = filter.operator || filter._operator;
                
            param[filter.property] = {};
            if(operator)
                param[filter.property]['$' + operator] = Ext.Date.format(new Date(filter.value), 'd-M-Y');
            else
                param[filter.property] = Ext.Date.format(new Date(filter.value), 'd-M-Y');
            cb(param)
        } else
            cb()
    }
})