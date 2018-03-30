const yaml = require('js-yaml');
const yaml_writer = require('write-yaml');
const fs = require('fs');
const cryptoJS = require("crypto-js");

//Chave usada para criptografia.
const chave_de_criptografia = "12345";
//Importando JQUERY
const $ = require('jquery');

//Mensagens de Erro
const erro_abrir_application_yml = "<i class='large material-icons'>error</i> Arquivo application.yml não encontrado. </br> Favor verificar se o arquivo se encontra na mesma pasta que o programa!";
const erro_abrir_application_watchdog_yml = "<i class='large material-icons'>error</i> Arquivo application-watchdog.yml não encontrado. </br> Favor verificar se o arquivo se encontra na mesma pasta que o programa!";

//Mensagens de Sucesso
const sucesso_carregamento_informacoes = "Configurações Carregadas com Sucesso";
const SucessoCadastroEmpregador = "Configurações do novo Empregador cadastradas com Sucesso!";
const SucessoSalvarConfiguracoesDB = "Configurações de Banco de Dados Salvas com Sucesso!";


$(document).ready(function(){
    //Evento para desabilitar e habilitar os campos com o id nome-base-de-dados e o db_sid
    //Se for oracle não precisa do campo nome-base-de-dados e o campo é desabilitado e habilitando o campo db_sid
    //que é obrigatório para conexão com o banco de dados Oracle
    //Se for SQL Server não precisa do campo db_sid e o campo é desabilitado e habilitando o campo nome-base-de-dados
    //que é obrigatório para conexão com o banco de dados SQL Server

    $("#driver-base-de-dados").on('change', function(){

        if($("#driver-base-de-dados").val() == "oracle.jdbc.OracleDriver"){
            $("#nome-base-de-dados").removeClass("valid").removeClass("invalid");
            $("#nome-base-de-dados").prop("disabled", true);
            $("#db_sid").prop("disabled", false);
        } else if($("#driver-base-de-dados").val() == "com.microsoft.sqlserver.jdbc.SQLServerDriver") {
            $("#db_sid").removeClass("valid").removeClass("invalid");
            $("#db_sid").prop("disabled", true);
            $("#nome-base-de-dados").prop("disabled", false);
        }
    });


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

});

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
}

