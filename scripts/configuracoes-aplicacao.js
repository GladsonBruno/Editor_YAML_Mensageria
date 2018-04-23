var path = require('path');
var file = require('fs');
const leitor_yaml = require('js-yaml');
const yaml_escrita = require('write-yaml');

//Usados para abrir caixa de dialogo para carregar arquivo
var app = require('electron').remote; 
var dialog = app.dialog;

//Nome do arquivo de Configuração
const ArquivoConfiguracao = "configuracoes.yml";

function DefinirConfiguracaoInicial(){
    file.stat(ArquivoConfiguracao, function(error, stat){
        if(error == null){
            try{
                var filepath = ArquivoConfiguracao;
                var configuracoes = leitor_yaml.safeLoad(file.readFileSync(filepath, 'utf8'));
        
                localStorage.setItem("Configuracoes", JSON.stringify(configuracoes));
            } catch(e){
                console.log(e);
            }
            
    
        } else if(error.code == 'ENOENT') {
            window.location.assign('configurador-aplicacao.html');
        } else {
            $("#modalErro").modal("open");
            $(".conteudo-erro").html('').html("Error Code: " + error.code + " | Error Message: " + error.message);
        }
    });
}

function CarregarConfiguracoes(){

    file.stat(ArquivoConfiguracao, function(error, stat){
        if(error == null){
            try{
                var filepath = ArquivoConfiguracao;
                var configuracoes = leitor_yaml.safeLoad(file.readFileSync(filepath, 'utf8'));
        
                localStorage.setItem("Configuracoes", JSON.stringify(configuracoes));
                $('#CaminhoArquivosMensageria').val(configuracoes.CaminhoMensageria);

            } catch(e){
                console.log(e);
            }
        } 

        var loader = `<div class='container center'>
                <div class="preloader-wrapper big active">
                    <div class="spinner-layer spinner-blue-only">
                        <div class="circle-clipper left">
                            <div class="circle"></div>
                        </div>
                        <div class="gap-patch">
                            <div class="circle"></div>
                        </div>
                        <div class="circle-clipper right">
                            <div class="circle"></div>
                        </div>
                    </div>
                </div>
                </div>
                `;

            M.toast({
                html: loader,
                timeRemaining: 200,
                displayLength: 1000,
                classes: 'container center transparent'
            });

    });
}

function carregarPastaArquivosYML(){
    try{
        dialog.showOpenDialog({
            properties: ['openDirectory']
    
        }, selectedDirectory => $('#CaminhoArquivosMensageria').val(selectedDirectory));
    } catch(error) {
        $("#modalErro").modal("open");
        $(".conteudo-erro").html('').html("Error Code: " + error.code + " | Error Message: " + error.message);
    }
    
}

function ConfigurarCaminhoMensageria(){

    var NovoCaminho = $('#CaminhoArquivosMensageria').val();

    if(NovoCaminho == ""){
        $("#modalErro").modal("open");
        $(".conteudo-erro").html('').html("Especifique o diretório da Mensageria!");
    } else {
        file.stat(ArquivoConfiguracao, function(error, stat){
            if(error == null){
                try{
                    var filepath = ArquivoConfiguracao;
                    var configuracoes = leitor_yaml.safeLoad(file.readFileSync(filepath, 'utf8'));
                    configuracoes.CaminhoMensageria = NovoCaminho;

                    yaml_escrita.sync(ArquivoConfiguracao, configuracoes);
                    localStorage.setItem("Configuracoes", JSON.stringify(configuracoes));
                } catch(e){
                    console.log(e);
                }
        
            } else if(error.code == 'ENOENT') {
                var fileContent = "";
    
                // The absolute path of the new file with its name
                var caminhoArquivo = ArquivoConfiguracao;
        
                file.writeFile(caminhoArquivo, fileContent, (err) => {
                    if (err) {
                        $("#modalErro").modal("open");
                        $(".conteudo-erro").html('').html(err);
                    } else {
                        try {
        
                            var doc = {
                                CaminhoMensageria: NovoCaminho + "\\"
                            };
        
                            yaml_escrita.sync(caminhoArquivo, doc);
        
                            var configuracoes = leitor_yamlsafeLoad(file.readFileSync(caminhoArquivo, 'utf8'));
                            localStorage.setItem("Configuracoes", JSON.stringify(configuracoes));
        
                            M.toast({
                                html: "Diretório da Mensageria alterado com sucesso!",
                                timeRemaining: 200,
                                displayLength: 2000,
                                classes: 'green accent-3',
                                completeCallback: () => {
                                    window.location.assign("config_application_yml.html");
                                }
                            });

                        } catch(error){
                            $("#modalErro").modal("open");
                            $(".conteudo-erro").html('').html(error);
                        }
                    }
                });

            } else {
                $("#modalErro").modal("open");
                $(".conteudo-erro").html('').html("Error Code: " + error.code + " | Error Message: " + error.message);
            }
        });
    }

}