var fs = require('fs');
const yaml = require('js-yaml');
const os = require("os");
console.log(os.platform());
//Biblioteca de criptografia
var cryptoLib = require('cryptlib');
var yaml_converter = require('json2yaml');


//Usados para abrir caixa de dialogo para carregar arquivo
const electron_config_yml = require('electron').remote;
const boxDialog = electron_config_yml.dialog;



//Pasta dos arquivos da Mensageria
var configuracoes = JSON.parse(localStorage.getItem("Configuracoes"));
var caminhoMensageria = configuracoes.CaminhoMensageria;
//Tratamento do Sistema Operacional em que a aplicação será executada.
var SistemaOperacional = os.platform().toString();
if( SistemaOperacional == "linux" || SistemaOperacional == "darwin"){
    caminhoMensageria = caminhoMensageria  + "/";    
} else if( SistemaOperacional == "win32" || SistemaOperacional.substr(0,3) == "win" ){
    caminhoMensageria = caminhoMensageria  + "\\";
} else {
    caminhoMensageria = caminhoMensageria  + "/";
}


//Mensagens de Erro
const erro_abrir_application_yml = "Arquivo application.yml não encontrado. </br> Favor verificar se o arquivo se encontra na mesma pasta que foi especificada na configuração";
const erro_abrir_application_watchdog_yml = "Arquivo application-watchdog.yml não encontrado. </br> Favor verificar se o arquivo se encontra na mesma pasta que foi especificada na configuração!";
const info_erro_abrir_application_yml = "Falha ao Carregar as Informações - Arquivo application.yml não encontrado.";
const info_erro_abrir_application_watchdog_yml = "Falha ao Carregar as Informações - Arquivo application-watchdog.yml não encontrado.";
const Erro_Criptografia = "Segredo Incorreto!";

//Mensagens de Sucesso
const sucesso_carregamento_informacoes = "Configurações Carregadas com Sucesso";
const SucessoCadastroEmpregador = "Configurações do novo Empregador cadastradas com Sucesso!";
const SucessoCadastroSerpro = "Configuração do certificado serpro atualizada com sucesso!";
const SucessoSalvarConfiguracoesDB = "Configurações de Banco de Dados Salvas com Sucesso!";


$(document).ready(function(){
    //Evento para desabilitar e habilitar os campos com o id nome-base-de-dados e o db_sid
    //Se for oracle não precisa do campo nome-base-de-dados e o campo é desabilitado e habilitando o campo db_sid
    //que é obrigatório para conexão com o banco de dados Oracle
    //Se for SQL Server não precisa do campo db_sid e o campo é desabilitado e habilitando o campo nome-base-de-dados
    //que é obrigatório para conexão com o banco de dados SQL Server
    $("#salvar-config-db").hide();

    $("#driver-base-de-dados").on('change', function(){

        if($("#driver-base-de-dados").val() == "oracle.jdbc.OracleDriver"){
            $("#nome-base-de-dados").removeClass("valid").removeClass("invalid");
            $("#nome-base-de-dados").prop("disabled", true);
            $("#db_sid").prop("disabled", false);
        } else if($("#driver-base-de-dados").val() == "com.microsoft.sqlserver.jdbc.SQLServerDriver"
        || $("#driver-base-de-dados").val() == "org.postgresql.Driver") {
            $("#db_sid").removeClass("valid").removeClass("invalid");
            $("#db_sid").prop("disabled", true);
            $("#nome-base-de-dados").prop("disabled", false);
        }
    });

    $("#url-base-de-dados").prop("disabled", true);
    $("#porta-base-de-dados").prop("disabled", true);
    $("#nome-base-de-dados").prop("disabled", true);
    $("#db_sid").prop("disabled", true);
    //$("#driver-base-de-dados").prop("disabled", true);
    $("#username").prop("disabled", true);
    $("#password").prop("disabled", true);

    //Validando campo URL Base de Dados
    var url_db = $("#url-base-de-dados");
    verificarSeOCampoEstaVazio(url_db);

    //Validando campo Porta DB
    var porta_db = $("#porta-base-de-dados");
    verificarSeOCampoEstaVazio(porta_db);

    //Validando campo Nome DB
    var nome_db = $("#nome-base-de-dados");
    verificarSeOCampoEstaVazio(nome_db);

    //Validando campo SID DB
    var sid_db = $("#db_sid");
    verificarSeOCampoEstaVazio(sid_db);

    //Validando campo username
    var user_name_db = $("#username");
    verificarSeOCampoEstaVazio(user_name_db);

    //Validando campo password
    var password_db = $("#password");
    verificarSeOCampoEstaVazio(password_db);

    //Validando informações do Cadastro de empregador
    var codigo_empregador = $("#novo-codigo_empregador");
    ValidarTamanhoCodigoEmpregador(codigo_empregador);

    var path_certificado = $("#novo-caminho-certificado");
    verificarSeOCampoEstaVazio(path_certificado);

    var senha_certificado = $("#novo-senha-certificado");
    verificarSeOCampoEstaVazio(senha_certificado);

    var tipo_transmissor = $("#novo-tipo-transmissor");
    var numero_transmissor = $("#novo-numero-transmissor");
    ValidarTamanhoNumeroEmpregador(numero_transmissor, tipo_transmissor);

    var senhaSerpro = $("#senha_serpro");
    verificarSeOCampoEstaVazio(senhaSerpro);    

    verificarPreenchimentoChaveCriptografia($("#SegredoNovoCertificado"), $("#btn-cadastrar-com-chave"));

    verificarPreenchimentoChaveCriptografia($("#SegredoEditarCertificado"), $("#btn-editar-com-chave"));

    verificarPreenchimentoChaveCriptografia($("#SegredoNovoCertificadoSerpro"), $("#btn-cadastrar-com-chave-serpro"));

    verificarPreenchimentoChaveCriptografia($("#SegredoSenhaDB"), $("#btn-segredo-senha-db"));

    verificarPreenchimentoChaveCriptografia($("#NovoSegredoSenhaDB"), $("#btn-resetar-segredo-criptografia"));

});

function Encrypt(SenhaOriginal, Segredo){
    //Não sei exatamente para que serve esse iv
    var iv = "353643302102";

    try{
        var shaKey = cryptoLib.getHashSha256(Segredo, 32);
        
        var encryptedString = cryptoLib.encrypt(SenhaOriginal, shaKey, iv);
        return encryptedString.toString();
    } catch(e){
        console.log(e.message);
        return e.message;
    }
    
    
}

function Decrypt(SenhaCriptografada, Segredo){
    //Não sei exatamente para que serve esse iv
    var iv = "353643302102";

    try {
        var shaKey = cryptoLib.getHashSha256(Segredo, 32);
        var decryptedString = cryptoLib.decrypt(SenhaCriptografada, shaKey, iv);
        return decryptedString.toString();
    } catch(e){
        console.log(e.message);
        return e.message;
    }
}

//Verifica se o campo de chave de criptografia está vazio
function verificarPreenchimentoChaveCriptografia(seletor, botaoConfirmacao){
    seletor.on("focus", function(){
        if(seletor.val() == ""){
            botaoConfirmacao.attr("disabled", true);
            seletor.addClass("invalid");
        } else {
            botaoConfirmacao.attr("disabled", false);
            seletor.removeClass("invalid");
        }
    });

    seletor.on("keyup", function(){
        if(seletor.val() == ""){
            botaoConfirmacao.attr("disabled", true);
            seletor.addClass("invalid");
        } else {
            botaoConfirmacao.attr("disabled", false);
            seletor.removeClass("invalid");
        }
    });
}


//Função para verificar se os campos estão vazios e aplicar as classes css
function verificarSeOCampoEstaVazio(seletor){
    //O Seletor é o seletor do elemento a ser verificado
    //Exemplo verificarSeOcampoEstaVazio($("#url-base-de-dados"));

    seletor.on("focus", function(){
        if(seletor.val() == ""){
            seletor.addClass("invalid");
        }
    });

    seletor.on("keyup", function(){    
        if(seletor.val() == ""){
            seletor.addClass("invalid");
            seletor.removeClass("valid");
        } else {
            seletor.removeClass("invalid");
            seletor.addClass("valid");
        }
    });
}

