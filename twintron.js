
//Namespaces
var TwinTron=TwinTron || {};

//Dependencies
//var fs=require("fs-extra");
var utils=require("./q-utils");

function TwinTron_Storage(opts) {
};
TwinTron_Storage.prototype={
    getItem: function(item) { throw new Error("Not implemented"); },
    putItem: function(item) { throw new Error("Not implemented"); },
    removeItem: function(item) { throw new Error("Not implemented"); }
};
TwinTron.Storage=TwinTron_Storage;

function TwinTron_Extension(opts) {
};
utils.merge(TwinTron_Extension, {
    //statics
    registry: {},
    
    get: function(name) {
        return TwinTron_Extension.registry[name];
    },
    register: function(ext) {
        TwinTron_Extension.registry[ext.name]=ext;
    },
    unregister: function(ext) {
        (TwinTron_Extension.registry[ext.name] === ext) && (TwinTron_Extension.registry[ext.name] = undefined);
    }
});
TwinTron_Extension.prototype={
    name: null,
    version: null,
    description: null,
    author: null,
    
    on: function(evtID,callback) { throw new Error("Not implemented"); },
    off: function(evtID,callback) { throw new Error("Not implemented"); },
    once: function(evtID,callback) { throw new Error("Not implemented"); },
    init: function() { throw new Error("Not implemented"); },
    cleanup: function() { throw new Error("Not implemented"); }
};
TwinTron.Extension=TwinTron_Extension;

function TwinTron_NavigationLink(opts) {
    //TODO:
    if (opts) {
        if (typeof opts === "object") {
            utils.merge(this,opts);
        } else {
            this.url=opts;
        }
    }
};
TwinTron_NavigationLink.prototype={
    url: null,
    title: null,
    icon: null,
    active: false
};
TwinTron.NavigationLink=TwinTron_NavigationLink;

function TwinTron_NavigationController(opts) {
    var ctrl=this;
    var _private={
        listenersMap: {}
    };
    this.links=[];
    this.linksMap={};
    this.history=[];
    this.opts=opts || {};
    if (opts) {
        (opts.links) && opts.links.forEach(function(linkAttrs) {
            ctrl.addLink(new TwinTron_NavigationLink(linkAttrs));
        });
    }
    this.on=function addListener(evtID,callback) {
        var listeners=_private.listenersMap[evtID];
        if (!listeners) {
            listeners=[];
            _private.listenersMap[evtID]=listeners;
        }
        listeners.push(callback);
        //TEST {
        console.log("TwinTron_NavigationController.on(): "+evtID);
        console.log(listeners);
        // }
    };
    this.fireEvent=function(evt) {
        (!evt.source) && (evt.source=ctrl);
        var listeners=_private.listenersMap[evt.id];
        if (listeners) {
            //TEST {
            console.log("TwinTron_NavigationController: Dispatching event: "+evt.id+" to "+listeners.length+" listeners");
            // }
            listeners.forEach(function(listener) {
                listener(evt);
            });
        }
    };
};
utils.merge(TwinTron_NavigationController,{
    //statics
    EVT_LINK: "link"
});
TwinTron_NavigationController.prototype={
    //TODO:
    activeLink: null,
    links: null,
    linksMap: null,
    history: null,
    
    addLinks: function(links) {
        var ctrl=this;
        (links) && links.forEach(function(link) {
            ctrl.addLink(link);
        });
    },
    addLink: function(link) {
        this.links.push(link);
        this.linksMap[link.url]=link;
    },
    pushURL: function(url) {
        var _static=TwinTron_NavigationController;
        var link=this.linksMap[url];
        if (link) {
            (this.activeLink) && (this.activeLink.active=false);
            console.log("Active link URL: "+url);
            link.active=true;
            this.activeLink=link;
        }
        this.history.push(url);
        this.fireEvent({
            id: _static.EVT_LINK,
            url: url,
            link: link
        });
    }
};
TwinTron.NavigationController=TwinTron_NavigationController;
/*TwinTron.NavigationController=utils.makeFactory(TwinTron_NavigationController, function TwinTron_NavigationController$Factory(opts) {
    return new TwinTron_NavigationController(opts);
});*/

