Ext.define('Crm.rules.RuleFunctions', {

    average: {
        description: 'average',
        fn: function(paramValue) {
            var x = 0;
            if(paramValue && Ext.isArray(paramValue) && paramValue.length) {
                return paramValue.reduce(function(a,b) {return a+b})/paramValue.length;
            }
            return 0;
        }
    }
    
    ,max: {
        description: 'max',
        fn: function(paramValue) {
            if(paramValue && Ext.isArray(paramValue) && paramValue.length) {                
                return Math.max.apply(null, paramValue);
            }
            return null;
        }
    }
    
    ,min: {
        description: 'min',
        fn: function(paramValue) {
            if(paramValue && Ext.isArray(paramValue) && paramValue.length) {                
                return Math.min.apply(null, paramValue);
            }
            return null;
        }
    }
    
    ,sum: {
        description: 'sum',
        fn: function(paramValue) {
            if(paramValue && Ext.isArray(paramValue) && paramValue.length) {                
                var s = paramValue.reduce(function(a,b) {return a+b})
                return s;
            }
            return 0;
        }
    }
    
    ,count: {
        description: 'count',
        fn: function(paramValue) {
            if(paramValue) {   
                return Ext.isArray(paramValue)? paramValue.length:1;
            }
            return 0;
        }
    }
    
    ,select: {
        description: 'select elements in array',
        fn: function(paramValue, fact, rule) {
            var vals = rule.value.split(',')
                ,p = rule.param.split('.')
                ,cnt = 0;
                
            var f = function(a, i) {
                i++;
                for(var j=a.length-1;j>=0;j--) {
                    if(Ext.isArray(a[j][p[i]])) {
                        f(a[j][p[i]], i)
                    } else 
                    if(vals.indexOf(a[j][p[i]]+'') == -1) {
                        a.splice(j,1)
                        cnt++;
                    }
                }
            }
            if(Ext.isArray(fact[p[0]])) 
                f(fact[p[0]], 0)
                        
            return !!cnt;
        }
    }
    
    ,select_exceptions: {
        description: 'select exceptions in array',
        fn: function(paramValue, fact, rule) {
            
            var vals = rule.value.split(',')
                ,p = rule.param.split('.')
                ,cnt = 0;
                
            var f = function(a, i) {
                i++;
                for(var j=a.length-1;j>=0;j--) {
                    if(Ext.isArray(a[j][p[i]])) {
                        f(a[j][p[i]], i)
                    } else 
                    if(vals.indexOf(a[j][p[i]]+'') != -1) {
                        a.splice(j,1)
                        cnt++;
                    }
                }
            }
            if(Ext.isArray(fact[p[0]])) 
                f(fact[p[0]], 0)
                        
            return !!cnt;
        }
    }   
})