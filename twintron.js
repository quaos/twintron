
//var fs=require("fs-extra");
var utils=require("./q-utils");

//Namespaces
var TwinTron=TwinTron || {};

function TwinTron_Storage(opts) {
    //TODO:
};
TwinTron_Storage.prototype={
    //TODO:
    
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
    active: false
};
TwinTron.NavigationLink=TwinTron_NavigationLink;

function TwinTron_NavigationController(opts) {
    var ctrl=this;
    var _private={
        listenersMap: {}
    };
    this.on=function addListener(evtID,callback) {
        var listeners=this.listenersMap[evtID];
        if (!listeners) {
            listeners=[];
            this.listenersMap[evtID]=listeners;
        }
        listeners.push(callback);
    };
    this.fireEvent=function(evt) {
        (!evt.source) && (evt.source=ctrl);
        var listeners=this.listenersMap[evt.id];
        (listeners) && (listeners.forEach(function(listener) {
            listener(evt);
        }));
    };
    //TODO:
    
};
utils.merge(TwinTron_NavigationController,{
    //statics
    EVT_LINK: "link"
});
TwinTron_NavigationController.prototype={
    //TODO:
    activeLink: null,
    linksMap: {},
    history: [],
    
    pushURL: function(url) {
        var _static=TwinTron_NavigationController;
        var link=this.linksMap[url];
        if (link) {
            this.activeLink=true;
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