function ValidarTamanhoNumeroEmpregador(seletorCampo, seletorTransmissor){
    seletorCampo.on("focus", function(){
        if(this.value.length == 0){
            seletorCampo.addClass("invalid");
        }

        if(seletorTransmissor.val() == "1"){
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

            if(seletorTransmissor.val() == "1"){
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

        if(this.value == "1"){
            seletorCampo.mask('000.000.000-00');
            if(tamanhoSeletorCampo == 11){
                seletorCampo.removeClass("invalid").addClass("valid");
            }
            seletorCampo.parent().find("span").attr("data-error", "O número de transmissor do tipo CPF deve conter 11 dígitos");
        } else {
            seletorCampo.mask('00.000.000/0000-00');
            if(tamanhoSeletorCampo < 14){
                seletorCampo.removeClass("valid").addClass("invalid");
                seletorCampo.parent().find("span").attr("data-error", "O número de transmissor do tipo CNPJ deve conter 14 dígitos");
            }
        }
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

        arquivo_yml = "application.yml";

    } else{

        arquivo_yml = "application-watchdog.yml";

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
                //Função utilizada para mudar o valor do select_
                if(doc.db.driver == "oracle.jdbc.OracleDriver"){
                    mudarValorSelect($("#driver-base-de-dados"), "Oracle");
                    $("#driver-base-de-dados").val("oracle.jdbc.OracleDriver");

                } else {
                    mudarValorSelect($("#driver-base-de-dados"), "SQL Server");
                    $("#driver-base-de-dados").val("com.microsoft.sqlserver.jdbc.SQLServerDriver");
                }
                
                $("#username").val(doc.db.username);
                $("#password").val(cryptoJS.AES.decrypt(doc.db.password, chave_de_criptografia).toString(cryptoJS.enc.Utf8));
            } else {
                //Informações Oracle Driver 
                var sid_db;
                url_db_completa = doc.db.url.toString().substr(18, doc.db.url.toString().length);
    
                url_banco = url_db_completa.split(":")[0];
                porta_banco = url_db_completa.split(":")[1];
                sid_db = url_db_completa.split(":")[2];
    
    
                $("#url-base-de-dados").val(url_banco);
                $("#url-base-de-dados").focus();
                $("#porta-base-de-dados").val(porta_banco);
                $("#porta-base-de-dados").focus();
                $("#nome-base-de-dados").val("");
                $("#nome-base-de-dados").prop("disabled", true);
                $("#db_sid").val(sid_db);
                $("#db-sid").focus();

                //Função utilizada para mudar o valor do select_
                if(doc.db.driver == "oracle.jdbc.OracleDriver"){
                    mudarValorSelect($("#driver-base-de-dados"), "Oracle");
                    $("#driver-base-de-dados").val("oracle.jdbc.OracleDriver");
                } else {
                    mudarValorSelect($("#driver-base-de-dados"), "SQL Server");
                    $("#driver-base-de-dados").val("com.microsoft.sqlserver.jdbc.SQLServerDriver");
                }

                $("#username").val(doc.db.username);
                $("#username").focus();
                $("#password").val(cryptoJS.AES.decrypt(doc.db.password, chave_de_criptografia).toString(cryptoJS.enc.Utf8));
                $("#password").focus();
            }
    
            if(arquivo == "application"){

                var QuantidadeEmpregadores = doc.esocial.empregadores.length;
                var elementos = "";
                var empregador_atual;

                if(QuantidadeEmpregadores == 0){
                    $(".empregadores").html("");
                    $(".empregadores").append("<div class='section'><h5>Não há empregadores Cadastrados!</h5></div>");
                } else{

                    for(var i = 0; i < QuantidadeEmpregadores; i++){
                        empregador_atual = i + 1;
                        
                        //Montando Formulários de Empregadores
                        elementos += "<div class='row section form-empregador-" + empregador_atual + "'>";
                            elementos += "<h5>Empregador " + empregador_atual + "</h5>";
                            elementos += "<div class='section'>";
                            elementos += "<div class='input-field col m12'>";
                                elementos += "<label for='caminho-certificado'>Caminho Certificado</label>";
                                elementos += "<input type='text' name='caminho-certificado' required disabled>"
                            elementos += "</div>";
                            elementos += "<div class='input-field col m3 s3'>";
                                elementos += "<label for='codigo_empregador'>Código Empregador</label>";
                                elementos += "<input type='text' name='codigo_empregador' required disabled>";
                                elementos += "<span class='helper-text' data-error='Este campo deve conter 8 Caracteres' data-success=''></span>";
                                elementos += "</div>";
                                elementos += "<div class='input-field col m3 s3'>";
                                elementos += "<label for='senha-certificado'>Senha Certificado</label>";
                                elementos += "<input type='password' name='senha-certificado' required disabled>";
                            elementos += "</div>";
                            elementos += "<div class='input-field col m2 s2'>";
                                elementos += "<select name='tipo-transmissor' disabled>";
                                    elementos += "<option value=' ' disabled selected>Tipo Transmissor</option>";
                                    elementos += "<option value='1'>CPF</option>";
                                    elementos += "<option value='2'>CNPJ</option>";
                                elementos += "</select>";
                            elementos += "</div>";
                            elementos += "<div class='input-field col m4 s4'>";
                                elementos += "<label for='numero-transmissor'>Número Transmissor</label>";
                                elementos += "<input type='text' data-error='' class='validate' disabled name='numero-transmissor' required>";
                                elementos += "<span class='helper-text' data-error='' data-success=''></span>";
                            elementos += "</div>";
                            elementos += "<div class='botoes-padroes'>";
                                elementos += "<button id='btn-editar' onclick='IniciarEdicao(" + i + ")' class='waves-effect waves-yellow btn-flat green accent-3 white-text'><i class='material-icons'>edit</i> Editar Empregador</button>";
                                elementos += "<button id='btn-deletar' onclick='abrirModalExclusao(" + i + ")' class='waves-effect waves-red btn-flat red accent-3 white-text'><i class='material-icons'>delete</i> Excluir Empregador</button>"
                            elementos += "</div>";
                            elementos += "<div class='botoes-edicao hide'>";
                            elementos += "<button id='btn-cancelar-edicao' onclick='CancelarEdicao(" + i + ")' class='waves-effect waves-red btn-flat red accent-3 white-text'><i class='material-icons'>cancel</i> Cancelar</button>"
                            elementos += "<button id='btn-salvar-edicao' onclick='EditarEmpregador(" + i + ")' class='waves-effect waves-yellow btn-flat green accent-3 white-text'><i class='material-icons'>sd_storage</i> Salvar Alterações</button>";
                            elementos += "</div>";
                            elementos += "</div>";
                        elementos += "</div>";
                    }

                    localStorage.setItem("leituraYML", JSON.stringify(doc));

                    $(".empregadores").html("");
                    $(".empregadores").append(elementos);
                    //Inicializando Elementos Select
                    
                    //Adicionando informações nos inputs criados com base no arquivo YML
                    for(i = 0; i < QuantidadeEmpregadores; i++){
                        $("[name='tipo-transmissor']:eq(" + i + ")").material_select();

                        $("[name='caminho-certificado']:eq(" + i + ")").val(doc.esocial.empregadores[i].chave);
                        $("[name='codigo_empregador']:eq(" + i + ")").val(doc.esocial.empregadores[i].codigo);
                        $("[name='senha-certificado']:eq(" + i + ")").val(cryptoJS.AES.decrypt(doc.esocial.empregadores[i].senha.toString(), chave_de_criptografia).toString(cryptoJS.enc.Utf8));
                        
                        $("[name='numero-transmissor']:eq(" + i + ")").val(doc.esocial.empregadores[i]["numero-transmissor"]);
    
                        //Função utilizada para mudar o valor do select_
                        if(doc.esocial.empregadores[i]["tipo-transmissor"] == "1"){
                            mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CPF");
                            $("[name='tipo-transmissor']:eq(" + i + ")").val(1);
                            $("[name='numero-transmissor']:eq(" + i + ")").mask('000.000.000-00');
                        } else {
                            mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CNPJ");
                            $("[name='tipo-transmissor']:eq(" + i + ")").val(2);
                            $("[name='numero-transmissor']:eq(" + i + ")").mask('00.000.000/0000-00');
                        }

                        ValidarTamanhoCodigoEmpregador($("[name='codigo_empregador']:eq(" + i + ")"));
                        ValidarTamanhoNumeroEmpregador($("[name='numero-transmissor']:eq(" + i + ")"), $("[name='tipo-transmissor']:eq(" + i + ")"));
                    }
                }
                $("#novo-numero-transmissor").prop("disabled", true);

                $("#novo-tipo-transmissor").on("change", function(){
                    $("#novo-numero-transmissor").prop("disabled", false);
                });

                $("#modalSucesso").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append(sucesso_carregamento_informacoes);
            } else {
                $("#modalSucesso").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append(sucesso_carregamento_informacoes);
            }
        } catch(e) {
            if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                $("#modalErro").modal("open");
                $(".modal-body").html('');
                if(arquivo_yml == "application.yml"){
                    $(".modal-body").append(erro_abrir_application_yml);
                } else {
                    $(".modal-body").append(erro_abrir_application_watchdog_yml);
                }
            } else {
                $("#modalErro").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append(e.toString());
            }
        }    
}

function configurar_db(arquivo){
    //Arquivo a ser configurado
    var arquivo_yml;

    if(arquivo == "application"){

        arquivo_yml = "application.yml";

    } else{

        arquivo_yml = "application-watchdog.yml";

    }
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
            $(".modal-body").html('');
            $(".modal-body").append(error);
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
                } else {
                    doc.db.url = "jdbc:sqlserver://" + url_db + ":" + porta_db + ";databaseName=" + nome_db + "";
                    doc.db.datasource["validation-query"] = "SELECT 1";
                }
                
                //Driver base de dados
                doc.db.driver = driver_db;
    
                //Usuario base de dados
                doc.db.username = user_name_db;
    
                //Senha base de dados
                
                password_db = cryptoJS.AES.encrypt(password_db, chave_de_criptografia).toString();
                doc.db.password = password_db;
    
                yaml_writer.sync(arquivo_yml, doc);

                $("#modalSucesso").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append(SucessoSalvarConfiguracoesDB);                
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    $("#modalErro").modal("open");
                    $(".modal-body").html('');
                    if(arquivo_yml == "application.yml"){
                        $(".modal-body").append(erro_abrir_application_yml);
                    } else {
                        $(".modal-body").append(erro_abrir_application_watchdog_yml);
                    }
                } else {
                    $("#modalErro").modal("open");
                    $(".modal-body").html('');
                    $(".modal-body").append(e.toString());     
                }
            }
        }
}

