const yaml = require('js-yaml');
const yaml_writer = require('write-yaml');
const fs = require('fs');
//Importando JQUERY
const $ = require('jquery');

function teste(){
    alert('ok');
}

function salvarInformacoes(){
    //Arquivo a ser configurado
    var arquivo_yml = $("#arquivo-yml").val();
    
    //Informações Base de Dados
    var url_db = $("#url-base-de-dados").val();
    var porta_db = $("#porta-base-de-dados").val();
    var nome_db = $("#nome-base-de-dados").val();
    var sid_db = $("#db_sid").val();
    var driver_db = $("#driver-base-de-dados").val();
    var user_name_db = $("#username").val().replace("'", "");
    var password_db = $("#password").val().replace("'", "");

    //Informações Certificado 1
    var codigo_empregador_1 = $("#codigo_empregador_1").val().toString();
    var path_certificado_1 = $("#caminho-certificado-1").val();
    var senha_certificado_1 = $("#senha-certificado-1").val();
    var transmissor_1 = $("#tipo-transmissor-1").val();
    var numero_transmissor_1 = $("#numero-transmissor-1").val().toString();

    //Informações Certificado 2
    var codigo_empregador_2 = $("#codigo_empregador_2").val().toString();
    var path_certificado_2 = $("#caminho-certificado-2").val();
    var senha_certificado_2 = $("#senha-certificado-2").val();
    var transmissor_2 = $("#tipo-transmissor-2").val();
    var numero_transmissor_2 = $("#numero-transmissor-2").val().toString();
    

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


        //---------------------------------------------------------------------------//
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

        //---------------------------------------------------------------------------//
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
        console.log(yaml.safeLoad(fs.readFileSync(arquivo_yml, 'utf8')));
        console.log('ok');
    } catch(e) {
        console.log(e);
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