var stringSimilarity = require('string-similarity');

Ext.define('Crm.Translit', {
    
    
    
    transliterate:function(text) {
        if(!text)
            return '';
        
		var arrru = new Array ('Я','я','Ю','ю','Ч','ч','Ш','ш','Щ','щ','Ж','ж','А','а','Б','б','В','в','Г','г','Д','д','Е','е','Ё','ё','З','з','И','и','Й','й','К','к','Л','л','М','м','Н','н', 'О','о','П','п','Р','р','С','с','Т','т','У','у','Ф','ф','Х','х','Ц','ц','Ы','ы','Ь','ь','Ъ','ъ','Э','э');
 
        var arren = new Array ('Ya','ya','Yu','yu','Ch','ch','Sh','sh','Sh','sh','Zh','zh','A','a','B','b','V','v','G','g','D','d','E','e','E','e','Z','z','I','i','J','j','K','k','L','l','M','m','N','n', 'O','o','P','p','R','r','S','s','T','t','U','u','F','f','H','h','C','c','Y','y','`','`','\'','\'','E', 'e');

 

        for(var i=0; i<arren.length; i++){
            var reg = new RegExp(arren[i], "g");
            text = text.replace(reg, arrru[i]);
        }
        return text;
		
	}
    
    ,checkSpelling: function(arr, fld, vals) {
        vals.each(function(v) {return v.toLowerCase()}, true)
        arr.each((item) => {
            var k = 0;
            item['sml'] = 0;
            fld.forEach((f,i) => {
                var sm, k = 1, v =  item[f]? item[f].split(' ')[0].trim().toLowerCase():'';
                if(i) k = 1/(10^i);               
                for(var n = 0;n<this.config.SPELLNAME.length;n++) {
                    if(this.config.SPELLNAME[n].indexOf(v) != -1) {
                        sm = k;
                        break;
                    }
                }
                if(!sm) 
                    sm = stringSimilarity.compareTwoStrings(v, vals[i]) * k;
               
                item['sml'] += sm; 
            })
            return item;
        }, true)
        
        arr.sort(function(a,b) {            
            return a['sml'] > b['sml']? -1:1;
        })
        
        return arr;
    }
})