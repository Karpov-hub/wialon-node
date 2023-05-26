Ext.define('Crm.Utils.Util',{
    extend: "Core.Controller",

    /*
        @author: Vaibhav Mali
        @date: 07 March 2020
        @function: getObjectId.
    */
    getObjectId:function(cb){
        return this.src.db.createObjectId(this.collection, cb);
    }

  /*
        @author: Vaibhav Mali
        @date: 19 March 2020
        @function: generateRandomString.
    */
    ,generateRandomString:function(len){
        len=len||5
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return this.generateRandom(len,possible);
    }

    /*
        @author: Vaibhav Mali
        @date: 19 March 2020
        @function: generateRandom.
    */
    ,generateRandom:function(len,possible){
        var text = "";
        for( var i=0; i < len; i++ ){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /*
        @author: Vaibhav Mali
        @date: 20 March 2020
        @function: encrypt.
    */
    ,encrypt:function(str){
        var me=this;
        var crypto = require('crypto');
        return crypto.createHash(me.config.hashtype).update(str).digest('hex');
    }

      /*
    @author: Vaibhav Mali
    @date: 09 March 2020
    @function: fetchData.
    @ReqData Example:
      params.customFilters={
            eq:[],
            numberFilters:['balance'],
            ilike:['card_number'],
            timeFilters:[],    
            foreignFilters:[
                {
                    collection:'merchant_wallets',
                    alias:'wt',
                    eq:[],
                    eqCopy:['wallet_id'],                
                    numberFilters:[],
                    numberFiltersCopy:[],
                    ilike:['wallet_name'],
                    ilikeCopy:['wallet_id'],
                    timeFilters:[],              
                    timeFiltersCopy:[],    
                    on:' wt._id=ip.wallet_id ',
                }
            ]
        };
        params.sqlPlaceHolders=[];
        params.collection='merchant_cards';
    */ 
    
     /* scope:server */
     ,fetchData: function(params, cb){
        var me=this;
        var offsetSql = " offset " + parseInt(params._start ) + " rows fetch next " + parseInt(params._limit) + " ROWS ONLY "
        var whereSql=" where ip.removed!=1 "+params.buildWhereSql||"";
        var selectSql="",countSql="",numberIndex;
        var filters=params.customFilters||[],sqlPlaceHolders=params.sqlPlaceHolders||[];
        var k=0,j=0,matchFlag=false,startFlag=false,numberFlag=false,eqIndex,ilikeIndex;
        me.generateSelectQuery(((params.customFilters&&params.customFilters.foreignFilters
            &&params.customFilters.foreignFilters.length)?
            params.customFilters.foreignFilters:[]),params.collection,function(res){
            countSql=res.countSql; selectSql=res.selectSql;
            params._filters=params._filters ? params._filters : params.filters;
            if(params && params._filters && params._filters.length>0){
                if(params._filters[0].property){
                    for(var i=0;i<params._filters.length;i++){
                        params._filters[i]._property = params._filters[i]._property ? params._filters[i]._property : params._filters[i].property;
                        params._filters[i]._value = params._filters[i]._value ? params._filters[i]._value : params._filters[i].value;
                    }
                }
                for(var i=0;i<params._filters.length;i++){
                    if(params._filters[i]._property=="query"){
                        if(filters&&filters.eq.length){
                            sqlPlaceHolders.push(params._filters[i]._value); 
                            eqIndex=sqlPlaceHolders.length;
                        }
                        if(filters&&filters.ilike.length){
                            sqlPlaceHolders.push(('%'+params._filters[i]._value+'%'));
                            ilikeIndex=sqlPlaceHolders.length;
                        }
                        if(parseInt(params._filters[i]._value.replace ( /[^\d.]/g, '' )||0)){
                            sqlPlaceHolders.push(parseInt(params._filters[i]._value.replace ( /[^\d.]/g, '' ))); 
                            numberFlag=true
                            numberIndex=sqlPlaceHolders.length;                        
                        }
                        if(filters.foreignFilters&&filters.foreignFilters.length){
        
                            for(j=0;j<filters.foreignFilters.length;j++){
                                if(!eqIndex&&filters.foreignFilters[j].eq&&filters.foreignFilters[j].eq.length){
                                    sqlPlaceHolders.push(params._filters[i]._value); 
                                    eqIndex=sqlPlaceHolders.length;
                                }
                                if(!ilikeIndex&&filters.foreignFilters[j].ilike&&filters.foreignFilters[j].ilike.length){
                                    sqlPlaceHolders.push(('%'+params._filters[i]._value+'%'));
                                    ilikeIndex=sqlPlaceHolders.length;
                                }
                            }    
        
                            for(j=0;j<filters.foreignFilters.length;j++){
                             
                                for(k=0;k<filters.foreignFilters[j].eq.length;k++){
                                    if(startFlag){whereSql+=' OR ';}else{startFlag=true;whereSql+=' AND ( ';}
                                    whereSql+=filters.foreignFilters[j].alias+".";
                                    whereSql+=filters.foreignFilters[j].eq[k];
                                    whereSql+=" = $"+eqIndex;
                                }
        
                                for(k=0;k<filters.foreignFilters[j].ilike.length;k++){
                                    if(startFlag){whereSql+=' OR ';}else{startFlag=true;whereSql+=' AND ( ';}
                                    whereSql+=filters.foreignFilters[j].alias+".";
                                    whereSql+=filters.foreignFilters[j].ilike[k];
                                    whereSql+=" ilike $"+ilikeIndex;
                                }
        
                                if(filters.foreignFilters[j].numberFilters&&filters.foreignFilters[j].numberFilters.length&&parseInt(params._filters[i]._value.replace ( /[^\d.]/g, '' ))){
                                    for(k=0;k<filters.foreignFilters[j].numberFilters.length;k++){
                                        if(startFlag){whereSql+=' OR ';}else{startFlag=true;whereSql+=' AND ( ';}
                                        whereSql+=filters.foreignFilters[j].alias+".";
                                        whereSql+=filters.foreignFilters[j].numberFilters[k];
                                        whereSql+=" = $"+numberIndex;
                                    }
                                }
        
                            }
                        }
                        if(filters.eq&&filters.eq.length){
                            for(k=0;k<filters.eq.length;k++){
                                if(startFlag){whereSql+=' OR ';}else{startFlag=true;whereSql+=' AND ( ';}
                                whereSql+=" ip."+filters.eq[k];
                                whereSql+=" = $"+eqIndex;
                            }
                        }
                        if(filters.numberFilters&&filters.numberFilters.length&&parseInt(params._filters[i]._value.replace ( /[^\d.]/g, '' ))){
                            for(k=0;k<filters.numberFilters.length;k++){
                                if(startFlag){whereSql+=' OR ';}else{startFlag=true;whereSql+=' AND ( ';}
                                whereSql+=" ip."+filters.numberFilters[k];
                                whereSql+=" = $"+numberIndex;
                            }
                        }
                        if(filters.ilike&&filters.ilike.length){
                            for(k=0;k<filters.ilike.length;k++){
                                if(startFlag){whereSql+=' OR ';}else{startFlag=true;whereSql+=' AND ( ';}
                                whereSql+=" ip."+filters.ilike[k];
                                whereSql+=" ilike $"+ilikeIndex;
                            }
                        }
                        if(startFlag){whereSql+=" ) "}
                    }else{
                        matchFlag=false;
                        if(filters.ilike&&filters.ilike.length){
                            for(k=0;k<filters.ilike.length;k++){
                                if(params._filters[i]._property==filters.ilike[k]){
                                    matchFlag=true;
                                    whereSql+=" AND ip."+filters.ilike[k];
                                    sqlPlaceHolders.push(('%'+params._filters[i]._value+'%'));
                                    whereSql+=" ilike $"+sqlPlaceHolders.length;
                                    break;
                                }
                            }
                        }
                        if(filters.eq&&filters.eq.length){
                            for(k=0;k<filters.eq.length;k++){
                                if(params._filters[i]._property==filters.eq[k]){
                                    matchFlag=true;
                                    whereSql+=" AND ip."+filters.eq[k];
                                    sqlPlaceHolders.push(params._filters[i]._value);
                                    whereSql+=" = $"+sqlPlaceHolders.length;
                                    break;
                                }
                            }
                        }
                        if(filters.numberFilters&&filters.numberFilters.length){
                            for(k=0;k<filters.numberFilters.length;k++){
                                if(params._filters[i]._property==filters.numberFilters[k]){
                                    matchFlag=true;
                                    whereSql+=" AND ip."+filters.numberFilters[k];
                                    sqlPlaceHolders.push(params._filters[i]._value);
                                    whereSql+=" = $"+sqlPlaceHolders.length;
                                    break;
                                }
                            }
                        }
                        if(filters.timeFilters&&filters.timeFilters.length){
                            for(k=0;k<filters.timeFilters.length;k++){
                                if(params._filters[i]._property==filters.timeFilters[k]){
                                    matchFlag=true;
                                    whereSql+=" AND ip."+filters.timeFilters[k];
                                    var dateValue= (new Date(params._filters[i]._value).getMonth()+1)+
                                    "-"+(new Date(params._filters[i]._value).getDate())+
                                    "-"+(new Date(params._filters[i]._value).getFullYear());
                                    if(params._filters[i]._operator=="gt"){
                                        sqlPlaceHolders.push(dateValue+"T00:00:00.000Z")
                                        whereSql+=" >= $"+(sqlPlaceHolders.length)+" ";
                                    }else if(params._filters[i]._operator=="gte"){
                                        sqlPlaceHolders.push(dateValue+"T00:00:00.000Z")
                                        whereSql+=" >= $"+(sqlPlaceHolders.length)+" ";
                                    }else if(params._filters[i]._operator=="lt"){
                                        sqlPlaceHolders.push(dateValue+"T23:59:59.000Z")
                                        whereSql+=" < $"+(sqlPlaceHolders.length)+" ";
                                    }else if(params._filters[i]._operator=="lte"){
                                        sqlPlaceHolders.push(dateValue+"T23:59:59.000Z")
                                        whereSql+=" <= $"+(sqlPlaceHolders.length)+" ";
                                    }else if(params._filters[i]._operator=="ne"){
                                        sqlPlaceHolders.push(dateValue+"T00:00:00.000Z")
                                        sqlPlaceHolders.push(dateValue+"T23:59:59.000Z")
                                        whereSql+=" NOT BETWEEN $"+(sqlPlaceHolders.length-1)+" AND $"+sqlPlaceHolders.length+" ";
                                    }else{
                                        sqlPlaceHolders.push(dateValue+"T00:00:00.000Z")
                                        sqlPlaceHolders.push(dateValue+"T23:59:59.000Z")
                                        whereSql+=" BETWEEN $"+(sqlPlaceHolders.length-1)+" AND $"+sqlPlaceHolders.length+" ";
                                    }
                                    break;                                                                                                
                                }
                            }
                           
                        }
                        if(!matchFlag){
                            for(j=0;j<filters.foreignFilters.length;j++){
                                if(filters.foreignFilters[j].eq.length){
                                    for(k=0;k<filters.foreignFilters[j].eq.length;k++){
                                        if(params._filters[i]._property==filters.foreignFilters[j].eq[k]){
                                            matchFlag=true;                                                            
                                            whereSql+=" AND "+filters.foreignFilters[j].alias+".";
                                            whereSql+=filters.foreignFilters[j].eq[k];
                                            sqlPlaceHolders.push(params._filters[i]._value);
                                            whereSql+=" = $"+sqlPlaceHolders.length;
                                            break;                                                            
                                        }
                                    }
                                }
                                if(filters.foreignFilters[j].numberFilters.length){
                                    for(k=0;k<filters.foreignFilters[j].numberFilters.length;k++){
                                        if(params._filters[i]._property==filters.foreignFilters[j].numberFilters[k]){
                                            matchFlag=true;                                                            
                                            whereSql+=" AND "+filters.foreignFilters[j].alias+".";
                                            whereSql+=filters.foreignFilters[j].numberFilters[k];
                                            sqlPlaceHolders.push(params._filters[i]._value);
                                            whereSql+=" = $"+sqlPlaceHolders.length;
                                            break;                                                            
                                        }
                                    }
                                }
                                if(filters.foreignFilters[j].ilike.length&&!matchFlag){
                                    for(k=0;k<filters.foreignFilters[j].ilike.length;k++){
                                        if(params._filters[i]._property==filters.foreignFilters[j].ilike[k]){
                                            matchFlag=true;                                                            
                                            whereSql+=" AND "+filters.foreignFilters[j].alias+".";
                                            whereSql+=filters.foreignFilters[j].ilike[k];
                                            sqlPlaceHolders.push(('%'+params._filters[i]._value+'%'));
                                            whereSql+=" ilike $"+sqlPlaceHolders.length;
                                            break;                                                            
                                        }
                                    }
                                }
                                if(filters.foreignFilters[j].timeFilters&&filters.foreignFilters[j].timeFilters.length){
                                    for(k=0;k<filters.foreignFilters[j].timeFilters.length;k++){
                                        if(params._filters[i]._property==filters.foreignFilters[j].timeFilters[k]){
                                            matchFlag=true;
                                            whereSql+=" AND "+filters.foreignFilters[j].alias+".";
                                            whereSql+=filters.foreignFilters[j].timeFilters[k];
                                            var dateValue= (new Date(params._filters[i]._value).getMonth()+1)+
                                            "-"+(new Date(params._filters[i]._value).getDate())+
                                            "-"+(new Date(params._filters[i]._value).getFullYear());
                                            if(params._filters[i]._operator=="gt"){
                                                sqlPlaceHolders.push(dateValue+"T00:00:00.000Z")
                                                whereSql+=" >= $"+(sqlPlaceHolders.length)+" ";
                                            }else if(params._filters[i]._operator=="gte"){
                                                sqlPlaceHolders.push(dateValue+"T00:00:00.000Z")
                                                whereSql+=" >= $"+(sqlPlaceHolders.length)+" ";
                                            }else if(params._filters[i]._operator=="lt"){
                                                sqlPlaceHolders.push(dateValue+"T23:59:59.000Z")
                                                whereSql+=" < $"+(sqlPlaceHolders.length)+" ";
                                            }else if(params._filters[i]._operator=="lte"){
                                                sqlPlaceHolders.push(dateValue+"T23:59:59.000Z")
                                                whereSql+=" <= $"+(sqlPlaceHolders.length)+" ";
                                            }else if(params._filters[i]._operator=="ne"){
                                                sqlPlaceHolders.push(dateValue+"T00:00:00.000Z")
                                                sqlPlaceHolders.push(dateValue+"T23:59:59.000Z")
                                                whereSql+=" NOT BETWEEN $"+(sqlPlaceHolders.length-1)+" AND $"+sqlPlaceHolders.length+" ";
                                            }else{
                                                sqlPlaceHolders.push(dateValue+"T00:00:00.000Z")
                                                sqlPlaceHolders.push(dateValue+"T23:59:59.000Z")
                                                whereSql+=" BETWEEN $"+(sqlPlaceHolders.length-1)+" AND $"+sqlPlaceHolders.length+" ";
                                            }
                                            break;                                                                                                        
                                        }
                                    }
                                   
                                }
                            }
                        }
                    }
                }
                selectSql=selectSql+whereSql;
                selectSql+=params.orderQuery||" order by ip.ctime desc ";                
                if(!params.excelFlag&&params._start!=undefined){selectSql+=offsetSql};                                              
                countSql=countSql+whereSql;
                me.src.db.query( countSql,sqlPlaceHolders,function (e, countData) {
                    me.src.db.query( selectSql,sqlPlaceHolders,function (e, res) {
                       if(res && res.length){
                            cb({list:res, total:parseInt(countData[0].count||0)});
                       }else
                           cb({list:res||[], total:0});
                    })
                })
            }else{
                selectSql=selectSql+whereSql;
                selectSql+=params.orderQuery||" order by ip.ctime desc ";
                if(!params.excelFlag&&params._start!=undefined){selectSql+=offsetSql};                              
                countSql=countSql+whereSql;
                me.src.db.query( countSql,sqlPlaceHolders,function (e, countData) {
                    me.src.db.query( selectSql,sqlPlaceHolders,function (e, res) {
                       if(res && res.length){
                            cb({list:res, total:parseInt(countData[0].count||0)});
                       }else
                           cb({list:res||[], total:0});
                    })
                })
            }
        })
    }

     /*
    @author: Vaibhav Mali
    @date: 09 March 2020
    @function: generateSelectQuery.
    To generate select and count query by foreign table filters.
    ReqData Example:
        (foreignFilters:[
                {
                    collection:'',
                    alias:'wt',
                    eq:[],
                    eqCopy:[],                
                    numberFilters:[],
                    numberFiltersCopy:[],
                    ilike:[],//put here to select field in current table.
                    ilikeCopy:[],//Put here which you want to filter/select from foreign table filters.
                    timeFilters:[],              
                    timeFiltersCopy:[],  
                    on:'',
                }
            ],
        collection name)
    */ 
    /* scope:server */
    ,generateSelectQuery:function(foreignFilters,collection,cb){
        var selectSql=" SELECT ip.* ",countSql=" SELECT count(*) ";
        var joinSql=" from "+collection+" ip ";
        if(foreignFilters&&foreignFilters.length){
            for(j=0;j<foreignFilters.length;j++){
                joinSql+=(foreignFilters[j].join||" inner join ")+foreignFilters[j].collection+" ";
                joinSql+=foreignFilters[j].alias;
                joinSql+=" on "+foreignFilters[j].on;

                var k;
                for(k=0;k<foreignFilters[j].eq.length;k++){
                    selectSql+=","+foreignFilters[j].alias+".";
                    selectSql+=foreignFilters[j].eq[k];
                }

                for(k=0;k<foreignFilters[j].ilike.length;k++){
                    selectSql+=","+foreignFilters[j].alias+".";
                    selectSql+=foreignFilters[j].ilike[k];
                }

                for(k=0;k<foreignFilters[j].timeFilters.length;k++){
                    selectSql+=","+foreignFilters[j].alias+".";
                    selectSql+=foreignFilters[j].timeFilters[k];
                }
                
                if(foreignFilters[j].numberFilters&&foreignFilters[j].numberFilters.length){
                    for(k=0;k<foreignFilters[j].numberFilters.length;k++){
                        selectSql+=","+foreignFilters[j].alias+".";
                        selectSql+=foreignFilters[j].numberFilters[k];
                    }
                }
            }     
        }
        cb({selectSql:selectSql+joinSql,countSql:countSql+joinSql})
    }
})