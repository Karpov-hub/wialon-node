Ext.define('Crm.rules.Rules', {    
            
    /**
     * Compiling rules
     */
    compileRules: function(item, actionsCls) {
        var me = this
            ,operators = Ext.create('Crm.rules.RuleOperators')
            ,functions = Ext.create('Crm.rules.RuleFunctions')
            ,RuleEngine = require('node-rules')
            ,rules = item.rules;

       rules.each(function(rule) {
            return {
                condition: function(R) {
                    
                    if(rule.code) {
                        R.when(me.runRuleCode(rule.code, this));
                    } else
                    if(rule.param) {
                        var res;

//console.log('rule.param :', rule)                        
 
                        if(rule.func && functions[rule.func]) {
                            res = rule.operator && operators[rule.operator]?
                                operators[rule.operator].fn.call(operators, functions[rule.func].fn.call(functions, me.getRuleParam(this, rule.param), this, rule), rule.value, rule.param, this)
                                :
                                functions[rule.func].fn.call(functions, me.getRuleParam(this, rule.param), this, rule);
                        } else {
                            res = rule.operator && operators[rule.operator]? operators[rule.operator].fn.call(operators, me.getRuleParam(this, rule.param), rule.value, rule.param, this):false;
                        }

                        R.when(rule.ne? !res:res);
                    } else {
                        R.when(true)
                    }
                },
                consequence: function(R) {
                    this.result = rule.result;
                    
                    if(rule.finish) {
                        this.finishAction = rule.finish; 
                    }
                    
                    var f = function() {
                        
                        if(rule.stop)
                            R.stop()
                        else
                            R.next()
                    }
                    if(rule.results) {
                        if(!!this.dataModel && !!this.dataModel.actionSetResult) {
//console.log('set result rule set.results:', rule.results)                            
                            this.dataModel.actionSetResult(rule.results, this.originData, function() {
                                f()
                            },item);
                            return;
                        }
                    }
                    f()
                }
            }
        }, true)


        
        this.RuleEngine = new RuleEngine(rules);
    
        return this.RuleEngine
    }
    
    ,compileQuery: function(rules) {
        var me = this
            ,query = {}
            ,operators = Ext.create('Crm.rules.RuleOperators');
            
        rules.each(function(rule) {
            
        })
        return query;
        
    }
    
    ,getRuleParam: function(obj, name) {
        
 
      
        
        if(!/[\/*\+\-]/.test(name)) 
            return this.getRuleParamVal(obj, name)

       
        
        var p = '', i = 0, l = name.length, n = '', c, x;
        while(i<l) {
            c = name.charAt(i);
            if(c == ' ') {}
            else
            if(['(',')','+','-','/','*','%'].indexOf(c) != -1) p += c;
            else
            if(/[a-zа-я_]/i.test(c)) {
                n = '';
                while(i<l && /[a-z0-9\._а-я]/i.test(c)) {
                    n+=c;
                    i++
                    if(i<l) c = name.charAt(i);
                }
                if(n) {
                    x = this.getRuleParamVal(obj,n)
                    if(Ext.isArray(x)) p += '['+x+']'
                    else p+=x;
                }
                if(i<l && c!=' ') p+=c;
            } else
                p+=c;
            i++;
        }
        if(p) {
            i = null;
            try {
                eval('i = ' + p)
            } catch(e) {}
            return i;
        }
        return null;
    }
    ,getRuleParamVal: function(obj, name) {
        var i = 0, out = [],x = name.split('.'); 

        var f = function(o, i) {
            if(o && o[x[i]] !== undefined) {
                o = o[x[i]]; 
                if(Ext.isArray(o)) {                   
                    o.forEach(function(oo) {
                        f(oo, i+1)
                    })    
                } else
                if(i == x.length)
                    return;
                else
                    f(o, i+1)
            } else
                out.push(o);
        }
        if(x[0] == 'Action')
            f(obj.originData, 0)
        else    
            f(obj, 0)
  
  
        
        return out.length == 1? out[0]:out;
    }   

    ,runRuleCode: function(code, Obj) {
        var result = false;
        try {
            eval(code);
        } catch(e) {
            return false;
        }
        return result;
    }

})