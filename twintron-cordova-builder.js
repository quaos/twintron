var fs = require("fs-extra");
var path = require("path");
var child_process=require("child_process");
var xml2js=require("xml2js");

var utils=require("./q-utils");

function TwinTron_CordovaBuilder(opts) {
    this.opts=opts || {};
}
TwinTron_CordovaBuilder.prototype={
    constructor: TwinTron_CordovaBuilder,
    opts: null,
    
    init: function(args) {
        var builder=this;
        var modDir=__dirname;
        var tmplDir=path.join(__dirname,"templates","cordova");
        var workDir=this.opts.workDir || process.cwd();
        var destDir=path.join(workDir,"cordova");
        var mainPageFile="twintron.cordova.html";
        var cordovaConfPath=path.join(destDir,"config.xml");
        
        var config=this.opts;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                //Step 1: Cordova create
                (packageObj.cordova) && utils.merge(config, packageObj.cordova);
                var appName=config.appName || packageObj.name;
                var bundleID=config.bundleID || "quaos.twintron.template";
                (config.mainPageFile) && (mainPageFile=config.mainPageFile);
        
                console.log("Initializing cordova app: "+appName+"; bundle ID: "+bundleID);
                var cmd="cordova";
                var cmdArgs=["create","cordova",bundleID,appName];
                return utils.exec(cmd,cmdArgs,workDir);
            })
            .then(function() {
                //Step 2: Copy template files
                return fs.ensureDir(destDir)
                    .then(function() {
                        var excludedFiles=[ ".git", ".gitignore", "package.json" ];
                        console.log("Copying files from source path: "+tmplDir+" -> "+destDir);
                        return utils.copyTree(tmplDir,destDir,function(fName) {
                            var included=(excludedFiles.indexOf(fName) < 0);
                            (included) && console.log("Copying: "+fName);
                            return (included);
                        });
                    });
            })
            .then(function() {
                //Step 3: Copy dependency files to web dir
                var depsFiles=[ "twintron.js", "q-utils.js" ];
                console.log("Copying dependency files from source path: "+modDir);
                var proms=[];
                depsFiles.forEach(function(fName) {
                    var srcPath=path.join(modDir,fName);
                    var srcExt=path.extname(fName);
                    var destDir2=destDir;
                    if ((!srcExt) && (srcExt !== 0)) {
                    } else if (srcExt === ".js") {
                        destDir2=path.join(destDir,"www","assets","js");
                    } else if (srcExt === ".css") {
                        destDir2=path.join(destDir,"www","assets","css");
                    } else if (srcExt.match(/^\.(png|jpg|jpeg|gif|tif|tiff|svg|ico)$/i)) {
                        destDir2=path.join(destDir,"www","assets","img");
                    }
                    var destPath=path.join(destDir2,fName);
                    
                    console.log("Copying: "+srcPath+" ["+srcExt+"] -> "+destPath);
                    proms.push(fs.ensureDir(destDir2)
                        .then(function() {
                            return fs.copy(srcPath,destPath, {
                                overwrite: true
                            });
                        })
                    );
                });
            })
            .then(function() {
                //Step 4: Parse & modify some parameters in Cordova config.xml        
                var xmlParser = new xml2js.Parser();
                var xmlBuilder = new xml2js.Builder();

                console.log("Parsing cordova app configuration in: "+cordovaConfPath);
                return fs.readFile(cordovaConfPath)
                    .then(function(cordovaConfigStr) {
                        return new Promise(function(resolve,reject) {
                            xmlParser.parseString(cordovaConfigStr, function(err, cordovaConfig) {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                //console.log(cordovaConfig);
                                //console.log(cordovaConfig.widget.content);
                                var contNode=((cordovaConfig.widget) ? cordovaConfig.widget.content[0] : null) || { };
                                contNode.$=contNode.$ || {};
                                contNode.$.src=mainPageFile;
                                
                                resolve(cordovaConfig);
                            });
                        });
                    })
                    .then(function(cordovaConfig) {
                        var cordovaConfigXml = xmlBuilder.buildObject(cordovaConfig);
                
                        console.log("Updating cordova app configuration in: "+cordovaConfPath);
                        //console.log(cordovaConfig);
                        return fs.writeFile(cordovaConfPath,cordovaConfigXml);
                    });
            })
            .then(function() {
                console.log("Task finished: init");
                return Promise.resolve(true);
            }); 
        
    },
    build: function(args) {
        var builder=this;
        var modDir=__dirname;
        //var tmplDir=path.join(__dirname,"templates","cordova");
        var workDir=this.opts.workDir || process.cwd();
        var srcDir=path.join(workDir,"www");
        var destDir=path.join(workDir,"cordova");
        var excludedFiles=[ ".git", ".gitignore", "package.json" ];
        
        var config=this.opts;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.cordova) && utils.merge(config, packageObj.cordova);
                var appName=config.appName || packageObj.name;
                var bundleID=config.bundleID || "quaos.twintron.template";
                
                console.log("Building cordova app: "+appName+"; bundle ID: "+bundleID);
                console.log("Copying files from source path: "+srcDir+" -> "+destDir);
                return utils.copyTree(srcDir,destDir,function(fName) {
                    var included=(excludedFiles.indexOf(fName) < 0);
                    (included) && console.log("Copying: "+fName);
                    return (included);
                });
            })
            .then(function() {
                var cmd="cordova";
                var cmdArgs=[ "build" ];
                return utils.exec(cmd,cmdArgs,destDir);
            })
            .then(function() {
                console.log("Task finished: build");
                return Promise.resolve(true);
            }); 
    },
    run: function(args) {
        var builder=this;
        var modDir=__dirname;
        var workDir=this.opts.workDir || process.cwd();
        
        //TODO:
        throw new Error("Not implemented yet");
    }
};

function TwinTron_CordovaBuilder$Factory(opts) {
    return new TwinTron_CordovaBuilder(opts);
}
TwinTron_CordovaBuilder$Factory.prototype=TwinTron_CordovaBuilder.prototype;

module.exports=TwinTron_CordovaBuilder$Factory;
