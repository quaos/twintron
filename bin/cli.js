#!/usr/bin/env node

//Namespaces
var TwinTron=TwinTron || {};

TwinTron.Builders=require("../twintron-builders");

var cli={
    parseArgs: function(args) {
        var req={
            target: null,
            action: null,
            args: []
        };
        //TEST {
        console.log(args);
        // }
        var n=(args) ? args.length : 0;
        var lastArg=null;
        for (var i=2;i < n;i++) {
            var arg=args[i];
            //TODO: Add options
            if (!req.target) {
                req.target=arg;
            } else if (!req.action) {
                req.action=arg;
            } else {
                req.args.push(arg);
            }
            lastArg=arg;
        }
        return Promise.resolve(req);
    },
    process: function(req) {
        var builder=null;
        if (req.target === "web") {
            builder=TwinTron.Builders.WebBuilder();
        } else if (req.target === "electron") {
            builder=TwinTron.Builders.ElectronBuilder();
        } else if (req.target === "cordova") {
            builder=TwinTron.Builders.CordovaBuilder();
        } else {
            var err=new Error("Unknown/unsupported target: "+req.target);
            return Promise.reject(err);
        }
        
        var result=0;
        if (req.action === "init") {
            result=builder.init(req.args);
        } else if (req.action === "build") {
            result=builder.build(req.args);
        } else if (req.action === "run") {
            result=builder.run(req.args);
        } else {
            var err=new Error("Unknown/unsupported action: "+req.action);
            return Promise.reject(err);
        }
        
        return result;
    }
};

module.exports=cli.parseArgs(process.argv)
    .then(function(req) {
        return cli.process(req);
    })
    .then(function(result) {
        console.log("Done. ("+result+")");
        process.exit(0);
    })
    .catch(function(err) {
        console.error(err);
        process.exit(-1);
    })
