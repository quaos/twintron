var fs = require("fs-extra");
var path = require("path");
//var child_process=require("child_process");

var utils=require("./q-utils");

function TwinTron_WebBuilder(opts) {
    this.opts=opts || {};
}
TwinTron_WebBuilder.prototype={
    constructor: TwinTron_WebBuilder,
    opts: null,
    
    init: function(args) {
        var builder=this;
        var modDir=__dirname;
        var tmplDir=path.join(__dirname,"templates","www");
        var workDir=this.opts.workDir || ".";
        var destDir=path.join(workDir,"www");
        
        var config=this.opts;
        var srcMainPageFile="index.html";
        var destMainPageFile=srcMainPageFile;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.twintron) && utils.merge(config, packageObj.twintron);
                var appName=config.appName || packageObj.name;
                (config.mainPageFile) && (destMainPageFile=config.mainPageFile);
                
                console.log("Initializing twintron web app: "+appName+"; main page: "+destMainPageFile);
                return fs.ensureDir(destDir);
            })
            .then(function() {
                var srcMainPagePath=path.join(tmplDir,srcMainPageFile);
                console.log("Copying files from source path: "+tmplDir+" -> "+destDir);
                return utils.copyTree(tmplDir,destDir,function(fName) {
                    if (fName === srcMainPagePath) {
                        console.log("Copying: "+fName+" -> "+destMainPageFile);
                        fName=destMainPageFile;
                        return fName;
                    }
                    console.log("Copying: "+fName);
                    return true;
                });
            })
            .then(function() {
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
        
        //TODO:
        console.warn("Not implemented yet");
        return Promise.resolve(false);
        
        /*
        var config=this.opts;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.electron) && utils.merge(config, packageObj.electron);
                var appName=config.appName || packageObj.name;
                
                console.log("Building electron app: "+appName);
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
            */
    }
};

function TwinTron_WebBuilder$Factory(opts) {
    return new TwinTron_WebBuilder(opts);
}
utils.makeFactory(TwinTron_WebBuilder,TwinTron_WebBuilder$Factory);

module.exports=TwinTron_WebBuilder$Factory;
