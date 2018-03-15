$(document).ready(function() {
    $("#numero-transmissor-1").mask('000.000.000-00');
    $("#numero-transmissor-2").mask('000.000.000-00');

    $("#codigo_empregador_1").keypress(function(e){
            if(this.value.length >= 8){
                return false;
            }
    });
    
    $("#codigo_empregador_2").keypress(function(e){
            if(this.value.length >= 8){
                return false;
            }
    });
    
    $("#numero-transmissor-1").keypress(function(e){
        if(e.keypress < 48 || e.keypress > 57){
            if(e.keypress == 8 || e.keypress == 37 || e.keypress == 39 || e.keypress == 46 || e.keypress == 9){
                return true;
            } else {
                return false;
            }
        } else {
            if($("#tipo-transmissor-1").val() == "1"){
                if($("#numero-transmissor-1").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").length >= 11){
                    return false;
                }
                $("#numero-transmissor-1").mask('000.000.000-00');
            } else {
                if($("#numero-transmissor-1").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").length >= 14){
                    return false;
                }
                $("#numero-transmissor-1").mask('00.000.000/0000-00');
            }
        }
    });
    
    $("#numero-transmissor-2").keypress(function(e){
        if(e.keypress < 48 || e.keypress > 57){
            if(e.keypress == 8 || e.keypress == 37 || e.keypress == 39 || e.keypress == 46 || e.keypress == 9){
                return true;
            } else {
                return false;
            }
        } else {
            if($("#tipo-transmissor-2").val() == "1"){
                if($("#numero-transmissor-2").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").length >= 11){
                    return false;
                }
                $("#numero-transmissor-2").mask('000.000.000-00');
            } else {
                if($("#numero-transmissor-2").val().replace(".", "").replace("-", "").replace("/", "").replace(".", "").length >= 14){
                    return false;
                }
                $("#numero-transmissor-2").mask('00.000.000/0000-00');
            }
        }
    });
});


/*$(document).ready(function() {
    $("#codigo_empregador_1").keypress(function(e){
        if(e.keyCode < 48 || e.keyCode > 57){
            if(e.keyCode != 8 || e.keyCode != 9){
                return false;
            }
        } else {
            if(this.value.length >= 8){
                return false;
            }
        }
        
    });
    
    $("#codigo_empregador_2").keydown(function(e){
        if(e.keyCode < 48 || e.keyCode > 57){
            if(e.keyCode != 8 || e.keyCode != 9){
                return false;
            }
        } else {
            if(this.value.length >= 8){
                return false;
            }
        }
    });
    
    $("#numero-transmissor-1").keydown(function(e){
        if(e.keyCode >= 48 || e.keyCode <= 57){
            if($("#tipo-transmissor-1").val() == "1"){
                if(this.value.length >= 11){
                    return false;
                }
                $("#numero-transmissor-1").mask('000.000.000-00');
            } else {
                if(this.value.length >= 14){
                    return false;
                }
                $("#numero-transmissor-1").mask('00.000.000/0000-00');
            }
        } else {
            return false;
        }
        
    });
    
    $("#numero-transmissor-2").keydown(function(e){
        if(e.keyCode >= 48 || e.keyCode <= 57){
            if($("#tipo-transmissor-2").val() == "1"){
                if(this.value.length >= 11){
                    return false;
                }
                $("#numero-transmissor-2").mask('000.000.000-00');
            } else {
                if(this.value.length >= 14){
                    return false;
                }
                $("#numero-transmissor-2").mask('00.000.000/0000-00');
            }
        } else {
            return false;
        }
    });
});
*/