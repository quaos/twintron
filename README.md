# TwinTron
A minimalistic Framework & Build tool for deploying HTML5+JS Web App to Electron & Cordova
(Work in progress)

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
