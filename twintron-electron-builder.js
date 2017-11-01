var fs = require("fs-extra");
var path = require("path");
var child_process=require("child_process");

var utils=require("./q-utils");

function TwinTron_ElectronBuilder(opts) {
    this.opts=opts || {};
}
utils.merge(TwinTron_ElectronBuilder, {
    //statics
    DEFAULT_ELECTRON_VERSION: "1.7.9"
});
TwinTron_ElectronBuilder.prototype={
    constructor: TwinTron_ElectronBuilder,
    opts: null,
    
    init: function(args) {
        var _static=TwinTron_ElectronBuilder;
        var builder=this;
        var modDir=__dirname;
        var tmplDir=path.join(__dirname,"templates","electron");
        var workDir=this.opts.workDir || process.cwd();
        var webDir=path.join(workDir,"www");
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
                //Step 1: Copy dependency files to main dir
                var depsFiles=[ "twintron.js", "q-utils.js" ];
                console.log("Copying dependency files from source path: "+modDir);
                var proms=[];
                depsFiles.forEach(function(fName) {
                    var srcPath=path.join(modDir,fName);
                    var srcExt=path.extname(fName);
                    var destDir2=destDir;
                    /*if ((!srcExt) && (srcExt !== 0)) {
                    } else if (srcExt === ".js") {
                        destDir2=path.join(destDir,"assets","js");
                    } else if (srcExt === ".css") {
                        destDir2=path.join(destDir,"assets","css");
                    } else if (srcExt.match(/^\.(png|jpg|jpeg|gif|tif|tiff|svg|ico)$/i)) {
                        destDir2=path.join(destDir,"assets","img");
                    }*/
                    var destPath=path.join(destDir2,fName);
                    
                    console.log("Copying: "+srcPath+" -> "+destPath);
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
                //Step 2: Copy template files
                console.log("Copying files from source path: "+tmplDir+" -> "+destDir);
                var excludedFiles=[ ".git", ".gitignore", "package.json", "package-lock.json" ];
                return utils.copyTree(tmplDir,destDir,function(fName) {
                    var included=(excludedFiles.indexOf(fName) < 0);
                    (included) && console.log("Copying: "+fName);
                    return included;
                });
            })
            .then(function() {
                //Step 3: Copy web files
                return builder.prebuild(config);
            })
            .then(function() {
                console.log("Task finished: init");
                return Promise.resolve(true);
            }); 
    },
    build: function(args) {
        var _static=TwinTron_ElectronBuilder;
        var builder=this;
        var modDir=__dirname;
        //var tmplDir=path.join(__dirname,"templates","electron");
        var workDir=this.opts.workDir || process.cwd();
        var srcDir=path.join(workDir,"src");
        var webDir=path.join(workDir,"www");
        var destDir=path.join(workDir,"electron");
        var platform=(args) ? args.shift() : null;
        var arch=(args) ? args.shift() : null;
        
        var config=this.opts;
        var appName;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.electron) && utils.merge(config, packageObj.electron);
                appName=config.appName || packageObj.name;
                
                console.log("Building electron app: "+appName);
                return builder.prebuild(config);
            })
            /*.then(function() {
                var mainJsFile=config.mainJsFile || "main.js";
                //var mainJsPath=path.join("src",mainJsFile);
                var mainJsBundleFile=config.mainJsFile || "main-bundle.js";
                var mainJsBundlePath=path.join(destDir,"assets","js",mainJsBundleFile);
                
                console.log("Compiling sources & dependency JS files");
                var cmd="browserify";
                var cmdArgs=[ mainJsFile, "-o", mainJsBundlePath ];
                return utils.exec(cmd,cmdArgs,srcDir);
            })*/
            .then(function() {
                var cmd="npm";
                var cmdArgs=[ "install" ];
                return utils.exec(cmd,cmdArgs,destDir);
            })
            .then(function() {
                var cmd="electron-packager";
                var cmdArgs=[ ".", appName, "--ignore=\\.gitignore" ];
                (platform) && cmdArgs.push("--platform="+platform);
                (arch) && cmdArgs.push("--arch="+arch);
                var rtVersion=config.electronVersion || _static.DEFAULT_ELECTRON_VERSION;
                (rtVersion) && cmdArgs.push("--electron-version="+rtVersion);
                cmdArgs.push("--out=./build");
                (args) && args.forEach(function(arg) {
                    cmdArgs.push(arg);
                });
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
        //var tmplDir=path.join(__dirname,"templates","electron");
        var workDir=this.opts.workDir || process.cwd();
        var destDir=path.join(workDir,"electron");
        
        var cmd="electron";
        var cmdArgs=[ "." ];
        (args) && args.forEach(function(arg) {
            cmdArgs.push(arg);
        });
        return utils.exec(cmd,cmdArgs,destDir);
    },
    
    //TODO: Revise this later {
    prebuild: function(config) {
         var _static=TwinTron_ElectronBuilder;
        var builder=this;
        var modDir=__dirname;
        var workDir=this.opts.workDir || process.cwd();
        var webDir=path.join(workDir,"www");
        var destDir=path.join(workDir,"electron");
        
        console.log("Copying files from source path: "+webDir+" -> "+destDir);
        var excludedFiles=[ ".git", ".gitignore", "package.json", "package-lock.json" ];
        return utils.copyTree(webDir,destDir,function(fName) {
            var included=(excludedFiles.indexOf(fName) < 0);
            (included) && console.log("Copying: "+fName);
            return included;
        });
    }
    // }
};

function TwinTron_ElectronBuilder$Factory(opts) {
    return new TwinTron_ElectronBuilder(opts);
}
TwinTron_ElectronBuilder$Factory.prototype=TwinTron_ElectronBuilder.prototype;

module.exports=TwinTron_ElectronBuilder$Factory;
