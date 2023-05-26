Ext.define('Crm.rules.RuleOperators', {

    eq: {
        description: 'equality',
        fn: function(paramValue, checkValue) {
            checkValue += ''
            if(Ext.isArray(paramValue)) {                
                for(var i=0;i<paramValue.length;i++)
                    if(paramValue[i]+'' == checkValue) return true;
                return false;
            }  
            return paramValue+'' == checkValue;
        },
        op: function(param, value) {
            var r = {}
            r[param] = value
            return;
        }
    }
    
    ,in: {
        description: 'incoming',
        fn: function(paramValue, checkValue) {
            if(!Ext.isArray(paramValue)) paramValue = [paramValue]
            var c = checkValue.split(':')
            var s = c[0].split(',')
            var inx;
            if(c[1]) {
                inx = []
                c[1].split(',').forEach(function(i) {
                    inx.push(parseInt(i))
                })
            }

//console.log('paramValue:', paramValue)
//console.log('s:', s)

            for(var i=0;i<paramValue.length;i++) {
                for(var j=0;j<s.length;j++) {
                    if(s[j]+'' == paramValue[i]+'') {
                        if(inx) {
                            if(inx[j] == i) return true;                            
                        } else
                        return true;
                    }
                }
            }
            return false;
        },
        op: function(param, value) {
            var r = {}
            r[param] = {$in:value}
            return;
        }
    }
    
    ,lt: {
        description: 'less than (<)',
        fn: function(paramValue, checkValue) {
            var v = this.syncTypes(paramValue, checkValue)
            return paramValue<v;
        },
        op: function(param, value) {
            var r = {}
            r[param] = {$lt:value}
            return;
        }
    }
    ,lte: {
        description: 'less and equal (<=)',
        fn: function(paramValue, checkValue) {
            var v = this.syncTypes(paramValue, checkValue)
            return paramValue<=v;
        },
        op: function(param, value) {
            var r = {}
            r[param] = {$lte:value}
            return;
        }
    }
    
    ,gt: {
        description: 'larger than (>)',
        fn: function(paramValue, checkValue) {
            var v = this.syncTypes(paramValue, checkValue)
            return paramValue>v;
        },
        op: function(param, value) {
            var r = {}
            r[param] = {$gt:value}
            return;
        }
    }
    
    ,gte: {
        description: 'larger and equal (>=)',
        fn: function(paramValue, checkValue) {        
            
            var v = this.syncTypes(paramValue, checkValue)

            return paramValue>=v;
        },
        op: function(param, value) {
            var r = {}
            r[param] = {$gte:value}
            return;
        }
    }
    
    ,re: {
        description: 'regular expression',
        fn: function(paramValue, checkValue) {
            return new RegExp(checkValue).test(paramValue+'');
        },
        op: function(param, value) {
            var r = {}
            r[param] = new RegExp(value)
            return;
        } 
    }
    
    ,mult: {
        description: 'multiple of',
        fn: function(paramValue, checkValue) {
            var v1 = parseInt(paramValue)
                ,v2 = parseInt(checkValue) 

            if(v1 && v2 && !isNaN(v1) && !isNaN(v2))    
                return (v1 % v2) === 0;
            return false;
        },
        op: function(param, value) {
            var r = {}
            r[param] = {$mod: [value,0]}
            return;
        }
    }
    
    ,between: {
        description: 'between two constants',
        fn: function(paramValue, checkValue) {
            var v1 = parseFloat(paramValue)
                ,v2 = checkValue.split(',')
            v2[0] = parseFloat(v2[0])
            v2[1] = parseFloat(v2[1]) 
            if(v1 && v2[0] && v2[1] && !isNaN(v1) && !isNaN(v2[0]) && !isNaN(v2[1]))    
                return v1>=v2[0] && v1<=v2[1];
            return false;
        },
        op: function(param, value) {
            var r = {}
            r[param] = {$mod: [value,0]}
            return;
        }
    }
    
    ,date: {
        description: 'check date (date1;date2;dateN:format)',
        fn: function(paramValue, checkValue) {
            var v1 = new Date(paramValue) 
                ,cv = checkValue? checkValue.split(':') : []
                ,v2 = [];
                
            if(!cv[1]) cv[1] = 'd.m';
            v1 = Ext.Date.format(v1, cv[1]);
            
            if(cv[0]) {
                var ar = cv[0].split(';');
                for(var i=0;i<ar.length;i++) {
                    if(v1 == ar[i]) return true;
                }
            } else
                return v1 == Ext.Date.format(new Date(), cv[1]);
            
            
            //    = cv[0]? new Date(cv[0]) : new Date();
                
            
            return false;//Ext.Date.format(v1, cv[1]) == Ext.Date.format(v2, cv[1])            
        }
    }
    
    ,syncTypes: function(v1,v2) {
        if(Ext.isDate(v1)) return new Date(v2);
        if(Ext.isNumber(v1)) return parseFloat(v2);
        if(Ext.isArray(v1)) return v2.split(',')
        return v2;
    }

})