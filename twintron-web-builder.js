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
        var tmplSrcDir=path.join(modDir,"templates","src");
        var tmplWebDir=path.join(modDir,"templates","www");
        var workDir=this.opts.workDir || process.cwd();
        var srcDir=path.join(workDir,"src");
        var webDir=path.join(workDir,"www");
        
        var config=this.opts;
        var srcMainPageFile="index.html";
        var destMainPageFile=srcMainPageFile;
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.twintron) && utils.merge(config, packageObj.twintron);
                var appName=config.appName || packageObj.name;
                (config.mainPageFile) && (destMainPageFile=config.mainPageFile);
                
                console.log("Initializing twintron web app: "+appName+"; main page: "+destMainPageFile);
                return fs.ensureDir(webDir);
            })
            .then(function() {
                var srcMainPagePath=path.join(tmplWebDir,srcMainPageFile);
                console.log("Copying web content files from path: "+tmplWebDir+" -> "+webDir);
                return utils.copyTree(tmplWebDir,webDir,function(fName) {
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
                return fs.ensureDir(srcDir);
            })
            .then(function() {
                console.log("Copying JS source files from path: "+tmplSrcDir+" -> "+srcDir);
                return utils.copyTree(tmplSrcDir,srcDir,function(fName) {
                    console.log("Copying: "+fName);
                    return true;
                });
            })
            .then(function() {
                var depsFiles=[ "twintron.js", "q-utils.js" ];
                console.log("Copying dependency JS files from path: "+modDir+" -> "+srcDir);
                var proms=[];
                depsFiles.forEach(function(fName) {
                    var srcPath=path.join(modDir,fName);
                    var srcExt=path.extname(fName);
                    var destDir2=srcDir;
                    /*if ((!srcExt) && (srcExt !== 0)) {
                    } else if (srcExt === ".js") {
                        destDir2=path.join(destDir,"assets","js");
                    } else if (srcExt === ".css") {
                        destDir2=path.join(destDir,"assets","css");
                    } else if (srcExt.match(/^\.(png|jpg|jpeg|gif|tif|tiff|svg|ico)$/i)) {
                        destDir2=path.join(destDir,"assets","img");
                    }*/
                    var destPath=path.join(destDir2,fName);
                    
                    console.log("Copying: "+fName+" -> "+destPath);
                    proms.push(fs.ensureDir(destDir2)
                        .then(function() {
                            return fs.copy(srcPath,destPath, {
                                overwrite: true
                            });
                        })
                    );
                });
                return Promise.all(proms);
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
        var workDir=this.opts.workDir || process.cwd();
        var srcDir=path.join(workDir,"src");
        var webDir=path.join(workDir,"www");
        var excludedFiles=[ "package.json" ];
        
        //TODO:
        var config={};
        utils.merge(config, this.opts);
        return fs.readJson(path.join(workDir,"package.json"))
            .then(function(packageObj) {
                (packageObj.twintron) && utils.merge(config, packageObj.twintron, true);
                var appName=config.appName || packageObj.name;
                
                console.log("Building twintron web app: "+appName);
                var cmd="npm";
                var cmdArgs=[ "install" ];
                return utils.exec(cmd,cmdArgs,srcDir);
            })
            .then(function() {
                var mainJsFile=config.mainJsFile || "main.js";
                //var mainJsPath=path.join("src",mainJsFile);
                var mainJsBundleFile=config.mainJsFile || "main-bundle.js";
                var mainJsBundlePath=path.join(webDir,"assets","js",mainJsBundleFile);
                
                console.log("Compiling sources & dependency JS files");
                var cmd="browserify";
                var cmdArgs=[ mainJsFile, "-o", mainJsBundlePath ];
                return utils.exec(cmd,cmdArgs,srcDir);
            })
            .then(function() {
                console.log("Task finished: build");
                return Promise.resolve(true);
            });
    },
    
    run: function(args) {
        var builder=this;
        var modDir=__dirname;
        var workDir=process.cwd();
        var webDir=path.join(workDir,"www");
        var port = ((args.length >= 1) ? args[0] : null) || 8080;
        
        var http=require("http");
        var url = require("url");
        var opn=require("opn");
        
        return new Promise(function(resolve,reject) {
            /**
             * Thanks to ryanflorence from:
             * https://gist.github.com/ryanflorence/701407
             */

            var mimeTypesMap={
                ".txt": "text/plain",
                ".html": "text/html",
                ".htm": "text/html",
                ".xhtml": "text/xhtml",
                ".js": "text/javascript",
                ".css": "text/css",
                ".txt": "text/plain",
                ".json": "application/json",
                ".xml": "text/xml",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".gif": "image/gif",
                ".tif": "image/tiff",
                ".tiff": "image/tiff",
                ".ico": "image/ico"
            };
            function httpServer_onFileNotFound(req,resp,uri) {
                console.error("404 "+uri);
                resp.writeHead(404, { "Content-Type": "text/plain" });
                resp.write("404 Not Found\n");
                resp.end();
                return Promise.reject(false);
            }
            function httpServer_onForbidden(req,resp,uri) {
                console.error("403 "+uri);
                resp.writeHead(403, { "Content-Type": "text/plain" });
                resp.write("403 Forbidden\n");
                resp.end();
                return Promise.reject(false);
            }
            function httpServer_onError(err,req,resp,uri) {
                console.error("500 "+uri);
                console.error(err);
                resp.writeHead(500, { "Content-Type": "text/plain" });
                resp.write("500 Internal Server Error\n");
                resp.end();
                return Promise.reject(false);
            }
            function httpServer_handleRequest(req, resp) {
                var uri = url.parse(req.url).pathname;
                var filename = path.join(webDir, uri);
                fs.pathExists(filename)
                    .then(function(exists) {
                        if (!exists) {
                            return httpServer_onFileNotFound(req,resp,uri);
                        }
                        return fs.stat(filename);
                    })
                    .then(function(fstat) {
                        if (!fstat) {
                            console.error("Failed to read file stat: "+filename);
                            return httpServer_onForbidden();
                        }
                        if (fstat.isDirectory()) {
                            filename += "/index.html";
                            return fs.pathExists(filename)
                                .then(function(exists) {
                                    if (!exists) {
                                        return httpServer_onForbidden();
                                    }
                                    return Promise.resolve(exists);
                                });
                        }
                        return Promise.resolve(true);
                    })
                    .then(function(exists) {
                        if (!exists) {
                            return httpServer_onFileNotFound(req,resp,uri);
                        }
                        return fs.readFile(filename, "binary");
                    })
                    .then(function(content) {
                        var fext=path.extname(filename);
                        var mimeType=(((fext) || (fext === 0)) ? mimeTypesMap[fext] : null) || "application/octet-stream";
                        resp.writeHead(200, { "Content-Type": mimeType });
                        resp.write(content, "binary");
                        resp.end();
                    })
                    .catch(function(err) {
                        if (err === false) {
                            return;
                        }
                        httpServer_onError(err,req,resp,uri);
                    });
            }
            try {
                console.log("Starting HTTP Server on port: "+port);
                console.log("Web directory: "+webDir);
                var httpServer=http.createServer(httpServer_handleRequest);
                httpServer.on("listening",function() {
                    var url="http://localhost:"+port+"/";
                    console.log("Opening URL: "+url);
                    opn(url);
                });
                httpServer.on("connection",function(socket) {
                    console.log("New client connected from: "+socket.remoteAddress+":"+socket.remotePort);
                });
                httpServer.on("error",function(err) {
                    reject(err);
                });
                httpServer.on("exit",function() {
                    console.log("HTTP Server closed");
                    resolve(0);
                });
                process.on("SIGINT", function() {
                    console.log("Process interrupted");
                    resolve(0);
                });
                process.on("SIGTERM", function() {
                    console.log("Process terminated");
                    resolve(0);
                });
                httpServer.listen(parseInt(port, 10));
            } catch (err) {
                reject(err);
            }
        });
        /*
        .then(function(rc) {
            return Promise.resolve(rc);
        });
        */
    }
};

function TwinTron_WebBuilder$Factory(opts) {
    return new TwinTron_WebBuilder(opts);
}
utils.makeFactory(TwinTron_WebBuilder,TwinTron_WebBuilder$Factory);

module.exports=TwinTron_WebBuilder$Factory;
