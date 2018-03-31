const electron = require('electron');
const { BrowserWindow, dialog, Menu, remote, app } = electron;
const url = require('url');
const path = require('path');

let TelaApplication;
let TelaApplicationWatchdog;

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
        label: 'Configurar Mensageria',
        submenu: [
            {
                label: 'Configurar Application.yml',
                click: () => {
                    TelaInicial.loadURL(url.format({
                        pathname: path.join(__dirname, './pages/config_application_yml.html'),
                        protocol: 'file:'
                    }));
                }
            }, {
                label: 'Configurar Application-watchdog.yml',
                click: () => {
                    TelaInicial.loadURL(url.format({
                        pathname: path.join(__dirname, './pages/config_application_watchdog_yml.html'),
                        protocol: 'file:'
                    }));
                }
            }
        ]
    }, {
        label: "Opções",
        submenu: [
            {
                label: "Recarregar Arquivo",
                click: () => {
                    BrowserWindow.getFocusedWindow().reload();
                }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
