const yaml = require('js-yaml');
const yaml_writer = require('write-yaml');
const fs = require('fs');
const cryptoJS = require("crypto-js");

//Chave usada para criptografia.
const chave_de_criptografia = "12345";
//Importando JQUERY
const $ = require('jquery');


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

    //Validar campo do caminho para o arquivo yml
    var arquivo_yml = $("#arquivo-yml");
    verificarSeOCampoEstaVazio(arquivo_yml);

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

    //Validando informações do empregador 1
    var codigo_empregador_1 = $("#codigo_empregador_1");
    verificarSeOCampoEstaVazio(codigo_empregador_1);

    var path_certificado_1 = $("#caminho-certificado-1");
    verificarSeOCampoEstaVazio(path_certificado_1);

    var senha_certificado_1 = $("#senha-certificado-1");
    verificarSeOCampoEstaVazio(senha_certificado_1);

    var numero_transmissor_1 = $("#numero-transmissor-1");
    verificarCodigoEmpregador(numero_transmissor_1, $("#tipo-transmissor-1").val());


    //Validando informações do empregador 2
    var codigo_empregador_2 = $("#codigo_empregador_2");
    verificarSeOCampoEstaVazio(codigo_empregador_2);

    var path_certificado_2 = $("#caminho-certificado-2");
    verificarSeOCampoEstaVazio(path_certificado_2);

    var senha_certificado_2 = $("#senha-certificado-2");
    verificarSeOCampoEstaVazio(senha_certificado_2);

    var numero_transmissor_2 = $("#numero-transmissor-2");  
    verificarCodigoEmpregador(numero_transmissor_2, $("#tipo-transmissor-2").val());

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

function verificarCodigoEmpregador(seletor, tipo_transmissor){
    //O Seletor é o seletor do elemento a ser verificado
    //Exemplo verificarSeOcampoEstaVazio($("#url-base-de-dados"));

    tipo_transmissor = tipo_transmissor.toString().replace(".", "").replace("-", "").replace("/", "").replace(".", "");

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
            //seletor.removeClass("invalid");
            //seletor.addClass("valid");
            if(tipo_transmissor == "1"){
                if(seletor.val().length < 11){
                    seletor.addClass("invalid");
                } else {
                    seletor.removeClass("invalid");
                    seletor.addClass("valid");
                    seletor.prop("data-error", "O Transmissor do tipo CPF deve ter 11 caracteres");
                }
            }

            if(tipo_transmissor == "2"){
                if(seletor.val().length < 14){
                    seletor.addClass("invalid");
                    seletor.prop("data-error", "O Transmissor do tipo CNPJ deve ter 14 caracteres");
                } else {
                    seletor.removeClass("invalid");
                    seletor.addClass("valid");
                }
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
    var arquivo_yml = $("#arquivo-yml").val();

    if(arquivo_yml == "" && arquivo == "application"){
        $("#modalErro").modal("open");
        $(".modal-body").html('');
        $(".modal-body").append("Especifique o arquivo application.yml");
    } else if(arquivo_yml == "" && arquivo == "application-watchdog"){
        $("#modalErro").modal("open");
        $(".modal-body").html('');
        $(".modal-body").append("Especifique o arquivo application-watchdog.yml");
    } else{
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
                $("#driver-base-de-dados").val(doc.db.driver);
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
                } else {
                    mudarValorSelect($("#driver-base-de-dados"), "SQL Server");
                }

                $("#username").val(doc.db.username);
                $("#username").focus();
                $("#password").val(cryptoJS.AES.decrypt(doc.db.password, chave_de_criptografia).toString(cryptoJS.enc.Utf8));
                $("#password").focus();
            }
    
            if(arquivo == "application"){
    
                $("#codigo_empregador_1").val(doc.esocial.empregadores[0].codigo).focus();
                $("#caminho-certificado-1").val(doc.esocial.empregadores[0].chave).focus();
                $("#senha-certificado-1").val(cryptoJS.AES.decrypt(doc.esocial.empregadores[0].senha.toString(), chave_de_criptografia).toString(cryptoJS.enc.Utf8)).focus();

                //Função utilizada para mudar o valor do select_
                if(doc.esocial.empregadores[0]["tipo-transmissor"] == "1"){
                    mudarValorSelect($("#tipo-transmissor-1"), "CPF");
                } else {
                    mudarValorSelect($("#tipo-transmissor-1"), "CNPJ");
                }

                $("#numero-transmissor-1").val(doc.esocial.empregadores[0]["numero-transmissor"]).focus();
    
                $("#codigo_empregador_2").val(doc.esocial.empregadores[1].codigo).focus();
                $("#caminho-certificado-2").val(doc.esocial.empregadores[1].chave).focus();
                $("#senha-certificado-2").val(cryptoJS.AES.decrypt(doc.esocial.empregadores[1].senha.toString(), chave_de_criptografia).toString(cryptoJS.enc.Utf8)).focus();
                
                //Função utilizada para mudar o valor do select_
                if(doc.esocial.empregadores[1]["tipo-transmissor"] == "1"){
                    mudarValorSelect($("#tipo-transmissor-2"), "CPF");
                } else {
                    mudarValorSelect($("#tipo-transmissor-2"), "CNPJ");
                }
                
                $("#numero-transmissor-2").val(doc.esocial.empregadores[1]["numero-transmissor"]).focus();
            }
    
            $("#modalSucesso").modal("open");
            $(".modal-body").html('');
            $(".modal-body").append("Configurações Carregadas com Sucesso");
             
            
        } catch(e) {
            if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                $("#modalErro").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append("Não é possivel abrir o arquivo ou diretório especificado");
                 
            } else {
                $("#modalErro").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append(e.toString());
            }
        }    
    }
}