function ValidarTamanhoCodigoEmpregador(seletor){
    

    seletor.on("focus", function(){
        if(this.value.length == 0){
            seletor.addClass("invalid");
        }
        seletor.parent().find("span").attr("data-error", "Este campo deve conter 8 Caracteres");
    });
    seletor.keyup(function(e){
        if(e.keyCode == 8){
            if(this.value.length < 8){
                seletor.removeClass("valid");
                seletor.addClass("invalid");
            }
        }
    });

    seletor.keypress(function(e){
        if(e.keyCode < 48 || e.keyCode > 57){
            if(e.keyCode == 8 || e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 46 || e.keyCode == 9){
                return true;
            } else {
                return false;
            }
        } else {
            if(this.value.length >= 8){
                e.preventDefault();
                if(seletor.hasClass("invalid")){
                    seletor.removeClass("invalid");
                    seletor.addClass("valid");
                }
                if(e.keyCode == 8){
                    seletor.removeClass("valid");
                    seletor.addClass("invalid");
                }
            } else {
                if(this.value.length == 7){
                    if(seletor.hasClass("invalid")){
                        seletor.removeClass("invalid");
                        seletor.addClass("valid");
                    }
                } else if(seletor.hasClass("valid")){
                    seletor.removeClass("valid");
                    seletor.addClass("invalid");
                }
            }
        }
    });

    seletor.on("paste", function(e){
        e.preventDefault();
        var textoColado = e.originalEvent.clipboardData.getData('Text');
        var textoApenasNumero = textoColado.replace(/[^0-9\.]+/g, '').replace(/[^\d]+/g, "");
        if( textoApenasNumero.length > 8 ){
            textoApenasNumero = textoApenasNumero.substr(0,8);

            if(textoApenasNumero.length == 8){
                seletor.removeClass("invalid");
                seletor.addClass("valid");
                seletor.val(textoApenasNumero);
            }
            
        } else {
            
            if(textoApenasNumero.length == 8){
                seletor.removeClass("invalid");
                seletor.addClass("valid");
                seletor.val(textoApenasNumero);
            } else {
                seletor.removeClass("valid");
                seletor.addClass("invalid");
                seletor.val(textoApenasNumero);
            }

        }
    });

}

function ValidarTamanhoNumeroEmpregador(seletorCampo, seletorTransmissor){
    
    if(seletorTransmissor.val() == null || seletorTransmissor.val() == ""){
        seletorCampo.prop("disabled", true);
    }
    

    seletorCampo.on("focus", function(){
        if(this.value.length == 0){
            seletorCampo.addClass("invalid");
        }
        
        if(seletorTransmissor.val() == "2"){
            seletorCampo.parent().find("span").attr("data-error", "O número de transmissor do tipo CPF deve conter 11 dígitos");
        } else {
            seletorCampo.parent().find("span").attr("data-error", "O número de transmissor do tipo CNPJ deve conter 14 dígitos");
        }
    });
    
    seletorCampo.keyup(function(e){
        if(e.keyCode == 8){
            seletorCampo.removeClass("valid");
            seletorCampo.addClass("invalid");
        }
    });

    var tamanhoSeletorCampo;

    seletorCampo.keypress(function(e){
        tamanhoSeletorCampo = seletorCampo.val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").length;
        if(e.keyCode < 48 || e.keyCode > 57){
            if(e.keyCode == 8 || e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 46 || e.keyCode == 9){
                return true;
            } else {
                return false;
            }
        } else {

            if(seletorTransmissor.val() == "2"){
                seletorCampo.parent().find("span").attr("data-error", "O número de transmissor do tipo CPF deve conter 11 dígitos");

                if(tamanhoSeletorCampo >= 11){
                    seletorCampo.removeClass("invalid").addClass("valid");
                    e.preventDefault();
                } else {
                    if(tamanhoSeletorCampo == 10){
                        if(seletorCampo.hasClass("invalid")){
                            seletorCampo.removeClass("invalid");
                            seletorCampo.addClass("valid");
                        }
                    } else if(seletorCampo.hasClass("valid")){
                        seletorCampo.removeClass("valid");
                        seletorCampo.addClass("invalid");
                    }
                }

                seletorCampo.mask('000.000.000-00');
            } else {
                seletorCampo.parent().find("span").attr("data-error", "O número de transmissor do tipo CNPJ deve conter 14 dígitos");
            
                if(tamanhoSeletorCampo >= 14){
                    seletorCampo.removeClass("invalid").addClass("valid");
                    e.preventDefault();
                } else {
                    if(tamanhoSeletorCampo == 13){
                        if(seletorCampo.hasClass("invalid")){
                            seletorCampo.removeClass("invalid");
                            seletorCampo.addClass("valid");
                        }
                    } else if(seletorCampo.hasClass("valid")){
                        seletorCampo.removeClass("valid");
                        seletorCampo.addClass("invalid");
                    }
                }

                seletorCampo.mask('00.000.000/0000-00');
            }
        }
    });

    seletorTransmissor.on("change", function(){
        tamanhoSeletorCampo = seletorCampo.val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").length;

        if(this.value == null){
            seletorCampo.prop("disabled", true);
        } else if(this.value == "2"){
            seletorCampo.prop("disabled", false);
            seletorCampo.mask('000.000.000-00');
            if(tamanhoSeletorCampo == 11){
                seletorCampo.removeClass("invalid").addClass("valid");
            }
            seletorCampo.parent().find("span").attr("data-error", "O número de transmissor do tipo CPF deve conter 11 dígitos");
        } else {
            seletorCampo.prop("disabled", false);
            seletorCampo.mask('00.000.000/0000-00');
            if(tamanhoSeletorCampo < 14){
                seletorCampo.removeClass("valid").addClass("invalid");
                seletorCampo.parent().find("span").attr("data-error", "O número de transmissor do tipo CNPJ deve conter 14 dígitos");
            }
        }
    });

    seletorCampo.on("paste", function(e){
        e.preventDefault();
        var textoColado = e.originalEvent.clipboardData.getData('Text');
        var textoApenasNumero = textoColado.replace(/[^0-9\.]+/g, '').replace(/[^\d]+/g, "");
        console.log(seletorTransmissor.val())
        if( seletorTransmissor.val() == 1 ){

            if(textoApenasNumero.length > 14){
                textoApenasNumero = textoApenasNumero.substr(0,14);

                if(textoApenasNumero.length == 14){
                    seletorCampo.removeClass("invalid");
                    seletorCampo.addClass("valid");
                    seletorCampo.val(textoApenasNumero);
                }

            } else {
            
                if(textoApenasNumero.length == 14){
                    seletorCampo.removeClass("invalid");
                    seletorCampo.addClass("valid");
                    seletorCampo.val(textoApenasNumero);
                } else if( textoApenasNumero.length < 14 ) {
                    seletorCampo.removeClass("valid");
                    seletorCampo.addClass("invalid");
                    seletorCampo.val(textoApenasNumero);
                }

            }

            seletorCampo.mask('00.000.000/0000-00');

        } else if( seletorTransmissor.val() == 2 ) {

            if(textoApenasNumero.length > 11){
                textoApenasNumero = textoApenasNumero.substr(0,11);

                if(textoApenasNumero.length == 11){
                    seletorCampo.removeClass("invalid");
                    seletorCampo.addClass("valid");
                    seletorCampo.val(textoApenasNumero);
                }

            } else {
            
                if(textoApenasNumero.length == 11){
                    seletorCampo.removeClass("invalid");
                    seletorCampo.addClass("valid");
                    seletorCampo.val(textoApenasNumero);
                } else {
                    seletorCampo.removeClass("valid");
                    seletorCampo.addClass("invalid");
                    seletorCampo.val(textoApenasNumero);
                }

            }

            seletorCampo.mask('000.000.000-00');

        }

        console.log(textoApenasNumero);
    });

}

//Função utilizada para mudar o valor do input select quando os dados forem caregador
//Criada essa função pois o materialize gera um novo elemento quando usamos um input select
function mudarValorSelect (selector, value) {
    selector.val(value).closest('.select-wrapper').find('li').removeClass("active").closest('.select-wrapper').find('.select-dropdown').val(value).find('span:contains(' + value + ')').parent().addClass('selected active');
}


