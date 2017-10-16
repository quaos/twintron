var fs = require('fs-extra');

console.log("Starting: build-electron");
try {
    var wwwFiles=fs.readdirSync("www/");
    (wwwFiles) && (wwwFiles.forEach(function(f) {
        var srcF="www/"+f;
        var destF=(f === "index.electron.html") ? "index.html" : f;
        destF="electron/www/"+destF;
        console.log("Copying: "+srcF+" -> "+destF);
        fs.copySync(srcF, destF, {
            overwrite: true
        });
    }));
    
    //TODO: Revise this later {
    var mainFiles=[
        "main.electron.js" 
    ];
    (mainFiles.forEach(function(f) {
        var srcF=f;
        var destF=(f === "main.electron.js") ? "main.js" : f;
        destF="electron/"+destF;
        console.log("Copying: "+srcF+" -> "+destF);
        fs.copySync(srcF, destF, {
            overwrite: true
        });
    }));
    // }

    console.log("Done.");
} catch (err) {
    console.error(err);
}
