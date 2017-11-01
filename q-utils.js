
var utils={
    merge: function(dest,src,deep) {
        for (var k in src) {
            if (!src.hasOwnProperty(k)) {
                continue;
            }
            if ((deep) && (dest[k]) && (src[k])) {
                merge(dest[k],src[k],deep);
            } else {
                dest[k]=src[k];
            }
        }
    },
    
    extendClass: function(parent,childProto,childStatic) {
        var childProto2=Object.create(parent.prototype);
        (childProto) && utils.merge(childProto2,childProto);
        (childStatic) && utils.merge(childProto2.constructor,childStatic);
        childProto2._super=parent;
        childProto2.constructor._super=parent;
        return childProto2;
    },
    
    makeFactory: function(cls,fac) {
        if (!fac) {
            fac=new function utils_factory() {
                var instance=Object.create(cls.prototype);
                var _constructor=cls.prototype.constructor || cls;
                _constructor.apply(instance,arguments);
                return instance;
            };
        }
        utils.merge(fac,cls);
        fac.prototype=cls.prototype;
        
        return fac;
    },
    
    copyTree: function(srcDir,destDir,srcFilter) {
        var fs=require("fs-extra");
        var path=require("path");
        //console.log("Copying files from source path: "+srcDir+" -> "+destDir);
        return fs.readdir(srcDir)
            .then(function(srcFiles) {
                var proms=[];
                (srcFiles) && (srcFiles.forEach(function(fName) {
                    var srcPath=path.join(srcDir,fName);
                    if (srcFilter) {
                        var fltResult=srcFilter(srcPath);
                        if (!fltResult) {
                            return false;
                        }
                        if (typeof fltResult === "string") {
                            fName=fltResult;
                            srcPath=path.join(srcDir,fName);
                        }
                    }
                    var destPath=path.join(destDir,fName);
                    
                    //console.log("Copying: "+fName);
                    //console.log("Copying file: "+srcPath+" -> "+destPath); 
                    
                    proms.push(fs.copy(srcPath,destPath, {
                        overwrite: true
                    }));
                }));
                return Promise.all(proms);
            });
    },
    
    exec: function(cmd,args,workDir,env) {
        var child_process=require("child_process");
        var cmdOpts={
            cwd: workDir,
            env: env,
            stdio: "inherit"
        };
        console.log("> "+cmd+" "+args.join(" "));
        return new Promise(function(resolve,reject) {
            var ps=child_process.spawn(cmd,args,cmdOpts);
            ps.on("exit", function (code, signal) {
                if (code !== 0) {
                    var err=new Error("Command exited with code ["+code+"], signal: "+signal);
                    reject(err);
                    return;
                }
                resolve(code);
            });
        });
    }
};

module.exports=utils;