//CARREGAMENTO DE INFORMAÇÕES DA BASE DE DADOS.
function carregarInformacoes(arquivo){
    //Arquivo a ser configurado
    var arquivo_yml;

    if(arquivo == "application"){

        arquivo_yml = caminhoMensageria + "application.yml";

    } else{

        arquivo_yml = caminhoMensageria + "application-watchdog.yml";

    }
        try {
            //Iniciando leitura do arquivo. Formato de Resposta = OBJECT 
            var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));
    
            var url_db_completa;
            var url_banco;
            var porta_banco;
    
            //Carregando Informações DB
            //Informações DB SqlServer
            if(doc.db.driver == "com.microsoft.sqlserver.jdbc.SQLServerDriver"){
                
                var databaseName;
    
                url_db_completa = doc.db.url.toString().substr(17, doc.db.url.toString().length);
                
                url_banco = url_db_completa.split(";")[0].split(":")[0];
                porta_banco = url_db_completa.split(";")[0].split(":")[1];
                databaseName = url_db_completa.split(";")[1].split("=")[1];
    
                $("#url-base-de-dados").val(url_banco);
                $("#porta-base-de-dados").val(porta_banco);
                $("#nome-base-de-dados").prop("disable", false);
                $("#nome-base-de-dados").val(databaseName);
                $("#db_sid").val("");
                $("#db_sid").prop("disabled", true);                
                $("#username").val(doc.db.username);
                $("#password").val(doc.db.password);

            } else if (doc.db.driver == "oracle.jdbc.OracleDriver") {
                //Informações Oracle Driver 
                var sid_db;
                url_db_completa = doc.db.url.toString().substr(18, doc.db.url.toString().length);
    
                url_banco = url_db_completa.split(":")[0];
                porta_banco = url_db_completa.split(":")[1];
                sid_db = url_db_completa.split(":")[2];
    
    
                $("#url-base-de-dados").val(url_banco);
                $("#porta-base-de-dados").val(porta_banco);
                $("#nome-base-de-dados").val("");
                $("#nome-base-de-dados").prop("disabled", true);
                $("#db_sid").val(sid_db);
                $("#username").val(doc.db.username);
                $("#password").val(doc.db.password);
                
            } else {
                var databaseName;
    
                url_db_completa = doc.db.url.toString().substr(18, doc.db.url.toString().length);
                
                url_banco = url_db_completa.split(";")[0].split(":")[0];
                porta_banco = url_db_completa.split(":")[1].split("/")[0]
                databaseName = url_db_completa.split(":")[1].split("/")[1]
    
                $("#url-base-de-dados").val(url_banco);
                $("#porta-base-de-dados").val(porta_banco);
                $("#nome-base-de-dados").prop("disable", false);
                $("#nome-base-de-dados").val(databaseName);
                $("#db_sid").val("");
                $("#db_sid").prop("disabled", true);
                $("#username").val(doc.db.username);
                $("#password").val(doc.db.password);
            }
    
            //Função utilizada para mudar o valor do select_
            if(doc.db.driver == "oracle.jdbc.OracleDriver"){
                mudarValorSelect($("#driver-base-de-dados"), "Oracle");
                $("#driver-base-de-dados").val("oracle.jdbc.OracleDriver");
            } else if (doc.db.driver == "com.microsoft.sqlserver.jdbc.SQLServerDriver") {
                mudarValorSelect($("#driver-base-de-dados"), "SQL Server");
                $("#driver-base-de-dados").val("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            } else {
                mudarValorSelect($("#driver-base-de-dados"), "Postgre SQL");
                $("#driver-base-de-dados").val("org.postgresql.Driver");
            }

            if(arquivo == "application"){

                var tabela = "";

                var QuantidadeDeEmpregadores = doc.esocial.empregadores.length;

                var empregadores = doc.esocial.empregadores;
                var transmissor;
                    for(var i = 0; i < QuantidadeDeEmpregadores; i++){
                        //empregadores[i].senha = cryptoJS.AES.decrypt(empregadores[i].senha.toString(), chave_de_criptografia).toString(cryptoJS.enc.Utf8)
                        transmissor = empregadores[i]["tipo-transmissor"];
                        if(transmissor == "2"){
                            transmissor = "CPF";
                        } else {
                            transmissor = "CNPJ"
                        }

                        //Retorna o Número de Transmissor formatado com CPF ou CNPJ.
                        var TransmissorComMascara = MascararCamposDaTabela(empregadores[i]["numero-transmissor"], empregadores[i]["tipo-transmissor"]);

 
                        tabela += "<tr name='Empregador' class='col m12 s12'>";
                            tabela += "<td class='col m2 s2' name='TableCodigoEmpregador'>"+ empregadores[i].codigo +"</td>";
                            tabela += "<td class='col m2 s2' name='TableCaminhoCertificado'>"+ empregadores[i].chave +"</td>";
                            tabela += "<td class='col m2 s2' name='TableSenhaCertificado'>"+ empregadores[i].senha +"</td>";
                            tabela += "<td class='col m2 s2' name='TableTipoTransmissor'>"+ transmissor +"</td>";
                            tabela += "<td class='col m2 s2'name='TableNumeroTransmissor'>"+ TransmissorComMascara +"</td>";
                            tabela += "<td class='col m2 s2'>";
                                tabela += "<button class='btn' id='" + i + "' onclick='AbrirModalChaveCriptografiaEdicao(this)'><span class='material-icons'>edit</span></button>";
                                tabela += "<button class='btn' id='" + i + "' onclick='abrirModalExclusao(this)'><span class='material-icons'>delete</span></button>"
                            tabela += "</td>";
                        tabela += "</tr>";
                        tabela += "<tr class='hide col m12 s12' name='EmpregadorEditar'>";
                            tabela += "<td class='col m2 s2'>";
                                tabela += "<input type='text' name='CodigoTransmissor' value='"+ empregadores[i].codigo +"'/>";
                                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
                            tabela += "</td>";
                            tabela += "<td class='col m2 s2'>";
                                tabela += "<input type='text' name='CaminhoCertificado' class='col m8' value='"+ empregadores[i].chave +"'/>";
                                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
                                tabela += "<a class='btn col m4' id='" + i + "' onclick='carregarCertificadoEdicao(this)'><span class='material-icons'>folder_open</span></a>"
                            tabela += "</td>";
                            tabela += "<td class='col m2 s2'>";
                                tabela += "<input type='password' name='SenhaCertificado' value='"+ empregadores[i].senha +"'/>";
                                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
                            tabela += "</td>";
                            tabela += "<td class='col m2 s2' id='tipo_transmissor'>";
                                tabela += "<select name='tipo-transmissor'>";
                                    tabela += "<option value='' disabled></option>";
                                    tabela += "<option value='2'>CPF</option>";
                                    tabela += "<option value='1'>CNPJ</option>";
                                tabela += "</select>";
                            tabela += "</td>";
                            tabela += "<td class='col m2 s2'>";
                                tabela += "<input type='text' name='NumeroEmpregador' value='"+ empregadores[i]['numero-transmissor'] +"'/>";
                                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
                            tabela += "</td>";
                            tabela += "<td class='col m2 s2'>";
                                tabela += "<button class='btn' id='" + i + "' onclick='EditarEmpregador(this)'><span class='material-icons'>check</span></button>";
                                tabela += "<button class='btn' id='" + i + "' onclick='CancelarEdicao(this)'><span class='material-icons'>cancel</span></button>";
                            tabela += "</td>";
                        tabela += "</tr>";
                    }

                    $(".conteudo-empregadores").append(tabela);


                    for(var i = 0; i < QuantidadeDeEmpregadores; i++){
                        //Função utilizada para mudar o valor do select_
                        if(doc.esocial.empregadores[i]["tipo-transmissor"] == "2"){
                            mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CPF");
                            $("[name='tipo-transmissor']:eq(" + i + ")").val(2);
                            $("[name='NumeroEmpregador']:eq(" + i + ")").mask('000.000.000-00');
                        } else {
                            mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CNPJ");
                            $("[name='tipo-transmissor']:eq(" + i + ")").val(1);
                            $("[name='NumeroEmpregador']:eq(" + i + ")").mask('00.000.000/0000-00');
                        }
                        $("[name='tipo-transmissor']:eq(" + i + ")").formSelect();

                        //Validação Campo CodigoTransmissor
                        ValidarTamanhoCodigoEmpregador($("[name='CodigoTransmissor']:eq(" + i + ")"));
                        ValidarTamanhoNumeroEmpregador($("[name='NumeroEmpregador']:eq(" + i + ")"), $("[name='tipo-transmissor']:eq(" + i + ")"));
                    }

                    var caminhoCertificadoSerpro = doc.certificado.servidor.chave;
                    var senhaSerpro = doc.certificado.servidor.senha;

                    $("#tabela_caminho_serpro").html("").html(doc.certificado.servidor.chave);
                    $("#tabela_senha_serpro").html("").html(doc.certificado.servidor.senha);

                $(".Status_Carregamento_Arquivo").html("").html(sucesso_carregamento_informacoes);

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

                sleep(1000);

                M.toast({
                    html: sucesso_carregamento_informacoes,
                    timeRemaining: 200,
                    displayLength: 2000,
                    classes: 'green accent-3'
                });
                
                

            } else {

                $(".Status_Carregamento_Arquivo").html("").html(sucesso_carregamento_informacoes);
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

                sleep(1000);

                M.toast({
                    html: sucesso_carregamento_informacoes,
                    timeRemaining: 200,
                    displayLength: 2000,
                    classes: 'green accent-3'
                });

                                

            }
        } catch(e) {
            if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                $("#modalErro").modal("open");
                $(".conteudo-erro").html('');
                if(arquivo == "application"){
                    $(".conteudo-erro").append(erro_abrir_application_yml);
                    $(".Status_Carregamento_Arquivo").html("").html(info_erro_abrir_application_yml);
                } else {
                    $(".conteudo-erro").append(erro_abrir_application_watchdog_yml);
                    $(".Status_Carregamento_Arquivo").html("").html(info_erro_abrir_application_watchdog_yml);
                }
            } else {
                $("#modalErro").modal("open");
                $(".conteudo-erro").html('');
                $(".conteudo-erro").append(e.toString());
                $(".Status_Carregamento_Arquivo").html("").html("Erro ao Iniciar a Aplicação");
            }
        }    
}


