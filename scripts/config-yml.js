const yaml = require('js-yaml');
const yaml_writer = require('write-yaml');
const fs = require('fs');
//Importando JQUERY
const $ = require('jquery');


//IMPLEMENTAR CARREGAMENTO DE INFORMAÇÕES DA BASE DE DADOS.
function carregarInformações(arquivo){
    //Arquivo a ser configurado
    var arquivo_yml = $("#arquivo-yml").val();

    try {
        //Iniciando leitura do arquivo. Formato de Resposta = OBJECT 
        var doc = yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8'));
        
        if(arquivo == "application-watchdog"){
            //Implementar busca de dados no  arquivo. Muito complicado
        }else {
            $("#codigo_empregador_1").val(doc.esocial.empregadores[0].codigo);
            $("#caminho-certificado-1").val(doc.esocial.empregadores[0].chave);
            $("#senha-certificado-1").val(doc.esocial.empregadores[0].senha);
            $("#tipo-transmissor-1").val(doc.esocial.empregadores[0]["tipo-transmissor"]);
            $("#numero-transmissor-1").val(doc.esocial.empregadores[0]["numero-transmissor"]);

            $("#codigo_empregador_2").val(doc.esocial.empregadores[1].codigo);
            $("#caminho-certificado-2").val(doc.esocial.empregadores[1].chave);
            $("#senha-certificado-2").val(doc.esocial.empregadores[1].senha);
            $("#tipo-transmissor-2").val(doc.esocial.empregadores[1]["tipo-transmissor"]);
            $("#numero-transmissor-2").val(doc.esocial.empregadores[1]["numero-transmissor"]);
        }

        alert("Configurações Carregadas com Sucesso\n Pendente Informações DB");
        
    } catch(e) {
        if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
            alert('Não é possivel abrir o arquivo ou diretório especificado');
        } else {
            alert(e.toString());
        }
    }
}

function configurar_db(arquivo){
    //Arquivo a ser configurado
    var arquivo_yml = $("#arquivo-yml").val();
    
    if(arquivo_yml == "" && arquivo == "application"){
        alert('Especifique o arquivo application.yml');
    }else if(arquivo_yml == "" && arquivo == "application-watchdog"){
        alert('Especifique o arquivo application-watchdog.yml');
    } else {
     //Informações Base de Dados
        var url_db = $("#url-base-de-dados").val();
        var porta_db = $("#porta-base-de-dados").val();
        var nome_db = $("#nome-base-de-dados").val();
        var sid_db = $("#db_sid").val();
        var driver_db = $("#driver-base-de-dados").val();
        var user_name_db = $("#username").val().replace("'", "");
        var password_db = $("#password").val().replace("'", "");

        var error = "";

        if(url_db == ""){
            error += "Preencha o Campo URL base de dados\n";
        } else if(porta_db == ""){
            error += "Preencha o Campo Porta de Acesso\n";
        } else if(nome_db == "" && driver_db == "com.microsoft.sqlserver.jdbc.SQLServerDriver"){
            error += "Preencha o Campo Nome DB, este campo é obrigatório para o driver SQL SERVER\n";
        } else if(user_name_db == ""){
            error += "Preencha o campo Username\n";
        } else if(password_db == ""){
            error += "Preencha o campo Password\n";
        } else if(sid_db == "" && driver_db == "oracle.jdbc.OracleDriver"){
            error += "Preencha o Campo SID, este campo é obrigatório para o driver Oracle\n";
        }

        if(error != ""){
            alert(error);
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

                alert("Configurações de Banco de Dados Salvas com Sucesso!");
                
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    alert('Não é possivel abrir o arquivo ou diretório especificado');
                } else {
                    alert(e.toString());
                }
            }
        }
    }

    
}

function configurar_empregador_1(){
    //Arquivo a ser configurado
    var arquivo_yml = $("#arquivo-yml").val();

    if(arquivo_yml == ""){
        alert('Especifique o arquivo application.yml');
    }else {
        //Informações Certificado 1
        var codigo_empregador_1 = $("#codigo_empregador_1").val().toString();
        var path_certificado_1 = $("#caminho-certificado-1").val();
        var senha_certificado_1 = $("#senha-certificado-1").val();
        var transmissor_1 = $("#tipo-transmissor-1").val();
        var numero_transmissor_1 = $("#numero-transmissor-1").val().toString();

        var error = "";

        if(path_certificado_1 == ""){
            error += "Preencha o Campo Caminho Certificado\n";
        } else if(codigo_empregador_1 == ""){
            error += "Preencha o Campo Código Empregador\n";
        } else if(senha_certificado_1 == ""){
            error += "Preencha o Campo Senha Certificado\n";
        } else if(transmissor_1 == ""){
            error += "Preencha o Campo Tipo Transmissor\n";
        } else if(numero_transmissor_1 == ""){
            error += "Preencha o Campo Número Transmissor\n";
        }
        
        if(error != ""){
            alert(error);
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

                alert("Configurações do Empregador 1 salvas com Sucesso!");
                
            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    alert('Não é possivel abrir o arquivo ou diretório especificado');
                } else {
                    alert(e.toString());
                }
            }
        }
    }
}

function configurar_empregador_2(){
    //Arquivo a ser configurado
    var arquivo_yml = $("#arquivo-yml").val();

    if(arquivo_yml == ""){
        alert('Especifique o arquivo application.yml');
    } else {
    
        //Informações Certificado 2
        var codigo_empregador_2 = $("#codigo_empregador_2").val().toString();
        var path_certificado_2 = $("#caminho-certificado-2").val();
        var senha_certificado_2 = $("#senha-certificado-2").val();
        var transmissor_2 = $("#tipo-transmissor-2").val();
        var numero_transmissor_2 = $("#numero-transmissor-2").val().toString();
        
        var error = "";

        if(path_certificado_2 == ""){
            error += "Preencha o Campo Caminho Certificado\n";
        } else if(codigo_empregador_2 == ""){
            error += "Preencha o Campo Código Empregador\n";
        } else if(senha_certificado_2 == ""){
            error += "Preencha o Campo Senha Certificado\n";
        } else if(transmissor_2 == ""){
            error += "Preencha o Campo Tipo Transmissor\n";
        } else if(numero_transmissor_2 == ""){
            error += "Preencha o Campo Número Transmissor\n";
        }

        if(error != ""){
            alert(error);
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

                alert("Configurações do Empregador 2 salvas com Sucesso!");

            } catch(e) {
                if(e.toString().substring(0, 40) == "Error: ENOENT: no such file or directory"){
                    alert('Não é possivel abrir o arquivo ou diretório especificado');
                } else {
                    alert(e.toString());
                }
            }
        }
    }
    
}

/*
try {
    var doc = yaml.safeLoad(fs.readFileSync('application.yml', 'utf8'));
    doc.esocial.empregadores[0].codigo = 12345678;
    doc.esocial.empregadores[1].codigo = 87654321;
    yaml_writer.sync('application.yml', doc);
    doc.db.datasource.validation-query
    
} catch(e) {
    console.log(e);
}
*/