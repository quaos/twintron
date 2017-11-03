// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var electron = require("electron"); 

var utils = require("./q-utils"); 

console.log("Electron renderer process: ");
console.log(process);

//Global Namespaces
var TwinTron=window.TwinTron || {};

var _twintron=require("./twintron");
utils.merge(TwinTron,_twintron,true);

function TwinTron_ElectronWebApp(opts) {
    TwinTron_ElectronWebApp._super.prototype.constructor.call(this,opts);
}
var TwinTron_ElectronWebApp_static={
    //statics
    
};
TwinTron_ElectronWebApp.prototype=utils.extendClass(TwinTron.WebApp, {
    constructor: TwinTron_ElectronWebApp,
    
    init: function() {
        var _static=TwinTron_ElectronWebApp;
        var app=this;
        var win=this.window;
   
        return this._super.prototype.init.call(this)
            .then(function() {
                electron.ipcRenderer.on("async-reply", function onMainAsyncReply(event, msg) {
                    console.log("Got reply message from Electron main process:");
                    console.log(msg);
                });

                var navCtrl=app.rootPageController.navigationController;
                navCtrl.on(TwinTron.NavigationController.EVT_LINK, function onMainWindowLinkActivated(evt) {
                    console.log("Link event in Electron renderer process: "+evt.url);
                    electron.ipcRenderer.send("async", evt);
                });
                
                return Promise.resolve(true);
            });
    }
}, TwinTron_ElectronWebApp_static);

var factory=utils.makeFactory(TwinTron_ElectronWebApp, function TwinTron_ElectronWebApp$Factory(opts) {
    return new TwinTron_ElectronWebApp(opts);
});

module.exports = TwinTron.ElectronWebApp = factory;