function abrirModalExclusao(indexEmpregador){
    var empregador_a_ser_excluido = parseInt(indexEmpregador) + 1;
    localStorage.setItem("Index_Empregador_A_Excluir", indexEmpregador);

    $(".modal-body").html("").append("Deseja excluir o Empregador " + empregador_a_ser_excluido + " ?");
    $("#modalExclusao").modal("open"); 
}

function excluirEmpregador() {
    var indexEmpregador = localStorage.getItem('Index_Empregador_A_Excluir');
    $("#modalExclusao").modal("close"); 

    try {
        //Iniciando leitura do arquivo. Formato de Resposta = OBJECT 
        var arquivo_yml = "application.yml";
        var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));
        doc.esocial.empregadores.splice(indexEmpregador, 1);
        yaml_writer.sync(arquivo_yml, doc);

        var empregadorExcluido = parseInt(indexEmpregador) + 1;

        $("#modalSucesso").modal("open");
        $(".modal-body").html('');
        $(".modal-body").append("Empregador " + empregadorExcluido + " excluído com sucesso!");
        setInterval( () => {
            window.location.reload();
        }, 3000);                
    } catch(e) {
        if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
            $("#modalErro").modal("open");
            $(".modal-body").html('');
            $(".modal-body").append(erro_abrir_application_yml);
        } else {
            $("#modalErro").modal("open");
            $(".modal-body").html('');
            $(".modal-body").append(e.toString());
        }
    }
}


