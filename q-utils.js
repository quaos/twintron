
var path=require("path");

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
        childProto2._super=parent;
        childProto2.constructor._super=parent;
        (childProto) && utils.merge(childProto2,childProto);
        (childStatic) && utils.merge(childProto2.constructor,childStatic);
        return childProto2;
    },
    
    makeFactory: function(cls,fac) {
        if (!fac) {
            
        }
        utils.merge(fac,cls);
        fac.prototype=cls.prototype;
    },
    
    copyTree: function(srcDir,destDir,srcFilter) {
        var fs=require("fs-extra");
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
    }
};

module.exports=utils;
