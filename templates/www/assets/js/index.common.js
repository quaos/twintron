
//Namespaces
var QPStudio=QPStudio || {};

QPStudio.App = function(opts) {
    if (opts) {
        this.document=opts.document || document;
        this.window=opts.window || window;
        this.jQuery=opts.jQuery || jQuery;
    }
};
QPStudio.App.prototype={
    constructor: QPStudio.App,
    document: null,
    window: null,
    jQuery: null,
    mainNav: null,
    
    // Application Constructor
    initialize: function() {
        var j$=this.jQuery;
        this.mainNav=this.document.getElementById("mainNav");
        j$(this.mainNav).show();
        
        console.log("QPStudio App initialized");
    }
};

var app=new QPStudio.App({
    document: document,
    window: window,
    jQuery: jQuery.noConflict(true)
});
document.addEventListener("DOMContentLoaded", app.initialize.bind(app));

