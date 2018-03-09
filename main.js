const electron = require('electron');
const { BrowserWindow, app, dialog, Menu } = electron;
const url = require('url');
const path = require('path');

let TelaInicial;

app.on('ready', () => {
    TelaInicial = new BrowserWindow({
        width: 800,
        height: 600
    });
    TelaInicial.loadURL(url.format({
        pathname: path.join(__dirname, 'config_application_yml.html'),
        protocol: 'file:'
    }));

});


let menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Configurar Aplication.yml',
                click: () => {
                    let TelaApplication;
                    TelaApplication = new BrowserWindow({
                        width: 800,
                        height: 600
                    });
                    TelaApplication.loadURL(url.format({
                        pathname: path.join(__dirname, 'config_application_yml.html'),
                        protocol: 'file:'
                    }));
                }
            }, {
                label: 'Configurar Application-watchdog.yml',
                click: () => {
                    let TelaApplicationWatchdog;
                    TelaApplicationWatchdog = new BrowserWindow({
                        width: 800,
                        height: 600
                    });
                    TelaApplicationWatchdog.loadURL(url.format({
                        pathname: path.join(__dirname, 'config_application_watchdog_yml.html'),
                        protocol: 'file:'
                    }));
                }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
