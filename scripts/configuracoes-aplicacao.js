var file = require('fs');
const leitor_yaml = require('js-yaml');
const yaml_escrita = require('write-yaml');




//Usados para abrir caixa de dialogo para carregar arquivo

const { dialog } = require('electron').remote;;

//Nome do arquivo de Configuração
const ArquivoConfiguracao = "configuracoes.yml";

function DefinirConfiguracaoInicial(){
    //Verifica se o arquivo de configuração existe
    file.stat(ArquivoConfiguracao, function(error, stat){
        if(error == null){
            try{
                var filepath = ArquivoConfiguracao;
                var configuracoes = leitor_yaml.safeLoad(file.readFileSync(filepath, 'utf8'));
                //Limpa o localstorage ao iniciar a aplicação
                localStorage.clear();
                //Colocando a configuração em localstorage para consulta das demais partes da aplicação
                localStorage.setItem("Configuracoes", JSON.stringify(configuracoes));
            } catch(e){
                console.log(e);
            }
            
        //Neste caso o arquivos não existe e será direcionado a página de configuração
        //para que a pasta da mensageria possa ser configurada e gerado o arquivo de 
        //configuração
        } else if(error.code == 'ENOENT') {
            window.location.assign('configurador-aplicacao.html');
        //Mostrar um modal com algum erro desconhecido.
        } else {
            $("#modalErro").modal("open");
            $(".conteudo-erro").html('').html("Error Code: " + error.code + " | Error Message: " + error.message);
        }
    });
}

//Carrega as configurações se o arquivo de configuração existir
function CarregarConfiguracoes(){
    //Verifica se o arquivo existe
    file.stat(ArquivoConfiguracao, function(error, stat){
        if(error == null){
            try{
                var filepath = ArquivoConfiguracao;
                var configuracoes = leitor_yaml.safeLoad(file.readFileSync(filepath, 'utf8'));
                //Colocando a configuração em localstorage para consulta das demais partes da aplicação
                localStorage.setItem("Configuracoes", JSON.stringify(configuracoes));
                $('#CaminhoArquivosMensageria').val(configuracoes.CaminhoMensageria);

            } catch(e){
                console.log(e);
            }
        } 

        //Loader de carregamento
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

//Função para abrir um caixa de diálogo e pegar a pasta especificada pelo usuário
//para preencher o input
function carregarPastaArquivosYML(){
    try{

        const options = {
            properties: ['openDirectory', '']
        };

        dialog.showOpenDialog(options, (path) => {
            
            $('#CaminhoArquivosMensageria').val(path);
        });

    } catch(error) {
        /*
        $("#modalErro").modal("open");
        $(".conteudo-erro").html('').html("Error Code: " + error.code + " | Error Message: " + error.message);
        */
        alert(error);
    }
    
}

//Função para configurar o arquivo de configuração
function ConfigurarCaminhoMensageria(){
    //Verifica se o input onde a pasta é especificada está vazio
    var NovoCaminho = $('#CaminhoArquivosMensageria').val();

    if(NovoCaminho == ""){
        $("#modalErro").modal("open");
        $(".conteudo-erro").html('').html("Especifique o diretório da Mensageria!");
    } else {
        //Verifica se o arquivo de configuração existe
        file.stat(ArquivoConfiguracao, function(error, stat){
            if(error == null){
                try{
                    var filepath = ArquivoConfiguracao;
                    var configuracoes = leitor_yaml.safeLoad(file.readFileSync(filepath, 'utf8'));
                    configuracoes.CaminhoMensageria = NovoCaminho;

                    yaml_escrita.sync(ArquivoConfiguracao, configuracoes);
                    //Colocando a configuração em localstorage para consulta das demais partes da aplicação
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
                } catch(e){
                    console.log(e);
                }
            //Caso o arquivo de configuração não exista ele é criado
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
                            //Template para o arquivo de configuração pegando a pasta
                            //Especificada pelo usuário
                            var doc = {
                                CaminhoMensageria: NovoCaminho
                            };
        
                            yaml_escrita.sync(caminhoArquivo, doc);
        
                            var configuracoes = leitor_yaml.safeLoad(file.readFileSync(caminhoArquivo, 'utf8'));
                            //Colocando a configuração em localstorage para consulta das demais partes
                            //da aplicação
                            localStorage.setItem("Configuracoes", JSON.stringify(configuracoes));
        
                            M.toast({
                                html: "Diretório da Mensageria alterado com sucesso!",
                                timeRemaining: 200,
                                displayLength: 2000,
                                classes: 'green accent-3',
                                completeCallback: () => {
                                    //window.location.assign("config_application_yml.html");
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