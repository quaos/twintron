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

//Namespaces
var TwinTron=TwinTron || {};

//TODO: Revise this soon {
//(function TwinTron_CordovaApp$Closure(_namespace) {
var _deps={
    utils: null,
    TwinTron: null
};
require("./q-utils")
    .then(function(utils) {
        _deps.utils=utils;
        return require("./twintron");
    })
    .then(function(twintron) {
        _deps.TwinTron=twintron;
        _deps.utils.merge(TwinTron,twintron);

        function TwinTron_StorageImpl_Cordova(opts) {    
           this.opts=opts;
        };
        TwinTron_StorageImpl_Cordova.prototype={
            opts: null,

        };
        function TwinTron_StorageImpl_Cordova$Factory(opts) {
           return new TwinTron_StorageImpl_Cordova(opts);
        };
        _deps.utils.makeFactory(TwinTron_StorageImpl_Cordova, TwinTron_StorageImpl_Cordova$Factory);
        TwinTron.Storage=TwinTron_StorageImpl_Cordova$Factory;

        function TwinTron_CordovaApp(opts) {
            if (opts) {
                this.document=opts.document || document;
                this.window=opts.window || window;
                this.jQuery=opts.jQuery || jQuery;
            }
        };
        TwinTron_CordovaApp.prototype={
            constructor: TwinTron.CordovaApp,
            document: null,
            window: null,
            jQuery: null,
            navigationController: null,
            mainContainer: null,

            // Application Constructor
            initialize: function() {
                var _static=TwinTron_CordovaApp;
                var app=this;
                var win=this.window;
                var j$=this.jQuery;
                this.navigationController=TwinTron.NavigationController({
                    /*links: [
                        { title: "Home", url: "index.html" },
                        { title: "About", url: "about.html" },
                    ]*/
                });
                this.navigationController.on(TwinTron.NavigationController.EVT_LINK, function onLink(evt) {
                    //win.location.href=evt.link.url;
                    console.log("Navigating to page: "+evt.link.url);
                    //TODO:
                });
                
                this.mainContainer=this.document.getElementById("mainContainer");
                j$(this.mainContainer).hide();

                this.document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);

                console.log("TwinTron CordovaApp initialized");
            },

            // deviceready Event Handler
            //
            // Bind any cordova events here. Common events are:
            // 'pause', 'resume', etc.
            onDeviceReady: function() {
                var win=this.window;
                var j$=this.jQuery;
                
                //Inject TwinTron API and instance objects into mainContainer IFrame's Window
                this.mainContainer.contentWindow.TwinTron=TwinTron;
                this.mainContainer.contentWindow.app=this;
                this.mainContainer.contentWindow.navigationController=this.navigationController;
        
                this.mainContainer.src="index.html";
                this.mainContainer.width=win.clientWidth;
                this.mainContainer.height=win.clientHeight;
                j$(this.mainContainer).show();

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
        };

        function TwinTron_CordovaApp$Factory(opts) {
            return new TwinTron_CordovaApp(opts);
        };
        TwinTron_CordovaApp$Factory.prototype=TwinTron_CordovaApp.prototype;

        _deps.TwinTron.CordovaApp=TwinTron_CordovaApp$Factory;
        //(_namespace) && (_namespace.CordovaApp=TwinTron_CordovaApp$Factory);
        return Promise.resolve(TwinTron_CordovaApp$Factory);
    })
    .then(function() {
        /**
         * Code to initialize TwinTron.CordovaApp:
         */
        var app=TwinTron.CordovaApp({
            document: document,
            window: window,
            jQuery: jQuery.noConflict(true)
        });
        document.addEventListener("DOMContentLoaded", app.initialize.bind(app));
    })
    .catch(function(err) {
        console.error(err);
    });
//})(TwinTron)
// }