function IniciarEdicao(i){
    var doc = JSON.parse(localStorage.getItem("leituraYML"));

    $(".botoes-padroes:eq(" + i + ")").addClass("hide");
    $(".botoes-edicao:eq(" + i + ")").removeClass("hide");
    $("[name='caminho-certificado']:eq(" + i + ")").prop("disabled", false);
    $("[name='codigo_empregador']:eq(" + i + ")").prop("disabled", false);
    $("[name='senha-certificado']:eq(" + i + ")").prop("disabled", false);
    $("[name='numero-transmissor']:eq(" + i + ")").prop("disabled", false);
    $("[name='tipo-transmissor']:eq(" + i + ")").prop("disabled", false);
    
    $("[name='tipo-transmissor']:eq(" + i + ")").material_select();
    
    //Função utilizada para mudar o valor do select_
    if(doc.esocial.empregadores[i]["tipo-transmissor"] == "1"){
        mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CPF");
        $("[name='tipo-transmissor']:eq(" + i + ")").val(1);
    } else {
        mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CNPJ");
        $("[name='tipo-transmissor']:eq(" + i + ")").val(2);
    }
    var nomeVariavelNumeroTransmissor = "numeroTransmissor" + i;
    localStorage.setItem(nomeVariavelNumeroTransmissor, $("[name='numero-transmissor']:eq(" + i + ")").val());
}

function CancelarEdicao(i) {
    $(".botoes-padroes:eq(" + i + ")").removeClass("hide");
    $(".botoes-edicao:eq(" + i + ")").addClass("hide");
    $("[name='caminho-certificado']:eq(" + i + ")").prop("disabled", true).removeClass("invalid").removeClass("valid").focusin();;
    $("[name='codigo_empregador']:eq(" + i + ")").prop("disabled", true).removeClass("invalid").removeClass("valid").focusin();;
    $("[name='senha-certificado']:eq(" + i + ")").prop("disabled", true).removeClass("invalid").removeClass("valid").focusin();;
    $("[name='numero-transmissor']:eq(" + i + ")").prop("disabled", true).removeClass("invalid").removeClass("valid").focusin();;
    $("[name='tipo-transmissor']:eq(" + i + ")").prop("disabled", true).removeClass("invalid").removeClass("valid").focusin();;
    $("[name='tipo-transmissor']:eq(" + i + ")").material_select();

    var doc = JSON.parse(localStorage.getItem("leituraYML"));

    $("[name='caminho-certificado']:eq(" + i + ")").val(doc.esocial.empregadores[i].chave);
    $("[name='codigo_empregador']:eq(" + i + ")").val(doc.esocial.empregadores[i].codigo);
    $("[name='senha-certificado']:eq(" + i + ")").val(cryptoJS.AES.decrypt(doc.esocial.empregadores[i].senha.toString(), chave_de_criptografia).toString(cryptoJS.enc.Utf8));

    var nomeVariavelNumeroTransmissor = "numeroTransmissor" + i;
    
    $("[name='numero-transmissor']:eq(" + i + ")").val(localStorage.getItem(nomeVariavelNumeroTransmissor));
    
    //Função utilizada para mudar o valor do select_
    if(doc.esocial.empregadores[i]["tipo-transmissor"] == "1"){
        mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CPF");
    } else {
        mudarValorSelect($("[name='tipo-transmissor']:eq(" + i + ")"), "CNPJ");
    }
}