function TwinTron_WebPageController(opts) {
    this.opts=opts || {};
    if (opts) {
        this.currentApp=opts.currentApp;
        this.document=opts.document || document;
        this.window=opts.window || window;
        this.jQuery=opts.jQuery || jQuery;
    }
};
TwinTron_WebPageController.prototype={
    constructor: TwinTron_WebPageController,
    
    currentApp: null,
    opts: null,
    document: null,
    window: null,
    jQuery: null,
    
    navigationController: null,
    mainNav: null,

    init: function() {
        var page=this;
        var doc=this.document;
        var win=this.window;
        var j$=this.jQuery;
        
        var app=this.currentApp;
        if (!app) {
            if ((win) && (win.TwinTron) && (win.TwinTron.currentApp)) {
                console.log("Current app found in this window: "+win.location.href);
                app=win.TwinTron.currentApp;
            }
            if ((!app) && (win.parent) && (win.parent.TwinTron) && (win.parent.TwinTron.currentApp)) {
                console.log("Current app found in parent window: "+win.parent.location.href);
                app=win.parent.TwinTron.currentApp;
            }
            this.currentApp=app;
        }
        if (!app) {
            return Promise.reject(new Error("Current app instance not found"));
        }
        
        var navCtrl=win.navigationController;
        //Attach navigation controller
        if ((!navCtrl) && (win.parent) && (win.parent.navigationController)) {
            console.log("Inherited navigation controller from parent: "+win.parent.location.href);
            navCtrl=win.parent.navigationController;
        }
        if (!navCtrl) {
            console.warn("No navigation controller available");
        }
        this.navigationController=navCtrl;
        
        //Initialize nav UI
        var proms=[];
        var mainNav=doc.getElementById("mainNav");
        if (mainNav) {
            var ulNode=mainNav.querySelector("ul");
            if (!ulNode) {
                ulNode=doc.createElement("ul");
                ulNode.classList.add("nav");
                mainNav.appendChild(ulNode);
            }
            var links=(navCtrl) ? navCtrl.links : null;
            (links) && links.forEach(function(link) {
                var liNode=doc.createElement("li");
                liNode.classList.add("nav-item");
                ulNode.appendChild(liNode);
                var aNode=doc.createElement("a");
                aNode.href=link.url;
                aNode.classList.add("nav-link");
                if (link.active) {
                    aNode.classList.add("active");
                    //aNode.classList.add("nav-active");
                } else {
                    aNode.classList.remove("active");
                    //aNode.classList.remove("nav-active");
                }
                if (link.icon) {
                    var iconNode=doc.createElement("span");
                    iconNode.classList.add("glyphicon");
                    iconNode.classList.add("glyphicon-"+link.icon);
                    aNode.appendChild(iconNode);
                }
                aNode.appendChild(doc.createTextNode(link.title || link.url));
                j$(aNode).click(function onLinkClicked(evt) {
                    evt.preventDefault();
                    var url=this.getAttribute("href");
                    win.navigationController.pushURL(url);
                    return false;
                });
                liNode.appendChild(aNode);
                proms.push(Promise.resolve(liNode));
            });
            this.mainNav=mainNav;
            j$(this.mainNav).show();
        }
        return Promise.all(proms)
            .then(function(results) {
                console.log("TwinTron Web Page initialized");
                return Promise.resolve(true);
            });
    }
};
TwinTron.WebPageController=TwinTron_WebPageController;
/*TwinTron.WebPageController=utils.makeFactory(TwinTron_WebPageController, function TwinTron_WebPageController$Factory(opts) {
    return new TwinTron_WebPageController(opts);
});*/


