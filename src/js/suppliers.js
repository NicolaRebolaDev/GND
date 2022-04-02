var $ = jQuery = require("jquery")
var table = require("../js/tables")
const { cwd } = require("process")
var filepy = cwd() + "/resources/app/src/py/main.py"

$(document).ready(function(){
    completeTable()
    $("#general").fadeIn(800)
    function main(){
        $("#table").show()
        $("#new_supplier").show()
        $("#form").hide()
        $("#back_to_table").hide()

        $("#new_supplier").on("click", function(){
            $("#table").hide()
            $("#new_supplier").hide()
            $("#form").fadeIn(500)
            $("#back_to_table").show()
        })

        $("#register").on("click", function(){
            if (validation()){
                sendNewSupplier($("#com_name").val().trim(), $("#representant").val().trim(), $("#phone").val().trim())
            }
            else{
                alert("Be sure you don\'t have some field with only spaces")
            }
        })
    }

    $(".table").delegate("#delete", "click", function(){
        id_supplier = this.parentElement.parentElement.children[0].textContent.trim()
        let py = require("child_process").spawn("py", [filepy, "deleteSupplier", id_supplier])
        py.stderr.on("data", function(data){
            alert(data)
        })
        py.stdout.on("data", function(data){
            if (confirm(data.toString())){
                window.location.reload()
            }
        })
    })

    $(".table").delegate("#update", "click", function(){
        let id_supplier = this.parentElement.parentElement.children[0].textContent.trim()
        let com_name = this.parentElement.parentElement.children[1].textContent.trim()
        let represent = this.parentElement.parentElement.children[2].textContent.trim()
        let phone = this.parentElement.parentElement.children[3].textContent.trim()
        $("#table").hide()
        $("#id_supplier").val(id_supplier)
        $("#new_supplier").hide()
        $("#com_name").val(com_name)
        $("#representant").val(represent)
        $("#phone").val(phone)
        $("#register").hide()
        $("#update_supp").show()
        $("#form").fadeIn(500)
        $("#back_to_table").show()
    })

    $("#update_supp").on("click", function(e){
        e.preventDefault()
        e.stopPropagation()
        if (validation()){
            let py = require("child_process").spawn("py", [filepy, "updateSupplier", $("#id_supplier").val().trim(), $("#com_name").val().trim(), $("#representant").val().trim(), $("#phone").val().trim()])
            py.stderr.on("data", function(data){
                alert(data)
            })  
            py.stdout.on("data", function(data){
                if (confirm(data.toString())){
                    window.location.reload()
                }
            })
        }
    })

    $("#back_to_table").on("click", function(){
        window.location.reload()
    })

    function validation(){
        let validated = true
        $("form").find("input").each(function(){
            if (!$(this).prop("hidden")){
                if ($(this).val().trim() !== ""){
                $(this).css("box-shadow", "0 0 5px green")
                }
                else{
                    $(this).css("box-shadow", "0 0 5px red")
                    validated = false
                }
            }
        })
        return validated
    }

    function sendNewSupplier(name, representant, phone){
        let py = require("child_process").spawn("py", [filepy, "newSupplier", name, representant, phone])
        py.stderr.on("data", function(data){
            alert(data)
        })
        py.stdout.on('data', function(data){
            if (confirm(data.toString())){
                window.location.reload()
            }
        })
    }

    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
      });

    main()
})

function completeTable(){
    let py = require("child_process").spawn("py", [filepy, "getAllSuppliers"])
    py.stderr.on("data", function(data){
        alert(data)
    })
    py.stdout.on('data', function(data){
        table.suppliers(data.toString().split("|"))
    })
}