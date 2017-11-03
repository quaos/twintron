
//Global namespaces
var TwinTron=window.TwinTron || {};

//(function(win,doc,j$) {
var utils=require("./q-utils");
var _twintron=require("./twintron");
utils.merge(TwinTron, _twintron, true);
    
TwinTron.createMainApp=function TwinTron_createMainApp(opts) {
    var navLinks=require("./navlinks");
    utils.merge(opts, {
        navigationLinks: navLinks
    }, true);
    var app=new TwinTron.WebApp(opts);
    var doc=opts.document || document;
    doc.addEventListener("DOMContentLoaded", function onPageReady() {
        app.init()
            .then(function() {
                app.navigationController.pushURL("home.html");
            });
    }); 
    return app;
};
//})(window,document,jQuery.noConflict(true));
