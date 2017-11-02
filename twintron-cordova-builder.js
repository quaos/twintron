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
        var webDir=path.join(workDir,"www");
        var destDir=path.join(workDir,"cordova");
        var destWebDir=path.join(destDir,"www");
        var mainPageFile="twintron.cordova.html";
        var cordovaConfPath=path.join(destDir,"config.xml");
        var platform=(args) ? args.shift() : null;
        
        var config=this.opts;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.cordova) && utils.merge(config, packageObj.cordova);
                var appName=config.appName || packageObj.name;
                var bundleID=config.bundleID || "quaos.twintron.template";
                (config.mainPageFile) && (mainPageFile=config.mainPageFile);
        
                //Step 1: Cordova create (if not existing project)
                console.log("Initializing Cordova app: "+appName+"; bundle ID: "+bundleID);
                return fs.pathExists(cordovaConfPath)
                    .then(function(exists) {
                        if (exists) {
                            //Skip
                            console.log("Detected existing Cordova config file, skipping create");
                            return Promise.resolve(true);
                        }
                        var cmd="cordova";
                        var cmdArgs=["create","cordova",bundleID,appName];
                        return utils.exec(cmd,cmdArgs,workDir);
                    });
            })
            .then(function() {
                //Step 2A: Add platform
                if (!platform) {
                    return Promise.resolve(null);
                }
                var cmd="cordova";
                var cmdArgs=[ "platform","add",platform ];
                return utils.exec(cmd,cmdArgs,destDir);
                
            })
            .then(function() {
                //Step 3: Copy template files
                return fs.ensureDir(destDir)
                    .then(function() {
                        console.log("Copying files from source path: "+tmplDir+" -> "+destDir);
                        var excludedFiles=[ ".git", ".gitignore", "package.json", "package-lock.json" ];
                        return utils.copyTree(tmplDir,destDir,function(fName) {
                            var included=(excludedFiles.indexOf(fName) < 0);
                            (included) && console.log("Copying: "+fName);
                            return (included);
                        });
                    });
            })
            .then(function() {
                //Step 4: Copy web files
                return builder.prebuild(config);
            })
            .then(function() {
                //Step 5: Copy dependency files to target src dir
                var depsFiles=[ "twintron.js", "q-utils.js" ];
                console.log("Copying dependency files from source path: "+modDir);
                var proms=[];
                depsFiles.forEach(function(fName) {
                    var srcPath=path.join(modDir,fName);
                    //var srcExt=path.extname(fName);
                    var destSrcDir=path.join(destDir,"src");
                    var destPath=path.join(destSrcDir,fName);
                    
                    console.log("Copying: "+srcPath+" -> "+destPath);
                    proms.push(fs.ensureDir(destSrcDir)
                        .then(function() {
                            return fs.copy(srcPath,destPath, {
                                overwrite: true
                            });
                        })
                    );
                });
            })
            .then(function() {
                //Step 5: Parse & modify some parameters in Cordova config.xml        
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
        var srcDir=path.join(workDir,"src");
        var webDir=path.join(workDir,"www");
        var destDir=path.join(workDir,"cordova");
        var destSrcDir=path.join(destDir, "src");
        var destWebDir=path.join(destDir, "www");
        
        var config=this.opts;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.cordova) && utils.merge(config, packageObj.cordova);
                var appName=config.appName || packageObj.name;
                var bundleID=config.bundleID || "quaos.twintron.template";
                
                //Step 1: Copy web files
                console.log("Building cordova app: "+appName+"; bundle ID: "+bundleID);
                return builder.prebuild(config);
            })
            .then(function() {
                //Step 2: NPM Install
                var cmd="npm";
                var cmdArgs=[ "install" ];
                return utils.exec(cmd,cmdArgs,destSrcDir);
            })
            .then(function() {
                //Step 3: Compile source files
                var mainJsFile=config.mainJsFile || "twintron.cordova.js";
                //var mainJsPath=path.join("src",mainJsFile);
                var mainJsBundleFile=config.mainJsFile || "twintron.cordova.bundle.js";
                var mainJsBundlePath=path.join(destWebDir,"assets","js",mainJsBundleFile);
                
                console.log("Compiling sources & dependency JS files");
                var cmd="browserify";
                var cmdArgs=[ mainJsFile, "-o", mainJsBundlePath ];
                return utils.exec(cmd,cmdArgs,destSrcDir);
            })
            .then(function() {
                var cmd="cordova";
                var cmdArgs=[ "build" ];
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
        var workDir=this.opts.workDir || process.cwd();
        var destDir=path.join(workDir,"cordova");
        
        var config=this.opts;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.cordova) && utils.merge(config, packageObj.cordova);
                var appName=config.appName || packageObj.name;
                var bundleID=config.bundleID || "quaos.twintron.template";
                
                var cmd="cordova";
                var cmdArgs=[ "run" ];
                (args) && args.forEach(function(arg) {
                    cmdArgs.push(arg);
                });
                return utils.exec(cmd,cmdArgs,destDir,process.env);
            });
    },
    
    //TODO: Revise this later {
    prebuild: function(config) {
         var _static=TwinTron_CordovaBuilder;
        var builder=this;
        var modDir=__dirname;
        var workDir=this.opts.workDir || process.cwd();
        var webDir=path.join(workDir,"www");
        var destDir=path.join(workDir,"cordova","www");
        
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

function TwinTron_CordovaBuilder$Factory(opts) {
    return new TwinTron_CordovaBuilder(opts);
}
TwinTron_CordovaBuilder$Factory.prototype=TwinTron_CordovaBuilder.prototype;

module.exports=TwinTron_CordovaBuilder$Factory;
