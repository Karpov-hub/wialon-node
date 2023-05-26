Ext.define('Crm.classes.Csv', {    
   
   lineToArray: function(text) {
        var out = [''],l = true, n=0, c, i=0;
        while(i<text.length) {
            c = text.charAt(i);
            if(l && c == ';') {
                n++;
                i++;
                if(text.charAt(i) == '"') {
                    l = false;
                    i++;
                }
                out[n] = '';
            } else
            if(!l && c == '"') {
                i++;
                l = true;
            } else {
                out[n] += c;
                i++;
            }          
            
        }
        return out;
    }
    
    ,getColumnNames: function(line) {
        var ln = this.lineToArray(line);
        ln.each((l) => {
            return l.replace(/[^0-9^a-z^_]/g,'')
        }, true)
        return ln;
    }
    
    ,CSVtoData: function(line) {
        var out = {}, ln = this.lineToArray(line);
        this.csvFields.forEach((k,i) => {
            out[k] = ln[i]
        })
        return out;
    }
    
    ,writeCsvLine: function(data, cb) {
        
        if(!data[this.csvFields[0]]) return cb();
        
        this.find = {}
        this.find[this.csvFields[0]] = data[this.csvFields[0]];
        
        this.getData({}, (d) => {
            var res = {};
            if(d && d.list && d.list[0]) {
                res = d.list[0];
                for(var i in data) {
                    res[i] = data[i];
                }
                res._id += '';                
            } else {
                res = data;
            }
            this.write(res, () => {
                cb()
            })
        })
    }
   
})