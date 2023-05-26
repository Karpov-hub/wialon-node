/**
 * @author Vaibhav Mali
 * @scope Server, Client
 * @Date 09 March 2020
 * @private
 */
Ext.define("Crm.modules.reports.model.ReportsModel", {
  extend: "Core.data.DataModel",

  mixins: ["Crm.modules.downloadFunctions.model.downloadFunctions"],
  
  collection: "report_stats",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "organization_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "user_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "route_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "provider_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "status",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "mtime",
      type: "date",
      sort:-1,
      filterable: true,
      editable: true,
      visible: true
    }]

     /*
        @author: Vaibhav Mali
        @date: 09 March 2020
        @function: getData.
    */
    /* scope:server */
    ,getData: function(params, cb){
      var me=this,userFlag=false;
      var util=Ext.create('Crm.Utils.Util',{scope:me});
      params._filters=params._filters ? params._filters : params.filters;        
      params.customFilters={
        eq:["id","provider_id","organization_id"],
        numberFilters:[],
        ilike:[],
        timeFilters:['mtime'],
        foreignFilters:[
            {
                collection:'routes',
                alias:'r',
                eq:[],
                eqCopy:[],                                    
                numberFilters:[],
                numberFiltersCopy:[],
                timeFilters:[],
                timeFiltersCopy:[],
                ilike:['method','description'],
                ilikeCopy:['route_id','route_id'],
                on:' r.id=ip.route_id ',
                join:' inner join '
            },
            {
                collection:'organizations',
                alias:'o',
                eq:[],
                eqCopy:[],                                    
                numberFilters:[],
                numberFiltersCopy:[],
                timeFilters:[],
                timeFiltersCopy:[],
                ilike:['organization_name'],
                ilikeCopy:['organization_id'],
                on:' o.id=ip.organization_id ',
                join:' inner join '
            }
        ]
    };
    params.sqlPlaceHolders=[];
    params.collection=me.collection;
    params.buildWhereSql=" AND ip.status=1 ";
    if(params&&params._sorters&&params._sorters.length){
        if(params._sorters[0]._property=="organization_name"){
            params.orderQuery=" order by o."+params._sorters[0]._property+" "+params._sorters[0]._direction;
        }else if(params._sorters[0]._property=="method" ||
            params._sorters[0]._property=="description"){
            params.orderQuery=" order by r."+params._sorters[0]._property+" "+params._sorters[0]._direction;
        }else{
            params.orderQuery=" order by ip.mtime desc";            
        }
    }else{
        params.orderQuery=" order by ip.mtime desc";            
    }
    util.fetchData(params,function(data){
        cb(data);
    })
  }

});
