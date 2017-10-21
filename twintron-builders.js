
//var fs=require("fs-extra");

//Namespaces
var TwinTron=TwinTron || {};
TwinTron.Builders=TwinTron.Builders || {};

TwinTron.Builders.ElectronBuilder=require("./twintron-electron-builder");
TwinTron.Builders.CordovaBuilder=require("./twintron-cordova-builder");
TwinTron.Builders.WebBuilder=require("./twintron-web-builder");

module.exports=TwinTron.Builders;
