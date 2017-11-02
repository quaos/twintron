
//Global namespaces
var TwinTron=window.TwinTron || {};

(function(win,doc,j$) {
    var utils=require("./q-utils");
    var _twintron=require("./twintron");
    utils.merge(TwinTron, _twintron, true);
    
    var navLinks=require("./navlinks");
    var app=new TwinTron.WebApp({
        document: doc,
        window: win,
        jQuery: j$,
        navigationLinks: navLinks
    });
    doc.addEventListener("DOMContentLoaded", function onPageReady() {
        app.init()
            .then(function() {
                app.navigationController.pushURL("home.html");
            });
    }); 
})(window,document,jQuery.noConflict(true));
        
    //REFACTORED: Moved to TwinTron.WebApp class {
    /*
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
        mainContainer: null,
        mainNav: null,


        //REFACTORED: Moved to TwinTron.RootPageController class {
        /*
        init: function() {
            var app=this;
            var doc=this.document;
            var win=this.window;
            var j$=this.jQuery;
            
            var mainContainer=this.document.getElementById("mainContainer");
            j$(this.mainContainer).hide();
            //mainContainer.src="home.html";
            mainContainer.contentWindow.width=win.clientWidth;
            mainContainer.contentWindow.height=win.clientHeight-mainContainer.offsetTop; //win.clientTop;
            this.mainContainer=mainContainer;
            
            //Attach navigation controller (Auto create if not existing)
            var navCtrl=win.navigationController;
            if (!navCtrl) {
                console.warn("No navigation controller, creating standalone one");
                navCtrl=new TwinTron.NavigationController({ });
                navCtrl.on(TwinTron.NavigationController.EVT_LINK, function TwinTron_WebApp_onLink(evt) {
                    console.log("Navigating to: "+evt.url);
                    mainContainer.src=evt.url;
                });
                win.navigationController=navCtrl;
            }
            var links=navCtrl.links;
            //TEST {
            //console.log(links);
            // }
            if ((!links) || (links.length <= 0)) {
                links=navlinks(TwinTron,navCtrl).init();
            }
            
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
            navCtrl.pushURL("home.html");
        }
        * /
       
        //REFACTORED: Moved to TwinTron.WebPageController class {
        /*,
        initPage: function() {
            var app=this;
            var doc=this.document;
            var win=this.window;
            var j$=this.jQuery;
            
            var navCtrl=win.navigationController;
            //Attach navigation controller
            if ((!navCtrl) && (win.parent)) {
                console.log("Inherited navigation controller from parent: "+win.parent.location.href);
                navCtrl=win.parent.navigationController;
            }
            if (!navCtrl) {
                console.warn("No navigation controller available");
            }
            var links=(navCtrl) ? navCtrl.links : null;
            
            //Initialize nav UI
            var mainNav=doc.getElementById("mainNav");
            if (mainNav) {
                var ulNode=mainNav.querySelector("ul");
                if (!ulNode) {
                    ulNode=doc.createElement("ul");
                    ulNode.classList.add("nav");
                    mainNav.appendChild(ulNode);
                }
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
                });
                this.mainNav=mainNav;
                j$(this.mainNav).show();
            }

            console.log("TwinTron Web Page initialized");
        }
        * /
       // }
    };
    TwinTron.WebApp=TwinTron_WebApp;
    */
   // }
    
