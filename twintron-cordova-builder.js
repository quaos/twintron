var fs = require('fs-extra');

console.log("Starting: build-cordova");
try {
    var wwwFiles=fs.readdirSync("www/");
    (wwwFiles) && (wwwFiles.forEach(function(f) {
        var srcF="www/"+f;
        var destF=(f === "index.cordova.html") ? "index.html" : f;
        destF="cordova/www/"+destF;
        console.log("Copying: "+srcF+" -> "+destF);
        fs.copySync(srcF, destF, {
            overwrite: true
        });
    }));

    console.log("Done.");
} catch (err) {
    console.error(err);
}
