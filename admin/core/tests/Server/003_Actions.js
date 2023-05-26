var cls = Ext.create('Crm.actions.Actions',{
    RulesCls: Ext.create('Crm.rules.Rules')    
});



var ActionCfg = {
    data_orders: true,
    data_profiles: true,
    data_mapping: [],
    rules: 
    [ { id: 'extModel664-2',
       priority: null,
       param: 'Members.cards.layer',
       operator: 'eq',
       value: '2',
       result: true,
       stop: true,
       ne: false },
     { id: 'extModel580-2',
       param: null,
       operator: null,
       value: null,
       result: false,
       stop: true,
       ne: false } ],
    indx: 1,
    pontsBaseType: 1,
    pontsTechType: 1,
    stop: true,
    result_pontsBase: 10,
    result_pontsBaseType: 1,
    result_pontsBaseLife: null,
    result_pontsTech: 100,
    result_pontsTechType: 1,
    result_pontsTechLife: null,
    result_message: '',
    result_paramName: 'Members.cards.layer',
    result_value: '3',
    result_ext: [{
       art: '00000000000001,00000000000003',
       type: 1,
       value: 50     
    }]
}

var inpData = {
  Id: '56e190cc6922d5d97802bb33',
  ctime: '10.03.2016 18:20:54',
  card: '990187642345766',
  amount: '875',
  points_in: '',
  points_out: '',
  redeem: false,
  positions: 
   [ { Id: '00000000000002',
       price: 10,
       count: 2,
       ex: null,
       id: 'extModel547-1' },
     { Id: '00000000000001',
       price: 20,
       count: 3,
       ex: null,
       id: 'extModel547-2' } ] }


cls.Actions = []
cls.Exceptions_in = ['00000000000002']
cls.Exceptions_out = ['00000000000001']

