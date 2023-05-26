/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.date
 * @extend Database.drivers.Mysql.fieldtype.date
 * Date field. Use date field in the form for this data type.
 */
Ext.define('Database.drivers.Postgresql.fieldtype.date', {
    extend: 'Database.drivers.Mysql.fieldtype.date'

    ,createField: function(field, collection, db, callback) {
        callback("ALTER TABLE " + collection + " ADD " + this.getDbFieldName(field) + " DATE");
    }
    
    ,getFilterValue: function(mdl, filter, name, cb) {
        if(
            filter && 
            filter.value && 
            (
                /^[0-9.]{10}$/.test(filter.value) || 
                /^[0-9.]{10}-[0-9.]{10}$/.test(filter.value)
            )
        ) {
    
            var val = filter.value.split('-'),
                //val = new Date(Ext.Date.parse(filter.value,'d.m.Y')),
                param = {},
                operator = filter.operator || filter._operator;
            
            if(val[1]) {
                val[1] = new Date(Ext.Date.parse(val[1].trim(),'d.m.Y'))
                if(val[1] == 'Invalid Date')
                    val.splice(1,1)
            }
            if(val[0]) {
                val[0] = new Date(Ext.Date.parse(val[0].trim(),'d.m.Y'))
                if(val[0] == 'Invalid Date')
                    val.splice(0,1)
            }           
            
            if(val.length == 2 && val[0] && val[1]) {
                param['$and'] = [{},{}]
                param['$and'][0][filter.property] = {$gte:Ext.Date.format(val[0], 'Y-m-d')}
                param['$and'][1][filter.property] = {$lte:Ext.Date.format(val[1], 'Y-m-d')}                
            } else
            if(val.length == 1 && val[0]) {
       
                param['$and'] = [{},{}]
                param['$and'][0][filter.property] = {$gte:Ext.Date.format(val[0], 'Y-m-d')}
                param['$and'][1][filter.property] = {$lt:Ext.Date.format(new Date(val[0].getTime() + 86400000), 'Y-m-d')}
            } else
                return cb()

            cb(param)
        } else
            cb()
    }
})