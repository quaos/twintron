/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//Global Namespaces
var TwinTron=window.TwinTron || {};

var utils=require("./q-utils");
var _twintron=require("./twintron");
utils.merge(TwinTron, _twintron, true);

(function TwinTron_CordovaApp$Closure() {
    
    function TwinTron_StorageImpl_Cordova(opts) {    
       this.opts=opts || {};
    };
    var TwinTron_StorageImpl_Cordova_static={
        //statics
    };
    TwinTron_StorageImpl_Cordova.prototype=utils.extendClass(TwinTron.Storage, {
        constructor: TwinTron_StorageImpl_Cordova,
        opts: null,

        getItem: function(item) { 
            //TODO:
            throw new Error("Not implemented yet"); 
        },
        putItem: function(item) {
            //TODO:
            throw new Error("Not implemented yet"); 
        },
        removeItem: function(item) {
            //TODO:
            throw new Error("Not implemented yet"); 
        }
    }, TwinTron_StorageImpl_Cordova_static);
    
    TwinTron.Storage=utils.makeFactory(TwinTron_StorageImpl_Cordova, function TwinTron_StorageImpl_Cordova$Factory(opts) {
       return new TwinTron_StorageImpl_Cordova(opts);
    });

    function TwinTron_CordovaApp(opts) {
        TwinTron_CordovaApp._super.prototype.constructor.call(this,opts);
        /*if (opts) {
            this.document=opts.document || document;
            this.window=opts.window || window;
            this.jQuery=opts.jQuery || jQuery;
        }*/
    };
    var TwinTron_CordovaApp_static={
        //statics
    }
    TwinTron_CordovaApp.prototype=utils.extendClass(TwinTron.WebApp, {
        constructor: TwinTron_CordovaApp,
        
        /*document: null,
        window: null,
        jQuery: null,*/
        
        navigationController: null,
        mainContainer: null,

        // Application Constructor
        init: function() {
            var _static=TwinTron_CordovaApp;
            var app=this;
            var win=this.window;
            var doc=this.document;
            var j$=this.jQuery;
            
            return TwinTron_CordovaApp._super.prototype.init.call(this)
                .then(function() {
                    doc.addEventListener("deviceready", app.onDeviceReady.bind(app), false);
                    console.log("TwinTron CordovaApp initialized");
                });
            
            /*this.mainContainer=this.document.getElementById("mainContainer");
            j$(this.mainContainer).hide();
            /*
            console.log("Creating navigation controller from Cordova App");
            this.navigationController=TwinTron.NavigationController({
            });
            * /
           
            this.navigationController.on(TwinTron.NavigationController.EVT_LINK, function onLink(evt) {
                console.log("Navigating to page: "+evt.url+((evt.link) ? " ["+evt.link.title+"]" : ""));
                this.mainContainer.contentWindow.location.href=evt.url;
            });

            this.document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);

            console.log("TwinTron CordovaApp initialized");
            */
        },

        // deviceready Event Handler
        //
        // Bind any cordova events here. Common events are:
        // 'pause', 'resume', etc.
        onDeviceReady: function() {
            var win=this.window;
            var j$=this.jQuery;

            /*
            //Inject TwinTron API and instance objects into mainContainer IFrame's Window
            this.rootPageController.mainContainer.contentWindow.TwinTron=TwinTron;
            this.rootPageController.mainContainer.contentWindow.app=this;
            this.rootPageController.mainContainer.contentWindow.navigationController=this.navigationController;

            //this.mainContainer.src="home.html";
            this.rootPageController.mainContainer.width=win.clientWidth;
            this.rootPageController.mainContainer.height=win.clientHeight-this.mainContainer.offsetTop;
            j$(this.rootPageController.mainContainer).show();
             */
            //this.navigationController.pushURL("home.html");

            this.receivedEvent('deviceready');
        },

        // Update DOM on a Received Event
        receivedEvent: function(id) {
            var j$=this.jQuery;
            var parentElement = document.getElementById(id);
            var listeningElement = parentElement.querySelector('.listening');
            var receivedElement = parentElement.querySelector('.received');

            j$(listeningElement).hide();
            j$(receivedElement).show();

            console.log('Received Event: ' + id);
        }
    }, TwinTron_CordovaApp_static);

    TwinTron.CordovaApp=utils.makeFactory(TwinTron_CordovaApp, function TwinTron_CordovaApp$Factory(opts) {
        return new TwinTron_CordovaApp(opts);
    });
})();

TwinTron.createCordovaApp=function TwinTron_createCordovaApp(opts) {
    var navLinks=require("./navlinks");
    utils.merge(opts, {
        navigationLinks: navLinks
    }, true);
    var app=TwinTron.CordovaApp(opts);
    var doc=opts.document || document;
    doc.addEventListener("DOMContentLoaded", function onPageReady() {
        app.init()
            .then(function() {
                app.navigationController.pushURL("home.html");
            });
    }); 
    return app;
};

/*var jQuery=window.jQuery; //|| require("./assets/js/jquery-3.2.1.slim.min.js");
(function(doc,win,j$) {
    /**
     * Code to initialize TwinTron.CordovaApp:
     * /
    var app=TwinTron.CordovaApp({
        document: doc,
        window: win,
        jQuery: j$
    });
    doc.addEventListener("DOMContentLoaded", app.init.bind(app));
    
    return app;
})(document,window,jQuery.noConflict(true));
*/