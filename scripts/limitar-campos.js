$(document).ready(function() {

    $("#novo-codigo_empregador").keypress(function(e){
            if(this.value.length >= 8){
                return false;
            }
    });
    
    $("#novo-numero-transmissor").keypress(function(e){
        if(e.keypress < 48 || e.keypress > 57){
            if(e.keypress == 8 || e.keypress == 37 || e.keypress == 39 || e.keypress == 46 || e.keypress == 9){
                return true;
            } else {
                return false;
            }
        } else {
            if($("#novo-tipo-transmissor").val() == "1"){
                if($("#novo-numero-transmissor").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").length >= 11){
                    return false;
                }
                $("#novo-numero-transmissor").mask('000.000.000-00');
            } else {
                if($("#novo-numero-transmissor").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").length >= 14){
                    return false;
                }
                $("#novo-numero-transmissor").mask('00.000.000/0000-00');
            }
        }
    });
});
