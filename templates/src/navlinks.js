
module.exports=function(TwinTron,navCtrl) {
    return {
        init: function navlinks_init() {
            //Initialize links in our web app
            console.log("Adding navigation links");
            //TEST {
            //console.log(navCtrl);
            // }
            navCtrl.addLinks([
                new TwinTron.NavigationLink({ title: "Home", icon: "home", url: "home.html" }),
                new TwinTron.NavigationLink({ title: "About", icon: "info-sign", url: "about.html" })
            ]);
            
            return navCtrl.links;
        }
    };
};

                        