var fs = require("fs-extra");
var path = require("path");
var child_process=require("child_process");

var utils=require("./q-utils");

function TwinTron_CordovaBuilder(opts) {
    this.opts=opts;
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
        
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                var config=packageObj.cordova;
                var appName=config.appName || packageObj.name;
                var bundleID=config.bundleID || "quaos.twintron.template";
        
                console.log("Initializing cordova app: "+appName+"; bundle ID: "+bundleID);
                var cmd="cordova create "+appName+" "+bundleID+" cordova";
                var cmdOpts={
                    cwd: workDir
                };
                return new Promise(function(resolve,reject) {
                    child_process.exec(cmd,cmdOpts,function(err,outBuf,errBuf) {
                        console.log(outBuf);
                        console.log(errBuf);
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(outBuf);
                    });
                });
            })
            .then(function() {
                return fs.ensureDir(destDir);
            })
            .then(function() {
                return builder.copyTree(tmplDir,destDir);
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
                (packageObj.electron) && utils.merge(config, packageObj.electron);
                var appName=config.appName || packageObj.name;
                var bundleID=config.bundleID || "quaos.twintron.template";
                
                console.log("Building cordova app: "+appName+"; bundle ID: "+bundleID);
                return builder.copyTree(srcDir,destDir,function(fName) {
                    return (excludedFiles.indexOf(fName) < 0);
                });
            })
            .then(function() {
                return new Promise(function(resolve,reject) {
                    var eBuildOpts={
                        cwd: destDir
                    };
                    child_process.exec("ebuild .",eBuildOpts,function(err,stdout,stderr) {
                        console.log(stdout);
                        console.log(stderr);
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
    },
    
    copyTree: function(srcDir,destDir,srcFilter) {
        console.log("Copying files from source path: "+srcDir+" -> "+destDir);
        return fs.readdir(srcDir)
            .then(function(srcFiles) {
                var proms=[];
                (srcFiles) && (srcFiles.forEach(function(fName) {
                    if (srcFilter) {
                        var fltResult=srcFilter(fName);
                        if (!fltResult) {
                            return false;
                        }
                        (typeof fltResult === "string") && (fName=fltResult);
                    }
                    var srcPath=path.join(srcDir,fName);
                    var destPath=path.join(destDir,fName);
                    
                    console.log("Copying: "+fName);
                    //console.log("Copying file: "+srcPath+" -> "+destPath); 
                    
                    proms.push(fs.copy(srcPath,destPath, {
                        overwrite: true
                    }));
                }));
                return Promise.all(proms);
            });
    }
};

function TwinTron_CordovaBuilder$Factory(opts) {
    return new TwinTron_CordovaBuilder(opts);
}
TwinTron_CordovaBuilder$Factory.prototype=TwinTron_CordovaBuilder.prototype;

module.exports=TwinTron_CordovaBuilder$Factory;
