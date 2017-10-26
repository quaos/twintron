
module.exports=function(TwinTron,win) {
    return {
        init: function navlinks_init() {
            //Initialize links in our web app
            win.navigationController.addLinks([
                new TwinTron.NavigationLink({ title: "Home", icon: "home", url: "index.html" }),
                new TwinTron.NavigationLink({ title: "About", icon: "info-sign", url: "about.html" })
            ]);
        }
    };
};

                        