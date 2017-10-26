/* 
 * Thanks to Lucio M. Tato from:
 * https://stackoverflow.com/questions/6971583/node-style-require-for-in-browser-javascript
 *
 * Q: Modified from sync to Promise-based
 * 
 */

//
///- REQUIRE FN
function require(url,sync) {
    if (url.toLowerCase().substr(-3)!=='.js') url+='.js'; // to allow loading without js suffix;
    if (!require.cache) require.cache=[]; //init cache
    var exports=require.cache[url]; //get from cache
    var prom=(exports)
        ? exports
        : new Promise(function(resolve,reject) {
            exports={};
            try {
                var reqErr=null;
                var req=new XMLHttpRequest();
                req.open("GET", url, (sync) ? false : true);
                req.onreadystatechange=function require_onReadyStateChange() {
                    if (req.readyState === XMLHttpRequest.DONE) {
                        if (reqErr) {
                            reject(reqErr);
                        } else {
                            resolve(req);
                        }
                    }
                };
                req.onerror=function require_onRequestError(evt) {
                    console.error(req);
                    reqErr=new Error("Error loading module "+url+": ");
                    reject(reqErr);
                };
                req.send();
            } catch (err) {
                console.error(err);
                reject(new Error("Error loading module "+url+": "+(err.message || err)));
            }
        })
        .then(function require_onResponse(req) {
            if ((req.status) && (req.status !== 200)) {
                var err=new Error("Got response status: "+req.status+" "+req.statusText);
                err.code=req.status;
                return Promise.reject(err);
            }
            var source = req.responseText;
            // fix (if saved form for Chrome Dev Tools)
            if (source.substr(0,10)==="(function(") { 
                var moduleStart = source.indexOf('{');
                var moduleEnd = source.lastIndexOf('})');
                var CDTcomment = source.indexOf('//@ ');
                if (CDTcomment>-1 && CDTcomment<moduleStart+6) moduleStart = source.indexOf('\n',CDTcomment);
                source = source.slice(moduleStart+1,moduleEnd-1); 
            } 
            // fix, add comment to show source on Chrome Dev Tools
            source="//@ sourceURL="+window.location.origin+url+"\n" + source;
            //------
            var module = { id: url, uri: url, exports:exports }; //according to node.js modules 
            var anonFn = new Function("require", "exports", "module", source); //create a Fn with module code, and 3 params: require, exports & module
            anonFn(require, exports, module); // call the Fn, Execute the module
            
            //TODO: Revise this later {
            require.cache[url]  = exports = module.exports; //cache obj exported by module
            
            return ((exports) && (exports.then) && (exports.then.call)) ? exports : Promise.resolve(exports);
            // }
        });
        
    return ((prom) && (prom.then) && (prom.then.call)) ? prom : Promise.resolve(prom);
}
///- END REQUIRE FN


