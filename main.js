﻿const electron = require('electron');
const { BrowserWindow, Menu, app } = electron;
const url = require('url');
const path = require('path');

let TelaApplication;
let TelaApplicationWatchdog;

let TelaInicial;

//Definindo ambiente de Produção ou de Desenvolvimento.
// production = Produção
//development = Desenvolvimento
process.env.NODE_ENV = 'production';

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
    }, {
        label: "Configurações",
        submenu: [
            {
                label: "Configurar Pasta Mensageria",
                click: () => {
                    TelaInicial.loadURL(url.format({
                        pathname: path.join(__dirname, './pages/configurador-aplicacao.html'),
                        protocol: 'file:'
                    }));
                }
            }
        ]
    }
]


app.on('ready', () => {


    let screenSize = electron.screen.getPrimaryDisplay().size;
    TelaInicial = new BrowserWindow({
        height: screenSize.height,
        width: screenSize.width,
        minHeight: 600,
        minWidth: 800
    });


    TelaInicial.loadURL(url.format({
        pathname: path.join(__dirname, './pages/config_application_yml.html'),
        protocol: 'file:'
    }));
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
});



//Adicionar Developer Tools se não for ambiente de Produção
if(process.env.NODE_ENV !== 'production'){
    menuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q' ,
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            }, {
                role: 'reload'
            }
        ]
    })
}


app.on('window-all-closed', function(){
    app.quit();
});

app.on('will-quit', function(){
    app.quit();
});
