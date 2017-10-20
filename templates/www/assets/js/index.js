
//Namespaces
var TwinTron=TwinTron || {};

TwinTron.WebApp = function(opts) {
    if (opts) {
        this.document=opts.document || document;
        this.window=opts.window || window;
        this.jQuery=opts.jQuery || jQuery;
    }
};
TwinTron.WebApp.prototype={
    constructor: TwinTron.WebApp,
    document: null,
    window: null,
    jQuery: null,
    mainNav: null,
    
    // Application Constructor
    initialize: function() {
        var j$=this.jQuery;
        this.mainNav=this.document.getElementById("mainNav");
        //TODO: Attach navigation controller
        j$(this.mainNav).show();
        
        console.log("QPStudio App initialized");
    }
};

var app=new TwinTron.WebApp({
    document: document,
    window: window,
    jQuery: jQuery.noConflict(true)
});
document.addEventListener("DOMContentLoaded", app.initialize.bind(app));

