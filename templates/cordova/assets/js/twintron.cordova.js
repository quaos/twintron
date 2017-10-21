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

(function(_package) {
    function TwinTron_StorageImpl_Cordova(opts) {    
       this.opts=opts;
    };
    TwinTron_StorageImpl_Cordova.prototype={

    };
    function TwinTron_StorageImpl_Cordova$Factory(opts) {
       return new TwinTron_StorageImpl_Cordova(opts);
    };
    utils.makeFactory(TwinTron_StorageImpl_Cordova, TwinTron_StorageImpl_Cordova$Factory);
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
        mainContainer: null,

        // Application Constructor
        initialize: function() {
            
            
            
            var j$=this.jQuery;
            this.mainContainer=this.document.getElementById("mainContainer");
            j$(this.mainContainer).hide();
            
            this.document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

            console.log("TwinTron CordovaApp initialized");
        },

        // deviceready Event Handler
        //
        // Bind any cordova events here. Common events are:
        // 'pause', 'resume', etc.
        onDeviceReady: function() {
            var win=this.window;
            var j$=this.jQuery;
            //Inject TwinTron API into mainContainer IFrame's Window
            this.mainContainer.contentWindow.TwinTron=TwinTron;
			
            this.mainContainer.src="index.common.html";
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

    (_package) && (_package.CordovaApp=TwinTron_CordovaApp$Factory);
})(TwinTron);

/**
 * Sample code to initialize TwinTron.CordovaApp:
 */
var app=TwinTron.CordovaApp({
    document: document,
    window: window,
    jQuery: jQuery.noConflict(true)
});
document.addEventListener("DOMContentLoaded", app.initialize.bind(app));