function editarConfiguracoesDB() {
    $("#salvar-config-db").show();
    $("#editar-config-db").hide();

    var segredo = localStorage.getItem('SegredoSenhaDB');
    var senha_db_criptografada = $("#password").val();
    var senha_db_decriptografada = Decrypt(senha_db_criptografada, segredo);

    if(senha_db_decriptografada == "error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt") {
        M.toast({
            html: Erro_Criptografia,
            timeRemaining: 200,
            displayLength: 3000,
            classes: 'red accent-2'
        });
        $("#salvar-config-db").hide();
        $("#editar-config-db").show();
    } else if (senha_db_decriptografada == "error:0606506D:digital envelope routines:EVP_DecryptFinal_ex:wrong final block length") {
        // Provavelmente a senha informada não foi criptografada
        databaseInputsIsDisabled(false);
        $("#password").val(senha_db_criptografada);
    } else {
        databaseInputsIsDisabled(false);
        $("#password").val(senha_db_decriptografada);
    }
}

function databaseInputsIsDisabled(isVisible) {
    $("#url-base-de-dados").prop("disabled", isVisible);
    $("#porta-base-de-dados").prop("disabled", isVisible);
    $("#nome-base-de-dados").prop("disabled", isVisible);
    $("#db_sid").prop("disabled", isVisible);
    $("#username").prop("disabled", isVisible);
    $("#password").prop("disabled", isVisible);
    
    var driver_db = $("#driver-base-de-dados").val();

    if(driver_db == "oracle.jdbc.OracleDriver"){
        $("#nome-base-de-dados").removeClass("valid").removeClass("invalid");
        $("#nome-base-de-dados").prop("disabled", true);
        $("#db_sid").prop("disabled", isVisible);
    } else if(driver_db == "com.microsoft.sqlserver.jdbc.SQLServerDriver"
    || driver_db == "org.postgresql.Driver") {
        $("#db_sid").removeClass("valid").removeClass("invalid");
        $("#db_sid").prop("disabled", true);
        $("#nome-base-de-dados").prop("disabled", isVisible);
    }

}

function configurar_db(arquivo){
    //Arquivo a ser configurado
    var arquivo_yml;

    if(arquivo == "application"){

        arquivo_yml = caminhoMensageria + "application.yml";

    } else{

        arquivo_yml = caminhoMensageria + "application-watchdog.yml";

    }

    databaseInputsIsDisabled(false);

     //Informações Base de Dados
        var url_db = $("#url-base-de-dados").val();
        var porta_db = $("#porta-base-de-dados").val();
        var nome_db = $("#nome-base-de-dados").val();
        var sid_db = $("#db_sid").val();
        var driver_db = $("#driver-base-de-dados").val();
        var user_name_db = $("#username").val().replace("'", "");
        var password_db = $("#password").val();

        var error = "";

        if(url_db == ""){
            error += "Preencha o Campo URL base de dados  </br>";
        } 
        if(porta_db == ""){
            error += "Preencha o Campo Porta de Acesso  </br>";
        } 
        if(nome_db == "" && driver_db == "com.microsoft.sqlserver.jdbc.SQLServerDriver"){
            error += "Preencha o Campo Nome DB, este campo é obrigatório para o driver SQL SERVER  </br>";
        }
        if(nome_db == "" && driver_db == "org.postgresql.Driver"){
            error += "Preencha o Campo Nome DB, este campo é obrigatório para o driver Postgre SQL  </br>";
        } 
        if(user_name_db == ""){
            error += "Preencha o campo Username  </br>";
        } 
        if(driver_db == "" || driver_db == null){
            error += "Selecione o driver da base de dados </br>";
        }
        if(password_db == ""){
            error += "Preencha o campo Password  </br>";
        } 
        if(sid_db == "" && driver_db == "oracle.jdbc.OracleDriver"){
            error += "Preencha o Campo SID, este campo é obrigatório para o driver Oracle  </br>";
        }

        if(error != ""){
            $("#modalErro").modal("open");
            $(".conteudo-erro").html('');
            $(".conteudo-erro").append(error);
        } else {
            try {
                //Iniciando leitura do arquivo. Formato de Resposta = OBJECT 
                var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));
                
                //Alterando informações do arquivo
                //---------------------------------------------------------------------------//
                //Configurando Base de Dados
    
                //Url base de dados e Validation Query
                doc.db.url = url_db;
                if(driver_db == "oracle.jdbc.OracleDriver"){
                    doc.db.url = "jdbc:oracle:thin:@" + url_db + ":" + porta_db + ":" + sid_db;
                    doc.db.datasource["validation-query"] = "SELECT 1 FROM DUAL";
                } else if (driver_db == "com.microsoft.sqlserver.jdbc.SQLServerDriver") {
                    doc.db.url = "jdbc:sqlserver://" + url_db + ":" + porta_db + ";databaseName=" + nome_db + "";
                    doc.db.datasource["validation-query"] = "SELECT 1";
                } else {
                    doc.db.url = "jdbc:postgresql://" + url_db + ":" + porta_db + "/" + nome_db + "";
                    doc.db.datasource["validation-query"] = "SELECT 1";
                }
                
                //Driver base de dados
                doc.db.driver = driver_db;
    
                //Usuario base de dados
                doc.db.username = user_name_db;
    
                //Senha base de dados
                
                //password_db = cryptoJS.AES.encrypt(password_db, chave_de_criptografia).toString();
                var segredo = localStorage.getItem('SegredoSenhaDB');
                var senha_db_criptografada = Encrypt(password_db, segredo);
                doc.db.password = senha_db_criptografada
                $("#password").val(senha_db_criptografada);
    
                var ymlText = yaml_converter.stringify(doc);

                fs.writeFileSync(arquivo_yml, ymlText);

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

                sleep(1000);
                
                M.toast({
                    html: SucessoSalvarConfiguracoesDB,
                    timeRemaining: 200,
                    displayLength: 2000,
                    classes: 'green accent-3'
                });
                
              
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    $("#modalErro").modal("open");
                    $(".conteudo-erro").html('');
                    if(arquivo == "application"){
                        $(".conteudo-erro").append(erro_abrir_application_yml);
                    } else {
                        $(".conteudo-erro").append(erro_abrir_application_watchdog_yml);
                    }
                } else {
                    $("#modalErro").modal("open");
                    $(".conteudo-erro").html('');
                    $(".conteudo-erro").append(e.toString());
                    $(".Status_Carregamento_Arquivo").html("").html(e.toString());    
                }
            }
            databaseInputsIsDisabled(true);
            $("#salvar-config-db").hide();
            $("#editar-config-db").show();
        }
}