function configurar_db(arquivo){
    //Arquivo a ser configurado
    var arquivo_yml = $("#arquivo-yml").val();
    
    if(arquivo_yml == "" && arquivo == "application"){
        $("#modalErro").modal("open");
        $(".modal-body").html('');
        $(".modal-body").append("Especifique o arquivo application.yml");
    }else if(arquivo_yml == "" && arquivo == "application-watchdog"){
        $("#modalErro").modal("open");
        $(".modal-body").html('');
        $(".modal-body").append("Especifique o arquivo application-watchdog.yml");
    } else {
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
                $(".modal-body").append("Configurações de Banco de Dados Salvas com Sucesso!");                
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    $("#modalErro").modal("open");
                    $(".modal-body").html('');
                    $(".modal-body").append("Não é possivel abrir o arquivo ou diretório especificado");
                } else {
                    $("#modalErro").modal("open");
                    $(".modal-body").html('');
                    $(".modal-body").append(e.toString());     
                }
            }
        }
    }

    
}

function configurar_empregador_1(){
    //Arquivo a ser configurado
    var arquivo_yml = $("#arquivo-yml").val();

    if(arquivo_yml == ""){
        $("#modalErro").modal("open");
        $(".modal-body").html('');
        $(".modal-body").append("Especifique o arquivo application.yml");
    }else {
        //Informações Certificado 1
        var codigo_empregador_1 = $("#codigo_empregador_1").val().toString();
        var path_certificado_1 = $("#caminho-certificado-1").val();
        
        var senha_certificado_1 = $("#senha-certificado-1").val();

        var transmissor_1 = $("#tipo-transmissor-1").val();
        var numero_transmissor_1 = $("#numero-transmissor-1").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").toString();

        var error = "";

        if(path_certificado_1 == ""){
            error += "Preencha o Campo Caminho Certificado </br>";
        }
        if(codigo_empregador_1 == ""){
            error += "Preencha o Campo Código Empregador  </br>";
        }
        if(senha_certificado_1 == ""){
            error += "Preencha o Campo Senha Certificado  </br>";
        }
        if(transmissor_1 == ""){
            error += "Preencha o Campo Tipo Transmissor  </br>";
        }
        if(numero_transmissor_1 == ""){
            error += "Preencha o Campo Número Transmissor  </br>";
        }

        if(codigo_empregador_1 != "" && codigo_empregador_1.length < 8){
            error += "O Campo Código Empregador deve conter 8 dígitos </br>";
        }

        if(numero_transmissor_1 != "" && transmissor_1 == "1" && numero_transmissor_1.length < 11){
            error += "O número transmissor do tipo CPF deve conter 11 dígitos </br>";
        }

        if(numero_transmissor_1 != "" && transmissor_1 == "2" && numero_transmissor_1.length < 14){
            error += "O número transmissor do tipo CNPJ deve conter 14 dígitos </br>";
        }

        if(numero_transmissor_1 != "" && transmissor_1 == "1" && numero_transmissor_1.length > 11){
            error += "O número transmissor do tipo CPF deve conter 11 dígitos </br>";
        }
        
        if(error != ""){
            $("#modalErro").modal("open");
            $(".modal-body").html('');
            $(".modal-body").append(error);
        } else{
            try {
                //Iniciando leitura do arquivo. Formato de Resposta = OBJECT 
                var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));
    
                //Configurando Empregador 1
    
                //Codigo Empregador 1
                doc.esocial.empregadores[0].codigo = codigo_empregador_1;
                
                //Path Certificado 1
                doc.esocial.empregadores[0].chave = path_certificado_1;
    
                //Senha certificado 1
                //Criptografando senha para AES
                senha_certificado_1 = cryptoJS.AES.encrypt(senha_certificado_1, chave_de_criptografia).toString();

                doc.esocial.empregadores[0].senha = senha_certificado_1;
                
                //Tipo transmissor 1
                doc.esocial.empregadores[0]["tipo-transmissor"] = transmissor_1;
    
                //Numero Transmissor 1
                doc.esocial.empregadores[0]["numero-transmissor"] = numero_transmissor_1;
    
                yaml_writer.sync(arquivo_yml, doc);

                $("#modalSucesso").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append("Configurações do Empregador 1 salvas com Sucesso!");                
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    $("#modalErro").modal("open");
                    $(".modal-body").html('');
                    $(".modal-body").append("Não é possivel abrir o arquivo ou diretório especificado");
                } else {
                    $("#modalErro").modal("open");
                    $(".modal-body").html('');
                    $(".modal-body").append(e.toString());
                }
            }
        }
    }
}

