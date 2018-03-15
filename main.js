const electron = require('electron');
const { BrowserWindow, app, dialog, Menu } = electron;
const url = require('url');
const path = require('path');

//Início Item obrigatorio para montar instalador windows

    //handle setupevents as quickly as possible
    const setupEvents = require('./installers/setupEvents')
    if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
    }

    const {ipcMain} = require('electron');
    //var path = require('path')

//Fim item obrigatorio para montar instalador windows


let TelaInicial;

app.on('ready', () => {
    TelaInicial = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 600,
        minWidth: 800
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
                        height: 600,
                        minHeight: 600,
                        minWidth: 800
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

//const menu = Menu.buildFromTemplate(menuTemplate);
//Menu.setApplicationMenu(menu);