function recarregarEmpregadores(doc){
    var tabela = "";
    
    var QuantidadeDeEmpregadores = doc.esocial.empregadores.length;
    
    var empregadores = doc.esocial.empregadores;
    var transmissor;
    
    for(var i = 0; i < QuantidadeDeEmpregadores; i++){
        //empregadores[i].senha = cryptoJS.AES.decrypt(empregadores[i].senha.toString(), chave_de_criptografia).toString(cryptoJS.enc.Utf8)
        transmissor = empregadores[i]["tipo-transmissor"];
        if(transmissor == 2){
            transmissor = "CPF";
        } else {
            transmissor = "CNPJ"
        }
    
        //Retorna o Número de Transmissor formatado com CPF ou CNPJ.
        var TransmissorComMascara = MascararCamposDaTabela(empregadores[i]["numero-transmissor"], empregadores[i]["tipo-transmissor"]);
    
     
        tabela += "<tr name='Empregador' class='col m12 s12'>";
            tabela += "<td class='col m2 s2' name='TableCodigoEmpregador'>"+ empregadores[i].codigo +"</td>";
            tabela += "<td class='col m2 s2' name='TableCaminhoCertificado'>"+ empregadores[i].chave +"</td>";
            tabela += "<td class='col m2 s2' name='TableSenhaCertificado'>"+ empregadores[i].senha +"</td>";
            tabela += "<td class='col m2 s2' name='TableTipoTransmissor'>"+ transmissor +"</td>";
            tabela += "<td class='col m2 s2'name='TableNumeroTransmissor'>"+ TransmissorComMascara +"</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<button class='btn' id='" + i + "' onclick='AbrirModalChaveCriptografiaEdicao(this)'><span class='material-icons'>edit</span></button>";
                tabela += "<button class='btn' id='" + i + "' onclick='abrirModalExclusao(this)'><span class='material-icons'>delete</span></button>"
            tabela += "</td>";
        tabela += "</tr>";
        tabela += "<tr class='hide col m12 s12' name='EmpregadorEditar'>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<input type='text' name='CodigoTransmissor' value='"+ empregadores[i].codigo +"'/>";
                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
            tabela += "</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<input type='text' name='CaminhoCertificado' class='col m8' value='"+ empregadores[i].chave +"'/>";
                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
                tabela += "<a class='btn col m4' id='" + i + "' onclick='carregarCertificadoEdicao(this)'><span class='material-icons'>folder_open</span></a>"
            tabela += "</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<input type='password' name='SenhaCertificado' value='"+ empregadores[i].senha +"'/>";
                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
            tabela += "</td>";
            tabela += "<td class='col m2 s2' id='tipo_transmissor'>";
                tabela += "<select name='tipo-transmissor'>";
                    tabela += "<option value='' disabled></option>";
                    tabela += "<option value='2'>CPF</option>";
                    tabela += "<option value='1'>CNPJ</option>";
                tabela += "</select>";
            tabela += "</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<input type='text' name='NumeroEmpregador' value='"+ empregadores[i]['numero-transmissor'] +"'/>";
                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
            tabela += "</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<button class='btn' id='" + i + "' onclick='EditarEmpregador(this)'><span class='material-icons'>check</span></button>";
                tabela += "<button class='btn' id='" + i + "' onclick='CancelarEdicao(this)'><span class='material-icons'>cancel</span></button>";
            tabela += "</td>";
        tabela += "</tr>";
    }
    
    $(".conteudo-empregadores").html("");
    $(".conteudo-empregadores").append(tabela);
    
    
    for(var i = 0; i < QuantidadeDeEmpregadores; i++){
        //Função utilizada para mudar o valor do select_
        if(doc.esocial.empregadores[i]["tipo-transmissor"] == "2"){
            mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CPF");
            $("[name='tipo-transmissor']:eq(" + i + ")").val(2);
            $("[name='NumeroEmpregador']:eq(" + i + ")").mask('000.000.000-00');
        } else {
            mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CNPJ");
            $("[name='tipo-transmissor']:eq(" + i + ")").val(1);
            $("[name='NumeroEmpregador']:eq(" + i + ")").mask('00.000.000/0000-00');
        }
        $("[name='tipo-transmissor']:eq(" + i + ")").formSelect();

        //Validação Campo CodigoTransmissor
        ValidarTamanhoCodigoEmpregador($("[name='CodigoTransmissor']:eq(" + i + ")"));
        ValidarTamanhoNumeroEmpregador($("[name='NumeroEmpregador']:eq(" + i + ")"), $("[name='tipo-transmissor']:eq(" + i + ")"));
    }    
}

function abrirModalExclusao(indexEmpregador){
    //Pegando ID do botão.
    //Como não posso atribuir um ID fixo na chamada de função
    //Atribuo um ID aos botões que não irá mudar e não irá 
    //Gerar falhas nas exclusões fazendo com que itens errados sejam excluidos.
    indexEmpregador = $(indexEmpregador).prop("id");

    localStorage.setItem("Index_Empregador_A_Excluir", indexEmpregador);

    $(".conteudo-exclusao").html("").append("Deseja excluir o Empregador selecionado ?");
    $("#modalExclusao").modal("open"); 
}

function excluirEmpregador() {
    var indexEmpregador = localStorage.getItem('Index_Empregador_A_Excluir');
    $("#modalExclusao").modal("close"); 

    try {
        //Iniciando leitura do arquivo. Formato de Resposta = OBJECT 
        var arquivo_yml = caminhoMensageria + "application.yml";
        var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));
        doc.esocial.empregadores.splice(indexEmpregador, 1);
        
        var ymlText = yaml_converter.stringify(doc);
        fs.writeFileSync(arquivo_yml, ymlText);

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

                /*var totalEmpregadores = $("[name=EmpregadorEditar]").length;
                var indiceExcluido;
                for(var i = 0; i < totalEmpregadores; i++){
                    if(parseInt($("[name='EmpregadorEditar']:eq(" + i + ")").find("button").eq(0).attr("id")) == indexEmpregador){
                        indiceExcluido = i;
                    }
                }*/
                $("[name=Empregador]:eq(" + indexEmpregador + ")").css("background-color", "#ff8a80");

        M.toast({
            html: loader,
            timeRemaining: 200,
            displayLength: 1000,
            classes: 'container center transparent',
            completeCallback: () => {
                $("[name=Empregador]:eq(" + indexEmpregador + ")").remove();
                $("[name=EmpregadorEditar]:eq(" + indexEmpregador + ")").remove();
                recarregarEmpregadores(doc);
            }
        });

        sleep(1000);

        M.toast({
            html: 'Empregador excluído com sucesso!',
            timeRemaining: 200,
            displayLength: 2000,
            classes: 'green accent-3'
        });
                        
    } catch(e) {
        if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
            $("[name=Empregador]:eq(" + indexEmpregador + ")").css("background-color", "#ffffff");
            $("#modalErro").modal("open");
            $(".conteudo-erro").html('');
            $(".conteudo-erro").append(erro_abrir_application_yml);
            $(".Status_Carregamento_Arquivo").html("").html(erro_abrir_application_yml);
        } else {
            $("[name=Empregador]:eq(" + indexEmpregador + ")").css("background-color", "#ffffff");;
            $("#modalErro").modal("open");
            $(".conteudo-erro").html('');
            $(".conteudo-erro").append(e.toString());
            $(".Status_Carregamento_Arquivo").html("").html(e.toString());    
        }
    }
}

function AbrirModalChaveCriptografiaEdicao(i){
    i = $(i).prop("id");
    //Passando id do botão como referencia para edição
    localStorage.setItem("ItemEditado", i);
    $("#modalChaveCriptografiaEdicao").modal('open');
    $("#btn-editar-com-chave").prop("disabled", true);
    
}

function PegarChaveCriptografiaEdicao(){
    $("#btn-editar-com-chave").attr("disabled", true);
    var segredo = $("#SegredoEditarCertificado").val();
    var i = localStorage.getItem("ItemEditado");
    var variavelSegredo = "SegredoEdicao_" + i;
    localStorage.setItem(variavelSegredo, segredo);
    $("#modalChaveCriptografiaEdicao").modal('close');
    IniciarEdicao(i);
}

function AbrirModalChaveCriptografiaDB(){
    $("#modalChaveCriptografiaDB").modal('open');
}

function PegarChaveCriptografiaDB(resetarSegredo){
    var segredo = "";
    if (resetarSegredo === true) {
        segredo = $("#NovoSegredoSenhaDB").val();
        $("#password").val("");
        $('#NovoSegredoSenhaDB').val("");
        $('.chaveCriptografiaDB').show();
        $('.resetarChaveCriptografiaDB').hide();
    } else {
        segredo = $("#SegredoSenhaDB").val();
        $('#SegredoSenhaDB').val("");
    }
    $("#modalChaveCriptografiaDB").modal('close');
    localStorage.setItem('SegredoSenhaDB', segredo); 
    editarConfiguracoesDB();
}

function abrirModalResetarSegredoCriptografiaDB() {
    $('.chaveCriptografiaDB').hide();
    $('#SegredoSenhaDB').val("");
    $("#btn-segredo-senha-db").attr("disabled", true);
    $('.resetarChaveCriptografiaDB').show();
    $('#btn-resetar-segredo-criptografia').attr('disabled', true);
}