//O Parametro i Se refere ao index do empregador no objeto que será editado.
function EditarEmpregador(i){
    var arquivo_yml = "application.yml";

    
    var EmpregadorEditado = parseInt(i) + 1;

        //Informações Certificado 
        var codigo_empregador = $("[name='codigo_empregador']:eq(" + i + ")").val().toString();
        var path_certificado = $("[name='caminho-certificado']:eq(" + i + ")").val();
        
        var senha_certificado = $("[name='senha-certificado']:eq(" + i + ")").val();

        var transmissor = $("[name='tipo-transmissor']:eq(" + i + ")").val();
        var numero_transmissor = $("[name='numero-transmissor']:eq(" + i + ")").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").toString();

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

        if(numero_transmissor != "" && transmissor == "1" && numero_transmissor.length < 11){
            error += "O número de transmissor do tipo CPF deve conter 11 dígitos </br>";
        }

        if(numero_transmissor != "" && transmissor == "2" && numero_transmissor.length < 14){
            error += "O número de transmissor do tipo CNPJ deve conter 14 dígitos </br>";
        }

        if(numero_transmissor != "" && transmissor == "1" && numero_transmissor.length > 11){
            error += "O número de transmissor do tipo CPF deve conter 11 dígitos </br>";
        }
        
        if(error != ""){
            $("#modalErro").modal("open");
            $(".modal-body").html('');
            $(".modal-body").append(error);
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
                senha_certificado = cryptoJS.AES.encrypt(senha_certificado, chave_de_criptografia).toString();

                doc.esocial.empregadores[i].senha = senha_certificado;
                
                //Tipo transmissor
                doc.esocial.empregadores[i]["tipo-transmissor"] = transmissor;
    
                //Numero Transmissor
                doc.esocial.empregadores[i]["numero-transmissor"] = numero_transmissor;
    
                yaml_writer.sync(arquivo_yml, doc);

                $("#modalSucesso").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append("Configurações do Empregador " + EmpregadorEditado + " salvas com Sucesso!");
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    $("#modalErro").modal("open");
                    $(".modal-body").html('');
                    $(".modal-body").append(erro_abrir_application_yml);
                } else {
                    $("#modalErro").modal("open");
                    $(".modal-body").html('');
                    $(".modal-body").append(e.toString());
                }
            }
        }
}

function CadastrarEmpregador(){
    var arquivo_yml = "application.yml";
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

    if(numero_transmissor != "" && transmissor == "1" && numero_transmissor.length < 11){
        error += "O número de transmissor do tipo CPF deve conter 11 dígitos </br>";
    }

    if(numero_transmissor != "" && transmissor == "2" && numero_transmissor.length < 14){
        error += "O número de transmissor do tipo CNPJ deve conter 14 dígitos </br>";
    }

    if(numero_transmissor != "" && transmissor == "1" && numero_transmissor.length > 11){
        error += "O número de transmissor do tipo CPF deve conter 11 dígitos </br>";
    }
    
    if(error != ""){
        $("#modalErro").modal("open");
        $(".modal-body").html('');
        $(".modal-body").append(error);
    } else{
        try {
            //Iniciando leitura do arquivo. Formato de Resposta = OBJECT 
            var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));

            //Senha certificado
            //Criptografando senha para AES
            senha_certificado = cryptoJS.AES.encrypt(senha_certificado, chave_de_criptografia).toString();

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

            yaml_writer.sync(arquivo_yml, doc);

            $("#modalSucesso").modal("open");
            $(".modal-body").html('');
            $(".modal-body").append(SucessoCadastroEmpregador);                
            setInterval( () => {
                window.location.reload();
            }, 3000);
        } catch(e) {
            if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                $("#modalErro").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append(erro_abrir_application_yml);
            } else {
                $("#modalErro").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append(e.toString());
            }
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

/*
try {
    //Base para leitura e escrita em yml
    var doc = yaml.safeLoad(fs.readFileSync('application.yml', 'utf8'));
    doc.esocial.empregadores[0].codigo = 12345678;
    doc.esocial.empregadores[1].codigo = 87654321;
    yaml_writer.sync('application.yml', doc);
    doc.db.datasource.validation-query
    
} catch(e) {
    console.log(e);
}
*/