function TwinTron_RootPageController(opts) {
    TwinTron_RootPageController._super.prototype.constructor.call(this,opts);
    this.navLinks=[];
    if (opts) {
        (opts.navigationLinks) && this.addLinks(opts.navigationLinks);
    }
};
var TwinTron_RootPageController_static={
    //statics
};
TwinTron_RootPageController.prototype=utils.extendClass(TwinTron_WebPageController, {
    constructor: TwinTron_RootPageController,
    
    mainContainer: null,
    navLinks: null,
    
    addLinks: function(links) {
        var page=this;
        (links) && links.forEach(function(link) {
            page.addLink(link);
        });
    },
    addLink: function(link) {
        console.log("Adding navigation link to root page: "+link.url+" ["+link.title+"]");
        this.navLinks.push(link);
    },
    
    init: function() {
        var page=this;
        var doc=this.document;
        var win=this.window;
        var j$=this.jQuery;
        var opts=this.opts;
        var mainContainer=this.mainContainer;

        var navCtrl=win.navigationController;
        if (!navCtrl) {
            console.info("Creating navigation controller for root page");
            navCtrl=new TwinTron.NavigationController({
                links: page.navLinks
            });
            navCtrl.on(TwinTron.NavigationController.EVT_LINK, function TwinTron_RootPageController_onLink(evt) {
                console.log("Navigating to: "+evt.url);
                mainContainer.src=evt.url;
            });
            win.navigationController=navCtrl;
        }
        this.navigationController=navCtrl;
        
        return TwinTron_RootPageController._super.prototype.init.call(this)
            .then(function(proceed) {
                if (!proceed) {
                    return Promise.reject(false);
                }
                
                mainContainer=this.document.getElementById("mainContainer");
                j$(mainContainer).hide();
                //mainContainer.src="home.html";
                mainContainer.contentWindow.width=win.clientWidth;
                mainContainer.contentWindow.height=win.clientHeight-mainContainer.offsetTop; //win.clientTop;
                this.mainContainer=mainContainer;

                //var links=navCtrl.links;
                //TEST {
                //console.log(links);
                // }
                /*if ((!links) || (links.length <= 0)) {
                    links=navlinks(TwinTron,navCtrl).init();
                }*/

                function onMainContainerLoaded() {
                    console.log("Attaching navigation controller to container: "+mainContainer.contentWindow.location.href);
                    mainContainer.contentWindow.navigationController=navCtrl;
                };
                //j$(mainContainer).load(onMainContainerLoaded);
                mainContainer.onreadystatechange=function() {
                    (mainContainer.readyState === "complete") && onMainContainerLoaded();
                };
                mainContainer.onload=onMainContainerLoaded;
                //mainContainer.contentWindow.onload=onMainContainerLoaded;
                //mainContainer.contentWindow.navigationController=navCtrl;

                console.log("TwinTron Web App initialized");

                j$(mainContainer).show();
                //navCtrl.pushURL("home.html");

                console.log("TwinTron Root Page initialized");
            });
    }
}, TwinTron_RootPageController_static);
TwinTron.RootPageController=TwinTron_RootPageController;

function TwinTron_WebApp(opts) {
    this.opts=opts || {};
    if (opts) {
        this.document=opts.document || document;
        this.window=opts.window || window;
        this.jQuery=opts.jQuery || jQuery;
    }
    this.rootPageController=new TwinTron.RootPageController(opts);
};
TwinTron_WebApp.prototype={
    constructor: TwinTron_WebApp,
    
    opts: null,
    document: null,
    window: null,
    jQuery: null,
    
    rootPageController: null,
    navigationController: null,

    init: function() {
        var app=this;
        var doc=this.document;
        var win=this.window;
        var j$=this.jQuery;

        win.TwinTron=win.TwinTron || TwinTron;
        win.TwinTron.currentApp=app;
        return this.rootPageController.init()
            .then(function(result) {
                app.navigationController=app.rootPageController.navigationController;
                return Promise.resolve(result);
            })
            .catch(function(err) {
                console.error(err);
            });
    }
};
TwinTron.WebApp=TwinTron_WebApp;

module.exports=TwinTron;
