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
        pathname: path.join(__dirname, 'config_yml.html'),
        protocol: 'file:'
    }));

});


let menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Configurar YML',
                click: () => {
                    var arquivo = dialog.showOpenDialog(TelaInicial, {
                        title: 'Selecione o Arquivo YML',
                        properties: ['openFile'],
                        callback: (filePaths) => {
                            return filePaths;
                        }
                    });
                    var contarBarras = 0;
                    var letraAtual = "";
                    var caminhoFormatado = "";
                    for(var i = 0; i < arquivo[0].length; i++){
                        letraAtual = arquivo.substring(i, i + 1);
                        if(letraAtual == "\\"){
                            contarBarras++;
                            if(contarBarras % 2 != 0){
                                caminhoFormatado += letraAtual;
                            }
                        }
                    }
                    console.log(caminhoFormatado);
                    /*
                    var telaConfigYML = new BrowserWindow({
                        width: 800,
                        height: 600
                    });
                    telaConfigYML.loadURL(url.format({
                        pathname: path.join(__dirname, 'config_yml.html'),
                        protocol: 'file:'
                    }));
                    */                    
                }
            }
        ]
    }
]

//const menu = Menu.buildFromTemplate(menuTemplate);
//Menu.setApplicationMenu(menu);