function configurar_empregador_2(){
    //Arquivo a ser configurado
    var arquivo_yml = $("#arquivo-yml").val();

    if(arquivo_yml == ""){
        $("#modalErro").modal("open");
        $(".modal-body").html('');
        $(".modal-body").append("Especifique o arquivo application.yml");
    } else {
    
        //Informações Certificado 2
        var codigo_empregador_2 = $("#codigo_empregador_2").val().toString();
        var path_certificado_2 = $("#caminho-certificado-2").val();
        
        var senha_certificado_2 = $("#senha-certificado-2").val();

        var transmissor_2 = $("#tipo-transmissor-2").val();
        var numero_transmissor_2 = $("#numero-transmissor-1").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").toString();
        
        var error = "";

        if(path_certificado_2 == ""){
            error += "Preencha o Campo Caminho Certificado  </br>";
        }
        if(codigo_empregador_2 == ""){
            error += "Preencha o Campo Código Empregador  </br>";
        }
        if(senha_certificado_2 == ""){
            error += "Preencha o Campo Senha Certificado  </br>";
        }
        if(transmissor_2 == ""){
            error += "Preencha o Campo Tipo Transmissor  </br>";
        }
        if(numero_transmissor_2 == ""){
            error += "Preencha o Campo Número Transmissor  </br>";
        }

        if(numero_transmissor_2 != "" && transmissor_2 == "1" && numero_transmissor_2.length < 11){
            error += "O número transmissor do tipo CPF deve conter 11 dígitos </br>"
        }

        if(numero_transmissor_2 != "" && transmissor_2 == "2" && numero_transmissor_2.length < 14){
            error += "O número transmissor do tipo CNPJ deve conter 14 dígitos </br>"
        }

        if(numero_transmissor_2 != "" && transmissor_2 == "1" && numero_transmissor_2.length > 11){
            error += "O número transmissor do tipo CPF deve conter 11 dígitos </br>";
        }

        if(error != ""){
            $("#modalErro").modal("open");
            $(".modal-body").html('');
            $(".modal-body").append(error);
        } else {
            try {
         
                //Iniciando leitura do arquivo. Formato de Resposta = OBJECT 
                var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));
    
                //Configurando Empregador 2
    
                //Codigo Empregador 2
                doc.esocial.empregadores[1].codigo = codigo_empregador_2;
                
                //Path Certificado 2
                doc.esocial.empregadores[1].chave = path_certificado_2;
    
                //Senha certificado 2
                //Criptografando senha certificado 2 para AES
                senha_certificado_2 = cryptoJS.AES.encrypt(senha_certificado_2, chave_de_criptografia).toString();
                
                doc.esocial.empregadores[1].senha = senha_certificado_2;
                
                //Tipo transmissor 2
                doc.esocial.empregadores[1]["tipo-transmissor"] = transmissor_2;
    
                //Numero Transmissor 2
                doc.esocial.empregadores[1]["numero-transmissor"] = numero_transmissor_2;
    
                yaml_writer.sync(arquivo_yml, doc);

                $("#modalSucesso").modal("open");
                $(".modal-body").html('');
                $(".modal-body").append("Configurações do Empregador 2 salvas com Sucesso!");
                 
                
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    $("#modalErro").modal("open");
                    $(".modal-body").html('');
                    $(".modal-body").append("Não é possivel abrir o arquivo ou diretório especificado");
                     
                } else {
                    $("#modalErro").modal("open");
                    $(".modal-body").html('');
                    $(".modal-body").append(e.toString());
                }
            }
        }
    }
    
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