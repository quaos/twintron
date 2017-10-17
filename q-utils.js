
module.exports={
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
    }
};