function cancelarResetSegredoCriptografia() {
    $('.chaveCriptografiaDB').show();
    $('.resetarChaveCriptografiaDB').hide();
    $('#NovoSegredoSenhaDB').val("");
    $('#btn-resetar-segredo-criptografia').attr('disabled', true);
}

function IniciarEdicao(i){
    //Pegando ID do botão.
    //Como não posso atribuir um ID fixo na chamada de função
    //Atribuo um ID aos botões que não irá mudar e não irá 
    //Gerar falhas nas exclusões fazendo com que itens errados sejam excluidos.
    
    var variavelSegredo = "SegredoEdicao_" + i;
    var segredo = localStorage.getItem(variavelSegredo);
    sleep(200);
    var SenhaCertificado = $("[name='SenhaCertificado']:eq(" + i + ")").val();
    var SenhaDescriptografada = Decrypt(SenhaCertificado, segredo);
    
    if(SenhaDescriptografada == "error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt" ||
       SenhaDescriptografada == "error:0606506D:digital envelope routines:EVP_DecryptFinal_ex:wrong final block length"
    ){
        M.toast({
            html: Erro_Criptografia,
            timeRemaining: 200,
            displayLength: 3000,
            classes: 'red accent-2'
        });
        $("#SegredoEditarCertificado").val("");
    } else {
        var variavelSegredoCorreto = "SegredoCorretoEdicao_" + i;
        var segredo = localStorage.getItem(variavelSegredo);
        localStorage.setItem(variavelSegredoCorreto, segredo);

        var CodigoTransmissor = $("[name='CodigoTransmissor']:eq(" + i + ")").val();
        var CaminhoCertificado = $("[name='CaminhoCertificado']:eq(" + i + ")").val();
        var NumeroEmpregador = $("[name='NumeroEmpregador']:eq(" + i + ")").val();    
        var TipoTransmissor = $("[name='tipo-transmissor']:eq(" + i + ")").val();
        $("[name='SenhaCertificado']:eq(" + i + ")").val(SenhaDescriptografada);
    
        var AntesDaEdicao = {
            CodigoTransmissor: CodigoTransmissor,
            CaminhoCertificado: CaminhoCertificado,
            NumeroEmpregador: NumeroEmpregador,
            SenhaCertificado: SenhaCertificado,
            TipoTransmissor: TipoTransmissor
        };
    
        var NomeVariavelAntesDaEdicao = "AntesDaEdicao_" + i;
        localStorage.setItem(NomeVariavelAntesDaEdicao, JSON.stringify(AntesDaEdicao)); 
    
    
    
        $("[name='Empregador']:eq("+ i +")").addClass('hide');
        $("[name='EmpregadorEditar']:eq("+ i +")").removeClass('hide');
        $("#SegredoEditarCertificado").val("");
    }

}


function CancelarEdicao(i){

    //Pegando ID do botão.
    //Como não posso atribuir um ID fixo na chamada de função
    //Atribuo um ID aos botões que não irá mudar e não irá 
    //Gerar falhas nas exclusões fazendo com que itens errados sejam excluidos.
    i = $(i).prop("id");

    //Variavel Gerada Na função IniciarEdição para pegar o valo anterior guardado no localstorage
    var NomeVariavelAntesDaEdicao = "AntesDaEdicao_" + i;
    var ValoresOriginais = JSON.parse(localStorage.getItem(NomeVariavelAntesDaEdicao));

    $("[name='CodigoTransmissor']:eq(" + i + ")").val(ValoresOriginais.CodigoTransmissor).removeClass("invalid");
    $("[name='CaminhoCertificado']:eq(" + i + ")").val(ValoresOriginais.CaminhoCertificado);
    $("[name='NumeroEmpregador']:eq(" + i + ")").val(ValoresOriginais.NumeroEmpregador).removeClass("invalid");
    $("[name='SenhaCertificado']:eq(" + i + ")").val(ValoresOriginais.SenhaCertificado);

    if(ValoresOriginais.TipoTransmissor == "2"){
        mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CPF");
        $("[name='tipo-transmissor']:eq(" + i + ")").val(2);
        $("[name='NumeroEmpregador']:eq(" + i + ")").mask('000.000.000-00');
    } else {
        mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CNPJ");
        $("[name='tipo-transmissor']:eq(" + i + ")").val(1);
        $("[name='NumeroEmpregador']:eq(" + i + ")").mask('00.000.000/0000-00');
    }

    $("[name='tipo-transmissor']:eq(" + i + ")").formSelect();

    $("[name='Empregador']:eq("+ i +")").removeClass('hide');
    $("[name='EmpregadorEditar']:eq("+ i +")").addClass('hide');

}

//Função para aguardar determinado tempo.
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


function EditarEmpregador(i){
    //Pegando ID do botão.
    //Como não posso atribuir um ID fixo na chamada de função
    //Atribuo um ID aos botões que não irá mudar e não irá 
    //Gerar falhas nas exclusões fazendo com que itens errados sejam excluidos.
    i = $(i).prop("id");


    var arquivo_yml = caminhoMensageria + "application.yml";

    var variavelSegredo = "SegredoCorretoEdicao_" + i;
    var segredo = localStorage.getItem(variavelSegredo);

    

        //Informações Certificado 
        var codigo_empregador = $("[name='CodigoTransmissor']:eq(" + i + ")").val().toString();
        var path_certificado = $("[name='CaminhoCertificado']:eq(" + i + ")").val();
        
        var senha_certificado = $("[name='SenhaCertificado']:eq(" + i + ")").val();

        var transmissor = $("[name='tipo-transmissor']:eq(" + i + ")").val();
        var numero_transmissor = $("[name='NumeroEmpregador']:eq(" + i + ")").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").toString();

        var error = "";

        if(path_certificado == ""){
            error += "Preencha o Campo Caminho Certificado </br>";
        }
        if(codigo_empregador == ""){
            error += "Preencha o Campo Código Empregador  </br>";
        }
        if(senha_certificado == ""){
            error += "Preencha o Campo Senha Certificado  </br>";
        }
        if(transmissor == "" || transmissor == null){
            error += "Preencha o Campo Tipo Transmissor  </br>";
        }
        if(numero_transmissor == ""){
            error += "Preencha o Campo Número Transmissor  </br>";
        }

        if(codigo_empregador != "" && codigo_empregador.length < 8){
            error += "O Campo Código Empregador deve conter 8 dígitos </br>";
        }

        if(numero_transmissor != "" && transmissor == "2" && numero_transmissor.length < 11){
            error += "O número de transmissor do tipo CPF deve conter 11 dígitos </br>";
        }

        if(numero_transmissor != "" && transmissor == "1" && numero_transmissor.length < 14){
            error += "O número de transmissor do tipo CNPJ deve conter 14 dígitos </br>";
        }

        if(numero_transmissor != "" && transmissor == "2" && numero_transmissor.length > 11){
            error += "O número de transmissor do tipo CPF deve conter 11 dígitos </br>";
        }
        
        if(error != ""){
            $("#modalErro").modal("open");
            $(".conteudo-erro").html('');
            $(".conteudo-erro").append(error);

            CancelarEdicao(i);

        } else{
            try {
                //Iniciando leitura do arquivo. Formato de Resposta = OBJECT 
                var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));
    
                //Configurando Empregador
    
                //Codigo Empregador
                doc.esocial.empregadores[i].codigo = codigo_empregador;
                
                //Path Certificado
                doc.esocial.empregadores[i].chave = path_certificado;
    
                //Senha certificado
                //Criptografando senha para AES
                senha_certificado = Encrypt(senha_certificado, segredo);

                doc.esocial.empregadores[i].senha = senha_certificado.toString();
                
                //Tipo transmissor
                doc.esocial.empregadores[i]["tipo-transmissor"] = transmissor;
    
                //Numero Transmissor
                doc.esocial.empregadores[i]["numero-transmissor"] = numero_transmissor;
    
                var ymlText = yaml_converter.stringify(doc);
                fs.writeFileSync(arquivo_yml, ymlText);

                var TabelaCodEmpregador = $("[name=TableCodigoTransmissor]:eq(" + i + ")");
                var TabelaCaminhoCertificado = $("[name=TableCaminhoCertificado]:eq(" + i + ")");
                var TabelaSenhaCertificado = $("[name=TableSenhaCertificado]:eq(" + i + ")");
                var TabelaTipoTransmissor = $("[name=TableTipoTransmissor]:eq(" + i + ")");
                var TabelaNumeroTransmissor = $("[name=TableNumeroTransmissor]:eq(" + i + ")");

                TabelaCodEmpregador.html(codigo_empregador);
                TabelaCaminhoCertificado.html(path_certificado);
                TabelaSenhaCertificado.html(senha_certificado);
                $("[name='SenhaCertificado']:eq(" + i + ")").val(senha_certificado);
                if(transmissor == "2"){
                    TabelaTipoTransmissor.html("CPF");    
                } else {
                    TabelaTipoTransmissor.html("CNPJ");    
                }

                //Retorna o Número de Transmissor formatado com CPF ou CNPJ.
                var TransmissorComMascara = MascararCamposDaTabela(numero_transmissor, transmissor);

                TabelaTipoTransmissor.html();
                TabelaNumeroTransmissor.html(TransmissorComMascara);

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
                    classes: 'container center transparent',
                });

                sleep(1000);
                
                M.toast({
                    html: 'Configurações do Empregador salvas com Sucesso!',
                    timeRemaining: 200,
                    displayLength: 2000,
                    classes: 'green accent-3'
                });

            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    $("#modalErro").modal("open");
                    $(".conteudo-erro").html('');
                    $(".conteudo-erro").append(erro_abrir_application_yml);
                    CancelarEdicao(i);
                    $(".Status_Carregamento_Arquivo").html("").html(erro_abrir_application_yml);
                } else {
                    $("#modalErro").modal("open");
                    $(".conteudo-erro").html('');
                    $(".conteudo-erro").append(e.toString());
                    CancelarEdicao(i);
                    $(".Status_Carregamento_Arquivo").html("").html(e.toString());    
                }
            }
            $("[name='Empregador']:eq("+ i +")").removeClass('hide');
            $("[name='EmpregadorEditar']:eq("+ i +")").addClass('hide');;
        }
}


