
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
    }
};

module.exports=utils;
