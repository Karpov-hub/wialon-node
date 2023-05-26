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
    
    ,CSVtoData: function(line) {
        var out = {}
        this.csvFields.forEach((k,i) => {
            out[k] = line[i]
        })
        return out;
    }
   
})