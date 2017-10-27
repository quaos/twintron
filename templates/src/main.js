
//Global namespaces
var TwinTron=window.TwinTron || {};

(function TwinTron_WebApp$Closure() {
    var utils=require("./q-utils");
    var _twintron=require("./twintron");
    utils.merge(TwinTron, _twintron, true);
    var navlinks=require("./navlinks");

    /*return require("./q-utils", true)
        .then(function(utils) {
            _deps.utils=utils;
            return require("./twintron", true);
        })
        .then(function(twintron) {
            _deps.TwinTron=twintron;
            _deps.utils.merge(TwinTron,twintron);
            return require("./navlinks", true);
        })
        .then(function(navlinks) {
            _deps.navlinks=navlinks;
    */

    function TwinTron_WebApp(opts) {
        this.opts=opts || {};
        if (opts) {
            this.document=opts.document || document;
            this.window=opts.window || window;
            this.jQuery=opts.jQuery || jQuery;
        }
    };
    TwinTron_WebApp.prototype={
        constructor: TwinTron_WebApp,
        opts: null,
        document: null,
        window: null,
        jQuery: null,
        mainNav: null,

        initialize: function() {
            var app=this;
            var doc=this.document;
            var win=this.window;
            var j$=this.jQuery;
            var mainNav=doc.getElementById("mainNav");

            //Attach navigation controller (Auto create if not existing)
            if (!win.navigationController) {
                console.warn("No navigation controller, creating standalone one");
                win.navigationController=new TwinTron.NavigationController({ });
                win.navigationController.on(TwinTron.NavigationController.EVT_LINK, function onLink(evt) {
                    console.log("Navigating to: "+evt.url);
                    win.location.href=evt.url;
                });
            }
            var links=win.navigationController.links;
            //TEST {
            console.log(links);
            // }
            if ((!links) || (links.length <= 0)) {
                links=navlinks(TwinTron,win.navigationController).init();
            }

            //Initialize nav UI
            var ulNode=mainNav.querySelector("ul");
            if (!ulNode) {
                ulNode=doc.createElement("ul");
                mainNav.appendChild(ulNode);
            }
            (links) && links.forEach(function(link) {
                var liNode=doc.createElement("li");
                if (link.active) {
                    liNode.classList.add("active");
                    liNode.classList.add("nav-active");
                } else {
                    liNode.classList.remove("active");
                    liNode.classList.remove("nav-active");
                }
                ulNode.appendChild(liNode);
                if (link.icon) {
                    var iconNode=doc.createElement("span");
                    iconNode.classList.add("glyphicon");
                    iconNode.classList.add("glyphicon-"+link.icon);
                    liNode.appendChild(iconNode);
                }
                var aNode=doc.createElement("a");
                aNode.href=link.url;
                aNode.appendChild(doc.createTextNode(link.title || link.url));
                j$(aNode).click(function onLinkClicked(evt) {
                    evt.preventDefault();
                    win.navigationController.pushURL(this.href);
                    return false;
                });
                liNode.appendChild(aNode);
            });
            this.mainNav=mainNav;
            j$(this.mainNav).show();

            console.log("TwinTron Web App initialized");
        }
    };
    TwinTron.WebApp=TwinTron_WebApp;
    
    return TwinTron_WebApp;
})();
