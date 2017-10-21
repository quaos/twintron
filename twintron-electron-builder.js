var fs = require("fs-extra");
var path = require("path");
var child_process=require("child_process");

var utils=require("./q-utils");

function TwinTron_ElectronBuilder(opts) {
    this.opts=opts || {};
}
TwinTron_ElectronBuilder.prototype={
    constructor: TwinTron_ElectronBuilder,
    opts: null,
    
    init: function(args) {
        var builder=this;
        var modDir=__dirname;
        var tmplDir=path.join(__dirname,"templates","electron");
        var workDir=this.opts.workDir || ".";
        var destDir=path.join(workDir,"electron");
        
        var config=this.opts;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.electron) && utils.merge(config, packageObj.electron);
                var appName=config.appName || packageObj.name;
                
                console.log("Initializing electron app: "+appName);
                return fs.ensureDir(destDir);
            })
            .then(function() {
                var depsFiles=[ "twintron.js", "q-utils-node.js" ];
                console.log("Copying dependencies files from source path: "+modDir+" -> "+destDir);
                return utils.copyTree(modDir,destDir,function(fPath) {
                    var fName=path.relative(modDir,fPath);
                    //console.log(fName);
                    var included=(depsFiles.indexOf(fName) >= 0);
                    (included) && console.log("Copying: "+fName);
                    return included;
                });
            })
            .then(function() {
                console.log("Copying files from source path: "+tmplDir+" -> "+destDir);
                return utils.copyTree(tmplDir,destDir,function(fName) {
                    var included=true; //(excludedFiles.indexOf(fName) < 0);
                    (included) && console.log("Copying: "+fName);
                    return included;
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
        //var tmplDir=path.join(__dirname,"templates","electron");
        var workDir=this.opts.workDir || ".";
        var srcDir=path.join(workDir,"www");
        var destDir=path.join(workDir,"electron");
        var excludedFiles=[ "package.json" ];
        
        var config=this.opts;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.electron) && utils.merge(config, packageObj.electron);
                var appName=config.appName || packageObj.name;
                
                console.log("Building electron app: "+appName);
                console.log("Copying files from source path: "+srcDir+" -> "+destDir);
                return utils.copyTree(srcDir,destDir,function(fName) {
                    var included=(excludedFiles.indexOf(fName) < 0);
                    (included) && console.log("Copying: "+fName);
                    return included;
                });
            })
            .then(function() {
                return new Promise(function(resolve,reject) {
                    var cmd="npm install";
                    var cmdOpts={
                        cwd: destDir
                    };
                    console.log("> "+cmd);
                    child_process.exec(cmd,cmdOpts,function(err,stdout,stderr) {
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
                return new Promise(function(resolve,reject) {
                    var cmd="ebuild .";
                    var cmdOpts={
                        cwd: destDir
                    };
                    console.log("> "+cmd);
                    child_process.exec(cmd,cmdOpts,function(err,stdout,stderr) {
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

function TwinTron_ElectronBuilder$Factory(opts) {
    return new TwinTron_ElectronBuilder(opts);
}
TwinTron_ElectronBuilder$Factory.prototype=TwinTron_ElectronBuilder.prototype;

module.exports=TwinTron_ElectronBuilder$Factory;
