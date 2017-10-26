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
        var workDir=this.opts.workDir || ".";
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
                var cmd="cordova create cordova "+bundleID+" "+appName+" cordova";
                var cmdOpts={
                    cwd: workDir,
                    stdio: "inherit"
                };
                console.log("> "+cmd);
                return new Promise(function(resolve,reject) {
                    child_process.exec(cmd,cmdOpts,function(err,outBuf,errBuf) {
                        //console.log(outBuf);
                        //console.log(errBuf);
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(outBuf);
                    });
                });
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
                        destDir2=path.join(destDir,"assets","js");
                    } else if (srcExt === ".css") {
                        destDir2=path.join(destDir,"assets","css");
                    } else if (srcExt.match(/^\.(png|jpg|jpeg|gif|tif|tiff|svg|ico)$/i)) {
                        destDir2=path.join(destDir,"assets","img");
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
                                cordovaConfig.widget.content.src=mainPageFile;
                                //TODO:
                                
                                resolve(cordovaConfig);
                            });
                        });
                    })
                    .then(function(cordovaConfig) {
                        var cordovaConfigXml = xmlBuilder.buildObject(cordovaConfig);
                
                        console.log("Updating cordova app configuration in: "+cordovaConfPath);
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
        var workDir=this.opts.workDir || ".";
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
                return new Promise(function(resolve,reject) {
                    var cmd="cordova build";
                    var cmdOpts={
                        cwd: destDir,
                        stdio: "inherit"
                    };
                    console.log("> "+cmd);
                    child_process.exec(cmd,cmdOpts,function(err,stdout,stderr) {
                        //console.log(stdout);
                        //console.log(stderr);
                        if (err) {
                            reject(err);
                            return false;
                        }
                        resolve(stdout);
                    });
                });
            })
            .then(function() {
                console.log("Task finished: build");
                return Promise.resolve(true);
            }); 
    }
};

function TwinTron_CordovaBuilder$Factory(opts) {
    return new TwinTron_CordovaBuilder(opts);
}
TwinTron_CordovaBuilder$Factory.prototype=TwinTron_CordovaBuilder.prototype;

module.exports=TwinTron_CordovaBuilder$Factory;
