Ext.define('Core.Test',{
    extend: "Core.Controller",
    
    $test: function() {
        this.sendJSON(this.params)
    }
})