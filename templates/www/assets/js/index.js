
//Namespaces
var TwinTron=TwinTron || {};

(function TwinTron_WebApp$Closure(_namespace) {
    var _deps={
        utils: null,
        TwinTron: null,
        navlinks: null
    };
    
    return require("./q-utils")
        .then(function(utils) {
            _deps.utils=utils;
            return require("./twintron");
        })
        .then(function(twintron) {
            _deps.TwinTron=twintron;
            (_namespace) && _deps.utils.merge(_namespace,twintron);
            return require("./navlinks");
        })
        .then(function(navlinks) {
            _deps.navlinks=navlinks;
    
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
                            console.log("Navigating to: "+evt.link.url);
                        });
                    }
                    var links=win.navigationController.links;
                    if ((!links) || (links.length <= 0)) {
                        links=_deps.navlinks(_deps.TwinTron,win).init();
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
                            liNode.classList.add("nav-active");
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
            (_namespace) && (_namespace.WebApp=TwinTron_WebApp);
            return TwinTron_WebApp;
        });
})(TwinTron)
    .then(function() {    
        var app=new TwinTron.WebApp({
            document: document,
            window: window,
            jQuery: jQuery.noConflict(true)
        });
        document.addEventListener("DOMContentLoaded", app.initialize.bind(app));
    })
    .catch(function(err) {
        console.error(err);
    });
