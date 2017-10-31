
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
function TwinTron_NavigationController$Factory(opts) {
    return new TwinTron_NavigationController(opts);
}
utils.makeFactory(TwinTron_NavigationController, TwinTron_NavigationController$Factory);
TwinTron.NavigationController=TwinTron_NavigationController$Factory;

module.exports=TwinTron;
