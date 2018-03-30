const electron = require('electron');
const { BrowserWindow, app, dialog, Menu } = electron;
const url = require('url');
const path = require('path');

let TelaInicial;

app.on('ready', () => {
    let screenSize = electron.screen.getPrimaryDisplay().size;
    TelaInicial = new BrowserWindow({
        height: screenSize.height,
        width: screenSize.width,
        minHeight: 600,
        minWidth: 800
    });
    TelaInicial.loadURL(url.format({
        pathname: path.join(__dirname, './pages/config_application_watchdog_yml.html'),
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
                    let screenSize = electron.screen.getPrimaryDisplay().size;
                    TelaApplication = new BrowserWindow({
                        height: screenSize.height,
                        width: screenSize.width,
                        minHeight: 600,
                        minWidth: 800
                    });
                    TelaApplication.loadURL(url.format({
                        pathname: path.join(__dirname, './pages/config_application_yml.html'),
                        protocol: 'file:'
                    }));
                }
            }, {
                label: 'Configurar Application-watchdog.yml',
                click: () => {
                    let TelaApplicationWatchdog;
                    let screenSize = electron.screen.getPrimaryDisplay().size;
                    TelaApplicationWatchdog = new BrowserWindow({
                        height: screenSize.height,
                        width: screenSize.width,
                        minHeight: 600,
                        minWidth: 800
                    });
                    TelaApplicationWatchdog.loadURL(url.format({
                        pathname: path.join(__dirname, './pages/config_application_watchdog_yml.html'),
                        protocol: 'file:'
                    }));
                }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
