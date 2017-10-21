

var TwinTron=require("./twintron");
var utils=require("./q-utils");

var electron = require('electron');
// Module to control application life.
var app = electron.app;
// Module to create native browser window.
var BrowserWindow = electron.BrowserWindow;

var fs=require("fs-extra");
var path = require("path");
var url = require("url");

console.log("Electron main process: ");
console.log(process);

app.opts=null;
app.initApp=function initApp() {
    function TwinTron_StorageImpl_Electron(opts) {    
       this.opts=opts;
    };
    TwinTron_StorageImpl_Electron.prototype={

    };
    function TwinTron_StorageImpl_Electron$Factory(opts) {
       return new TwinTron_StorageImpl_Electron(opts);
    };
    utils.makeFactory(TwinTron_StorageImpl_Electron, TwinTron_StorageImpl_Electron$Factory);
    TwinTron.Storage=TwinTron_StorageImpl_Electron$Factory;
    
    if (!this.mainWindow) {
        this.mainWindow=this.createWindow();
    }
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
app.mainWindow=null;
app.createWindow=function createWindow(opts) {
    // Create the browser window.
    var w=opts.width || 800;
    var h=opts.height || 600;
    
    var win = new BrowserWindow({ width: w, height: h });

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, "twintron.electron.html"),
        protocol: 'file:',
        slashes: true
    }));

    //Inject TwinTron adapter interfaces into window
    win.TwinTron=TwinTron;

    // Open the DevTools.
    win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        if (win === app.mainWindow) {
            app.mainWindow = null;
        }
    });
    
    return win;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', app.initApp.bind(app));

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!app.mainWindow) {
      app.mainWindow=app.createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
