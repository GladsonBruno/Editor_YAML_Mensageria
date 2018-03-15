const yaml = require('js-yaml');
const yaml_writer = require('write-yaml');
const fs = require('fs');
const cryptoJS = require("crypto-js");

//Importando JQUERY
const $ = require('jquery');


//CARREGAMENTO DE INFORMAÇÕES DA BASE DE DADOS.
function carregarInformacoes(arquivo){
    //Arquivo a ser configurado
    var arquivo_yml = $("#arquivo-yml").val();

    if(arquivo_yml == "" && arquivo == "application"){
        $("#modalErro").modal("show");
        $(".modal-body").html('');
        $(".modal-body").append("Especifique o arquivo application.yml");
    } else if(arquivo_yml == "" && arquivo == "application-watchdog"){
        $("#modalErro").modal("show");
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
                $("#password").val(cryptoJS.AES.decrypt(doc.db.password, "12345").toString(cryptoJS.enc.Utf8));
            } else {
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
                $("#driver-base-de-dados").val(doc.db.driver);
                $("#username").val(doc.db.username);
                $("#password").val(cryptoJS.AES.decrypt(doc.db.password, "12345").toString(cryptoJS.enc.Utf8));
            }
    
            if(arquivo == "application"){
    
                $("#codigo_empregador_1").val(doc.esocial.empregadores[0].codigo);
                $("#caminho-certificado-1").val(doc.esocial.empregadores[0].chave);
                $("#senha-certificado-1").val(cryptoJS.AES.decrypt(doc.esocial.empregadores[0].senha.toString(), "12345").toString(cryptoJS.enc.Utf8));
                $("#tipo-transmissor-1").val(doc.esocial.empregadores[0]["tipo-transmissor"]);
                $("#numero-transmissor-1").val(doc.esocial.empregadores[0]["numero-transmissor"]);
    
                $("#codigo_empregador_2").val(doc.esocial.empregadores[1].codigo);
                $("#caminho-certificado-2").val(doc.esocial.empregadores[1].chave);
                $("#senha-certificado-2").val(cryptoJS.AES.decrypt(doc.esocial.empregadores[1].senha.toString(), "12345").toString(cryptoJS.enc.Utf8));
                $("#tipo-transmissor-2").val(doc.esocial.empregadores[1]["tipo-transmissor"]);
                $("#numero-transmissor-2").val(doc.esocial.empregadores[1]["numero-transmissor"]);
            }
    
            $("#modalSucesso").modal("show");
            $(".modal-body").html('');
            $(".modal-body").append("Configurações Carregadas com Sucesso");
             
            
        } catch(e) {
            if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                $("#modalErro").modal("show");
                $(".modal-body").html('');
                $(".modal-body").append("Não é possivel abrir o arquivo ou diretório especificado");
                 
            } else {
                $("#modalErro").modal("show");
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
        $("#modalErro").modal("show");
        $(".modal-body").html('');
        $(".modal-body").append("Especifique o arquivo application.yml");
    }else if(arquivo_yml == "" && arquivo == "application-watchdog"){
        $("#modalErro").modal("show");
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
        if(password_db == ""){
            error += "Preencha o campo Password  </br>";
        } 
        if(sid_db == "" && driver_db == "oracle.jdbc.OracleDriver"){
            error += "Preencha o Campo SID, este campo é obrigatório para o driver Oracle  </br>";
        }

        if(error != ""){
            $("#modalErro").modal("show");
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
                doc.db.password = password_db;
    
                yaml_writer.sync(arquivo_yml, doc);

                $("#modalSucesso").modal("show");
                $(".modal-body").html('');
                $(".modal-body").append("Configurações de Banco de Dados Salvas com Sucesso!");                
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    $("#modalErro").modal("show");
                    $(".modal-body").html('');
                    $(".modal-body").append("Não é possivel abrir o arquivo ou diretório especificado");
                } else {
                    $("#modalErro").modal("show");
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
        $("#modalErro").modal("show");
        $(".modal-body").html('');
        $(".modal-body").append("Especifique o arquivo application.yml");
    }else {
        //Informações Certificado 1
        var codigo_empregador_1 = $("#codigo_empregador_1").val().toString();
        var path_certificado_1 = $("#caminho-certificado-1").val();
        
        var senha_certificado_1 = $("#senha-certificado-1").val();
        //Criptografando senha para AES
        senha_certificado_1 = cryptoJS.AES.encrypt(senha_certificado_1, "12345").toString();

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
            $("#modalErro").modal("show");
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
                doc.esocial.empregadores[0].senha = senha_certificado_1;
                
                //Tipo transmissor 1
                doc.esocial.empregadores[0]["tipo-transmissor"] = transmissor_1;
    
                //Numero Transmissor 1
                doc.esocial.empregadores[0]["numero-transmissor"] = numero_transmissor_1;
    
                yaml_writer.sync(arquivo_yml, doc);

                $("#modalSucesso").modal("show");
                $(".modal-body").html('');
                $(".modal-body").append("Configurações do Empregador 1 salvas com Sucesso!");                
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    $("#modalErro").modal("show");
                    $(".modal-body").html('');
                    $(".modal-body").append("Não é possivel abrir o arquivo ou diretório especificado");
                } else {
                    $("#modalErro").modal("show");
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
        $("#modalErro").modal("show");
        $(".modal-body").html('');
        $(".modal-body").append("Especifique o arquivo application.yml");
    } else {
    
        //Informações Certificado 2
        var codigo_empregador_2 = $("#codigo_empregador_2").val().toString();
        var path_certificado_2 = $("#caminho-certificado-2").val();
        
        var senha_certificado_2 = $("#senha-certificado-2").val();
        //Criptografando senha certificado 2 para AES
        senha_certificado_2 = cryptoJS.AES.encrypt(senha_certificado_2, "12345").toString();
        
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
            $("#modalErro").modal("show");
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
                doc.esocial.empregadores[1].senha = senha_certificado_2;
                
                //Tipo transmissor 2
                doc.esocial.empregadores[1]["tipo-transmissor"] = transmissor_2;
    
                //Numero Transmissor 2
                doc.esocial.empregadores[1]["numero-transmissor"] = numero_transmissor_2;
    
                yaml_writer.sync(arquivo_yml, doc);

                $("#modalSucesso").modal("show");
                $(".modal-body").html('');
                $(".modal-body").append("Configurações do Empregador 2 salvas com Sucesso!");
                 
                
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    $("#modalErro").modal("show");
                    $(".modal-body").html('');
                    $(".modal-body").append("Não é possivel abrir o arquivo ou diretório especificado");
                     
                } else {
                    $("#modalErro").modal("show");
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