describe("Crm.actions.Actions", function() { 
    
    describe("compile", function() {
        it("this.compile()", function (done) {            
            cls.compile(Ext.clone(ActionCfg), function(item) {
                cls.Actions.push(item)
                assert.isObject(item.RuleEngine)
                done()
            })            
        });
    })
    

    
    describe("markExceptions", function() {
        it("this.markExceptions(data) with excepted position", function () {
            var data = Ext.clone(inpData);
            var res = cls.markExceptions(cls.Actions[0],data)
            assert.deepEqual(data, {
                Id: '56e190cc6922d5d97802bb33',
                ctime: '10.03.2016 18:20:54',
                card: '990187642345766',
                amount: 60,
                points_in: '',
                points_out: '',
                redeem: false,
                positions: [{ 
                    Id: '00000000000001',
                    price: 20,
                    count: 3,
                    ex: null,
                    id: 'extModel547-2' 
                }],
                exceptions: [{ 
                    Id: '00000000000002',
                    price: 10,
                    count: 2,
                    ex: null,
                    id: 'extModel547-1' 
                }]
            })
            assert.deepEqual(res, [{ 
                Id: '00000000000002',
                price: 10,
                count: 2,
                ex: null,
                id: 'extModel547-1' 
            }])
        })
        
        it("this.markExceptions(data) without excepted position", function () {
            var data = Ext.clone(inpData)
            data.positions[0].Id = '00000000000003'
            var res = cls.markExceptions(cls.Actions[0], data)
            assert.deepEqual(data, {
                Id: '56e190cc6922d5d97802bb33',
                ctime: '10.03.2016 18:20:54',
                card: '990187642345766',
                amount: 80,
                points_in: '',
                points_out: '',
                redeem: false,
                positions: [{ 
                    Id: '00000000000003',
                    price: 10,
                    count: 2,
                    ex: null,
                    id: 'extModel547-1' 
                },{ 
                    Id: '00000000000001',
                    price: 20,
                    count: 3,
                    ex: null,
                    id: 'extModel547-2' 
                }],
                exceptions: []
            })
        })
    })
    
    describe("changeParamValue", function() {
        it("this.changeParamValue Member.status", function () {
            
            inpData.Members = [{ 
                _id: '56d70ceb5dba505050c099dc',
                region: 77,
                fname: 'Зирнбирнштейн',
                lname: 'Акакий',
                mname: 'Назарыч',
                tel: '79901235343',
                email: 'zina@mail.ru',
                status: 1,
                cards: [{
                    card: '990187642345767',
                    cdate: new Date(),
                    fdate: new Date(),
                    layer: 2,
                    qbalance: 20    
                },{
                    card: '990187642345766',
                    cdate: new Date(),
                    fdate: new Date(),
                    layer: 2,
                    qbalance: 10    
                }],
                ctime: new Date('Wed Mar 02 2016 18:58:06 GMT+0300 (MSK)'),
                mtime: new Date('Tue Mar 15 2016 11:36:15 GMT+0300 (MSK)'),
                maker: '5671aaff233fc65f7dd86850',
                stime: 1458030975819,
                ltime: null,
                balance: 100 
            }]
            
            var data = Ext.clone(inpData), data1 = Ext.clone(inpData)
            data.Members[0].status = 2;
            data1.Members[0].status = 4;
            data1.Members[0]._changed = true
            cls.changeParamValue('Members.status', 4, data);
            assert.deepEqual(data, data1)
        })
        
        it("this.changeParamValue Member.cards.layer", function () {
            var data = Ext.clone(inpData), data1 = Ext.clone(inpData)
            data1.Members[0].cards[1].layer = 3;
            data1.Members[0]._changed = true
            cls.changeParamValue('Members.cards.layer', 3, data);
            assert.deepEqual(data, data1)
        })
        
        it("this.changeParamValue Orders.amount", function () {
            var data = Ext.clone(inpData), data1 = Ext.clone(inpData)
            data1.amount = 3;
            cls.changeParamValue('Orders.amount', 3, data);
            assert.deepEqual(data, data1)
        })
        
        it("this.changeParamValue Orders.positions.price :: '00000000000002:50'", function () {
            var data = Ext.clone(inpData), data1 = Ext.clone(inpData)
            data1.positions[0].price = 50;
            cls.changeParamValue('Orders.positions.price', '00000000000002:50', data);
            assert.deepEqual(data, data1)
        })
    })
    
    describe("changePoints", function() {
        it("this.changePointsBalance base points", function (done) {
            var data = Ext.clone(inpData), data1 = Ext.clone(inpData);
            data1.points_in = 32;             
            data1.positions[0].points = 2
            data1.positions[1].points = 30
            data1.Members[0].balance = 132;
            data1.Members[0]._changed = true
            cls.changePointsBalance(cls.Actions[0], data, function() {
                assert.deepEqual(data, data1)
                done()
            })
        })
        
        it("this.changePointsQbalance base points", function (done) {
            var data = Ext.clone(inpData)
            data.amount = "80"
            var data1 = Ext.clone(data);         
            data1.Members[0]._changed = true
            data1.Members[0].cards[1].qbalance = 90
            data1.qpoints_in = 80; 
            cls.changePointsQbalance(cls.Actions[0], data, function() {
                assert.deepEqual(data, data1)
                done()
            })
        })
    })
    
})
        
