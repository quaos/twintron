// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var electron = require("electron"); 

var utils = require("./q-utils"); 

console.log("Electron renderer process: ");
console.log(process);

//Global Namespaces
var TwinTron=window.TwinTron || {};

function TwinTron_ElectronWebApp(opts) {
    TwinTron_ElectronWebApp._super.prototype.constructor.call(this,opts);
}
var TwinTron_ElectronWebApp_static={
    //statics
    
};
TwinTron_ElectronWebApp.prototype=utils.extendClass(TwinTron.WebApp, {
    constructor: TwinTron_ElectronWebApp,
    
    init: function() {
        this._super.prototype.init.call(this);
        
        var _static=TwinTron_ElectronWebApp;
        var app=this;
        var win=this.window;
        
        electron.ipcRenderer.on("async-reply", function onMainAsyncReply(event, msg) {
            console.log("Got reply message from Electron main process:");
            console.log(msg);
        });
        
        var navCtrl=win.navigationController;
        navCtrl.on(TwinTron.NavigationController.EVT_LINK, function onMainWindowLinkActivated(evt) {
            console.log("Link event in Electron renderer process: "+evt.url);
            electron.ipcRenderer.send("async", evt);
        });
    }
}, TwinTron_ElectronWebApp_static);

var factory=utils.makeFactory(TwinTron_ElectronWebApp, function TwinTron_ElectronWebApp$Factory(opts) {
    return new TwinTron_ElectronWebApp(opts);
});

module.exports = TwinTron.ElectronWebApp = factory;