function MascararCamposDaTabela(Campo, ReferenciaMascara){
    var ValorCampo = Campo

    if(ReferenciaMascara == "2"){
        //Mascara de CPF
        ValorCampo = ValorCampo.substr(0,3) + "." + ValorCampo.substr(3,3) + "." + ValorCampo.substr(6,3) + "-" + ValorCampo.substr(9,2);
    } else {
        //Mascara de CNPJ
        ValorCampo = ValorCampo.substr(0,2) + "." + ValorCampo.substr(2,3) + "." + ValorCampo.substr(5,3) + "/" + ValorCampo.substr(8,4) + "-" + ValorCampo.substr(12,2);
    }
    return ValorCampo;
}

function carregarCertificadoCadastro(inputAlvo) {

    const opcoesCertificado = {
        properties: ['openFile']
    };

    boxDialog.showOpenDialog(opcoesCertificado, (file) => {
        inputAlvo.val(file);
    });

}


function carregarCertificadoEdicao(i){

    i = $(i).prop("id");
    
    const opcoesCertificado = {
        properties: ['openFile']
    };

    boxDialog.showOpenDialog(opcoesCertificado, (file) => {
        $("[name='CaminhoCertificado']:eq(" + i + ")").val(file);
    });

}

function abrirModalCadastroEmpregador(){
    $("#btn-cadastrar-com-chave").attr("disabled", true);
    //Informações Certificado 
    var codigo_empregador = $("#novo-codigo_empregador").val().toString();
    var path_certificado = $("#novo-caminho-certificado").val();
    
    var senha_certificado = $("#novo-senha-certificado").val();

    var transmissor = $("#novo-tipo-transmissor").val();
    var numero_transmissor = $("#novo-numero-transmissor").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").toString();

    var error = "";

    if(path_certificado == ""){
        error += "Preencha o Campo Caminho Certificado </br>";
    }
    if(codigo_empregador == ""){
        error += "Preencha o Campo Código Empregador  </br>";
    }
    if(senha_certificado == ""){
        error += "Preencha o Campo Senha Certificado  </br>";
    }
    if(transmissor == "" || transmissor == null){
        error += "Preencha o Campo Tipo Transmissor  </br>";
    }
    if(numero_transmissor == ""){
        error += "Preencha o Campo Número Transmissor  </br>";
    }

    if(codigo_empregador != "" && codigo_empregador.length < 8){
        error += "O Campo Código Empregador deve conter 8 dígitos </br>";
    }

    if(numero_transmissor != "" && transmissor == "2" && numero_transmissor.length < 11){
        error += "O número de transmissor do tipo CPF deve conter 11 dígitos </br>";
    }

    if(numero_transmissor != "" && transmissor == "1" && numero_transmissor.length < 14){
        error += "O número de transmissor do tipo CNPJ deve conter 14 dígitos </br>";
    }

    if(numero_transmissor != "" && transmissor == "2" && numero_transmissor.length > 11){
        error += "O número de transmissor do tipo CPF deve conter 11 dígitos </br>";
    }
    
    if(error != ""){
        $("#modalChaveCriptografiaCadastro").modal("close");
        $("#modalErro").modal("open");
        $(".conteudo-erro").html('');
        $(".conteudo-erro").append(error);
        $("#btn-cadastrar").attr("disabled", false);
    } else{
        $("#SegredoNovoCertificado").val("");
        $("#btn-cadastrar-com-chave").attr("disabled", true);
        $("#modalChaveCriptografiaCadastro").modal("open");
        $("#btn-cadastrar").attr("disabled", false);
    }
}