describe("Crm.rules.RulesOperators", function() { 
    describe("Equality", function() {
        it("Members.cards.layer eq 2 (result true)", function (done) {            
            
            
            cls.Actions[0].RuleEngine.execute(inpData,function(result){ 
                assert.equal(result.result, true)
                done();
            });            
        });
        
        it("Members.cards.layer eq 2 (result false)", function (done) {            
            inpData.Members[0].cards[0].layer = 1
            inpData.Members[0].cards[1].layer = 3

            cls.Actions[0].RuleEngine.execute(inpData,function(result){ 
                assert.equal(result.result, false)
                done();
            });            
        });
        
        it("Members.cards.layer !eq 2 (result true)", function (done) {            
            ActionCfg.rules[0].ne = true;
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){ 
                    assert.equal(result.result, true)
                    done()
                });
            })
      
        });
        
        it("Members.cards.layer !eq 2 (result false)", function (done) {            
            cls.compile(Ext.clone(ActionCfg), function(action) {
                inpData.Members[0].cards[0].layer = 2
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, false)
                    done()
                });
            })
      
        });      
    })
    
    describe("Incoming", function() {
        it("(Array)Members.cards.layer in '1,2' (result true)", function (done) {
            ActionCfg.rules[0].operator = 'in';
            ActionCfg.rules[0].value = '1,2';
            ActionCfg.rules[0].ne = false;
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, true)
                    done()
                });
            })
        })
        it("(Int)Members.status in '1,2' (result true)", function (done) {
            //inpData.Members[0].cards[0].layer = 2
            var cfg = Ext.clone(ActionCfg)
            cfg.rules[0].param = 'Members.status'
            cls.compile(cfg, function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, true)
                    done()
                });
            })
        })
        it("(Int)Members.status in '3' (result false)", function (done) {
            //inpData.Members[0].cards[0].layer = 2
            var cfg = Ext.clone(ActionCfg)
            cfg.rules[0].param = 'Members.status'
            cfg.rules[0].value = '3'
            cls.compile(cfg, function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, false)
                    done()
                });
            })
        })
        
    })
    
    describe("Less than", function() {
        it("(Int)Members.status lt '3' (result true)", function (done) {
            ActionCfg.rules[0].param = 'Members.status'
            ActionCfg.rules[0].value = '3'
            ActionCfg.rules[0].operator = 'lt';
            inpData.Members[0].status = 2
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, true)
                    done()
                });
            })
        })
        it("(Int)Members.status lt '3' (result false)", function (done) {
            inpData.Members[0].status = 3
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, false)
                    done()
                });
            })
        })
    })
    
    describe("Less and equal than", function() {
        it("(Int)Members.status lte '3' (result true)", function (done) {            
            ActionCfg.rules[0].operator = 'lte';
            inpData.Members[0].status = 3
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, true)
                    done()
                });
            })
        })
        it("(Int)Members.status lte '3' (result false)", function (done) {            
            inpData.Members[0].status = 4
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, false)
                    done()
                });
            })
        })
    })
    
    describe("Larger than", function() {
        it("(Int)Members.status gt '3' (result true)", function (done) {            
            ActionCfg.rules[0].operator = 'gt';
            inpData.Members[0].status = 4
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, true)
                    done()
                });
            })
        })
        it("(Int)Members.status gt '3' (result false)", function (done) {            
            inpData.Members[0].status = 3
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, false)
                    done()
                });
            })
        })
    })
    
    describe("Larger and equal than", function() {
        it("(Int)Members.status gte '3' (result true)", function (done) {            
            ActionCfg.rules[0].operator = 'gte';
            inpData.Members[0].status = 3
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, true)
                    done()
                });
            })
        })
        it("(Int)Members.status gte '3' (result false)", function (done) {            
            inpData.Members[0].status = 2
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, false)
                    done()
                });
            })
        })
    })
    
    describe("Regular expression", function() {
        it("(Int)Members.lname = 'Акакий' test '^Ака' (result true)", function (done) {            
            ActionCfg.rules[0].operator = 're';
            ActionCfg.rules[0].value = '^Ака'
            ActionCfg.rules[0].param = 'Members.lname'
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, true)
                    done()
                });
            })
        })
        it("(Int)Members.lname = 'aАкакий' test '^Ака' (result false)", function (done) {            
            inpData.Members[0].lname = 'aАкакий'
            cls.compile(Ext.clone(ActionCfg), function(action) {
                action.RuleEngine.execute(inpData,function(result){
                    assert.equal(result.result, false)
                    done()
                });
            })
        })
    })
    
});

describe("Crm.rules.Rules", function() { 
    
    var rulesCls = Ext.create('Crm.rules.Rules');
    var obj = {
        param0: 2,
        param1: {
            param11: 10    
        },
        param2: [{
            param: 22    
        },{
            param: 23    
        }]
    }
    
    describe("getRuleParam", function() {
        it("getRuleParam() easy param", function () { 
             assert.equal(rulesCls.getRuleParam(obj, 'param0'), 2)   
        })
        
        it("getRuleParam() param.param (int)", function () { 
             assert.equal(rulesCls.getRuleParam(obj, 'param1.param11'), 10)   
        })
        
        it("getRuleParam() param.param (array)", function () { 
             assert.deepEqual(rulesCls.getRuleParam(obj, 'param2.param'), [22,23])   
        })
        
        it("getRuleParam() expression", function () { 
             assert.equal(rulesCls.getRuleParam(obj, '3*(2*param0 + param1.param11)*param1.param11 + param2.param[1]'), 443)   
        })
        
    })
})