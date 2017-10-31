# TwinTron
A minimalistic Framework & Build tool for deploying HTML5+JS Web App to Electron & Cordova
(Work in progress)

## How to Use

To initialize a project with web app structure:
````
cd {yourprojectdir}
twintron web init
````

To initialize electron app:
````
cd {yourprojectdir}
twintron electron init
````

To initialize cordova app:
````
cd {yourprojectdir}
twintron cordova init
````


To build web app files (using browserify to compile source JS files into bundle):
````
cd {yourprojectdir}
twintron web build
````

To build files to electron:
````
cd {yourprojectdir}
twintron electron build
````

To build files to cordova:
````
cd {yourprojectdir}
twintron cordova build
````


To test run electron app:
````
cd {yourprojectdir}
twintron electron run
````

To test run web app on a minimal HTTP server:
````
cd {yourprojectdir}
twintron web run
````

## Notes
TwinTron (tools part & app templates part) utilizes 3rd-party libraries/products such as:

* [Electron](https://electron.atom.io/)
* [Electron Packager](https://www.npmjs.com/package/electron-packager)
* [Apache Cordova](https://cordova.apache.org/)
* [Browserify](https://www.npmjs.com/package/browserify)
* [Bootstrap](http://getbootstrap.com/)
* [Glyphicons](https://glyphicons.com/)

However, the front-end web parts can be adapted to use any other frameworks as a developer see fit.
You can use jQuery UI or plain old HTML+JS instead of Bootstrap and FontAwesome instead of Glyphicons, for example.
Please check license information before usage of these libraries/frameworks/products too.