function CadastrarEmpregador(){
    var SegredoCertificado = $("#SegredoNovoCertificado").val();
    $("#btn-cadastrar-com-chave").attr("disabled", true);

    $("#btn-cadastrar").attr("disabled", true);

    

    var arquivo_yml = caminhoMensageria + "application.yml";
    //Informações Certificado 
    var codigo_empregador = $("#novo-codigo_empregador").val().toString();
    var path_certificado = $("#novo-caminho-certificado").val();

    var senha_certificado = $("#novo-senha-certificado").val();

    var transmissor = $("#novo-tipo-transmissor").val();
    var numero_transmissor = $("#novo-numero-transmissor").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").toString();



        try {
            //Iniciando leitura do arquivo. Formato de Resposta = OBJECT 
            var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));

            //Senha certificado
            //Criptografando senha para AES
            senha_certificado = Encrypt(senha_certificado, SegredoCertificado);

            //Criando Objeto com o novo Empregador
            var NovoEmpregador = {
                "codigo": codigo_empregador,
                "chave": path_certificado,
                "senha": senha_certificado,
                "tipo-transmissor": transmissor,
                "numero-transmissor": numero_transmissor
            };

            //Adicionando novo Empregador ao Objeto
            doc.esocial.empregadores.push(NovoEmpregador);

            var ymlText = yaml_converter.stringify(doc);

            fs.writeFileSync(arquivo_yml, ymlText);

            var Transmissor_Extenso = "";

            if(transmissor == "2"){
                Transmissor_Extenso = "CPF";
            } else {
                Transmissor_Extenso = "CNPJ";
            }

            //Verifica quantos empregadores tem cadastrados
            var empregadoresCadastrados = parseInt($("[name='Empregador']").length);
            var IndexNovoEmpregador = empregadoresCadastrados;
            var IndexParaEdicaoOuExclusao;
            if(empregadoresCadastrados == 0){

                IndexParaEdicaoOuExclusao = 0;

            } else {

                IndexParaEdicaoOuExclusao = empregadoresCadastrados

            }
            

            //Retorna o Número de Transmissor formatado com CPF ou CNPJ.
            var TransmissorComMascara = MascararCamposDaTabela(numero_transmissor, transmissor);

            var tabela = "";
            tabela += "<tr class='col m12 s12' name='Empregador'>";
            tabela += "<td class='col m2 s2' name='TableCodigoEmpregador'>"+ NovoEmpregador.codigo +"</td>";
            tabela += "<td class='col m2 s2' name='TableCaminhoCertificado'>"+ NovoEmpregador.chave +"</td>";
            tabela += "<td class='col m2 s2' name='TableSenhaCertificado'>"+ NovoEmpregador.senha +"</td>";
            tabela += "<td class='col m2 s2' name='TableTipoTransmissor'>"+ Transmissor_Extenso +"</td>";
            tabela += "<td class='col m2 s2' name='TableNumeroTransmissor'>"+ TransmissorComMascara +"</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<button class='btn' id='" + IndexParaEdicaoOuExclusao + "' onclick='AbrirModalChaveCriptografiaEdicao(this)'><span class='material-icons'>edit</span></button>";
                tabela += "<button class='btn' id='" + IndexParaEdicaoOuExclusao + "' onclick='abrirModalExclusao(this)'><span class='material-icons'>delete</span></button>"
            tabela += "</td>";
        tabela += "</tr>";
        tabela += "<tr class='hide col m12 s12' name='EmpregadorEditar'>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<input type='text' name='CodigoTransmissor' value='"+ NovoEmpregador.codigo +"'/>";
                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
            tabela += "</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<input type='text' class='col m8' name='CaminhoCertificado' value='"+ NovoEmpregador.chave +"'/>";
                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
                tabela += "<a class='btn col m4' id='" + IndexParaEdicaoOuExclusao + "' onclick='carregarCertificadoEdicao(this)'><span class='material-icons'>folder_open</span></a>"
            tabela += "</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<input type='password' name='SenhaCertificado' value='"+ NovoEmpregador.senha +"'/>";
                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
            tabela += "</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<select name='tipo-transmissor' id='tipo_transmissor'>";
                    tabela += "<option value='' disabled></option>";
                    tabela += "<option value='2'>CPF</option>";
                    tabela += "<option value='1'>CNPJ</option>";
                tabela += "</select>";
            tabela += "</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<input type='text' name='NumeroEmpregador' value='"+ numero_transmissor +"'/>";
                tabela += "<span class='helper-text' data-error='' data-success=''></span>";
            tabela += "</td>";
            tabela += "<td class='col m2 s2'>";
                tabela += "<button class='btn' id='" + IndexParaEdicaoOuExclusao + "' onclick='EditarEmpregador(this)'><span class='material-icons'>check</span></button>";
                tabela += "<button class='btn' id='" + IndexParaEdicaoOuExclusao + "' onclick='CancelarEdicao(this)'><span class='material-icons'>cancel</span></button>";
            tabela += "</td>";
        tabela += "</tr>";  
        
        $(".conteudo-empregadores").append(tabela);

        if(NovoEmpregador['tipo-transmissor'] == "2"){
            mudarValorSelect($("[name='tipo-transmissor']:eq(" + IndexNovoEmpregador + ")"), "CPF");
            $("[name='tipo-transmissor']:eq(" + IndexNovoEmpregador + ")").val(2);
            $("[name='NumeroEmpregador']:eq(" + IndexNovoEmpregador + ")").mask('000.000.000-00');
        } else {
            mudarValorSelect($("[name='tipo-transmissor']:eq(" + IndexNovoEmpregador + ")"), "CNPJ");
            $("[name='tipo-transmissor']:eq(" + IndexNovoEmpregador + ")").val(1);
            $("[name='NumeroEmpregador']:eq(" + IndexNovoEmpregador + ")").mask('00.000.000/0000-00');
        }
        $("[name='tipo-transmissor']:eq(" + IndexNovoEmpregador + ")").formSelect();

        //Validação Campo CodigoTransmissor
        ValidarTamanhoCodigoEmpregador($("[name='CodigoTransmissor']:eq(" + IndexNovoEmpregador + ")"));
        ValidarTamanhoNumeroEmpregador($("[name='NumeroEmpregador']:eq(" + IndexNovoEmpregador + ")"), $("[name='tipo-transmissor']:eq(" + IndexNovoEmpregador + ")"));
        
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
                classes: 'container center transparent',
                completeCallback: () => {
                    //Reativar botão de cadastro.
                    $("#btn-cadastrar").attr("disabled", false);
                    //Função para limpar os campos de cadastro.
                    CancelarCadastro();
                    $("#btn-cadastrar-com-chave").attr("disabled", false);
                    $("#modalChaveCriptografiaCadastro").modal("close");
                }
            });

            sleep(1000);

            M.toast({
                html: SucessoCadastroEmpregador,
                timeRemaining: 200,
                displayLength: 2000,
                classes: 'green accent-3'
            });
            
            $(".conteudo-empregadores").find("tr:even").hover(function(){
                $(this).addClass("blue-grey lighten-4");
            }, function(){
                $(this).removeClass("blue-grey lighten-4");
            });
            

        } catch(e) {
            if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                $("#modalErro").modal("open");
                $(".conteudo-erro").html('');
                $(".conteudo-erro").append(erro_abrir_application_yml);
                $(".Status_Carregamento_Arquivo").html("").html(erro_abrir_application_yml);
                $("#btn-cadastrar").prop("disabled", false);
                $("#btn-cadastrar-com-chave").prop("disabled", false);
                $("#modalChaveCriptografiaCadastro").modal("close");
            } else {
                $("#modalErro").modal("open");
                $(".conteudo-erro").html('');
                $(".conteudo-erro").append(e.toString());
                $("#btn-cadastrar-com-chave").prop("disabled", false);
                $("#btn-cadastrar").prop("disabled", false);
                $("#modalChaveCriptografiaCadastro").modal("close");
                $(".Status_Carregamento_Arquivo").html("").html(e.toString());
            }
        }
    
}

function CancelarCadastro(){
    $("#novo-codigo_empregador").val("").removeClass("invalid").removeClass("valid").focusout();
    $("#novo-caminho-certificado").val("").removeClass("invalid").removeClass("valid").focusout();
    $("#novo-senha-certificado").val("").removeClass("invalid").removeClass("valid").focusout();
    $("#novo-numero-transmissor").val("").removeClass("invalid").removeClass("valid").focusout();
    $("#novo-caminho-certificado").focusout().removeClass("invalid").focusout();
}

function abrirModalCadastroSerpro(){
    var caminhoSerpro = $("#caminho_serpro").val();
    var senhaSerpro = $("#senha_serpro").val();
    var erro = "";

    if(caminhoSerpro == ""){
        erro += "Especifique o caminho do Certificado </br>";
    }
    if(senhaSerpro == ""){
        erro += "Preencha o campo Senha Serpro";
    }

    if(erro == ""){
        $("#SegredoNovoCertificado").val("");
        $("#modalChaveCriptografiaCadastroSerpro").modal("open");
        $("#btn-cadastrar-com-chave-serpro").prop("disabled", true);
        $("#SegredoNovoCertificadoSerpro").val("");
    } else {
        $("#modalErro").modal("open");
        $(".conteudo-erro").html('');
        $(".conteudo-erro").append(erro);
    }
}

function cadastrarSerpro(){
    var caminhoSerpro = $("#caminho_serpro").val();
    var senhaSerpro = $("#senha_serpro").val();
    var segredo = $("#SegredoNovoCertificadoSerpro").val();
    

    try{
        var arquivo_yml = caminhoMensageria + "application.yml";
        var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));

        doc.certificado.servidor.chave = caminhoSerpro;
        doc.certificado.servidor.senha = Encrypt(senhaSerpro, segredo);

        var ymlText = yaml_converter.stringify(doc);
        fs.writeFileSync(arquivo_yml, ymlText);


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
                classes: 'container center transparent',
                completeCallback: () => {
                    $("#btn-cadastrar-com-chave-serpro").prop("disabled", false);
                    $("#modalChaveCriptografiaCadastroSerpro").modal("close");
                    $("#tabela_caminho_serpro").html("").html($("#caminho_serpro").val());
                    $("#tabela_senha_serpro").html("").html(Encrypt(senhaSerpro, segredo));
                    $("#caminho_serpro").val("");
                    $("#senha_serpro").val("");
                }
            });

            sleep(1000);

            M.toast({
                html: SucessoCadastroSerpro,
                timeRemaining: 200,
                displayLength: 2000,
                classes: 'green accent-3'
            });

    } catch(e){
        if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
            $("#modalErro").modal("open");
            $(".conteudo-erro").html('');
            $(".conteudo-erro").append(erro_abrir_application_yml);
            $(".Status_Carregamento_Arquivo").html("").html(erro_abrir_application_yml);
            $("#modalChaveCriptografiaCadastroSerpro").modal("close");
            $("#btn-cadastrar-com-chave").prop("disabled", false);
        } else {
            $("#modalErro").modal("open");
            $(".conteudo-erro").html('');
            $(".conteudo-erro").append(e.toString());
            $("#modalChaveCriptografiaCadastroSerpro").modal("close");
            $(".Status_Carregamento_Arquivo").html("").html(e.toString());
            $("#btn-cadastrar-com-chave").prop("disabled", false);
        }
    }
}

/*
try {
    //Base para leitura e escrita em yml
    var doc = yaml.safeLoad(fs.readFileSync('application.yml', 'utf8'));
    doc.esocial.empregadores[0].codigo = 12345678;
    doc.esocial.empregadores[1].codigo = 87654321;
    var ymlText = yaml_converter.stringify(doc);
    fs.writeFileSync(arquivo_yml, ymlText);
    doc.db.datasource.validation-query
    
} catch(e) {
    console.log(e);
}
*/