var $ = jQuery = require("jquery")
const { cwd } = require("process")
var table = require(cwd() + "/resources/app/src/js/tables.js")
var filepy = cwd() +  "/resources/app/src/py/main.py"

$(document).ready(function(){
    completeTable()
    $("#general").fadeIn(800)
    $("#table").show()
    $("#new_client").show()
    $("#form").hide()
    $("#register").show()
    $("#back_to_table").hide()

    $("#new_client").on("click", function(){
        $("#form_title").empty().append("New Client")
        $("#table").hide()
        $("#new_client").hide()
        $("#back_to_table").fadeIn(500)
        $("#form").fadeIn(500)
    })

    $(".table").delegate("#update", "click", function(){
        $("#form_title").empty().append("Update Client")
        $("#register").hide()
        $("#accept_update").fadeIn(500)
        $("#table").hide()
        $("#new_client").hide()
        $("#back_to_table").fadeIn(500)
        $("#form").fadeIn(500)
        id_client = this.parentElement.parentElement.children[0].textContent
        $("#fullname").val(this.parentElement.parentElement.children[1].textContent)
        new_name = this.parentElement.parentElement.children[1].textContent
        $("#fullname").on("change", function(){
            if ($(this).val().trim()){
                new_name = $(this).val().trim()
            }
        })
        new_phone = this.parentElement.parentElement.children[2].textContent
        $("#phone").val(this.parentElement.parentElement.children[2].textContent)
        $("#phone").on("change", function(){
            if ($(this).val().trim()){
                new_phone = $(this).val()
            }
        })
        new_email = this.parentElement.parentElement.children[3].textContent
        $("#email").val(this.parentElement.parentElement.children[3].textContent)
        $("#email").on("change", function(){
            if ($(this).val().trim()){
                new_email = $(this).val().trim()
            }
        })
    })

    $("#accept_update").on("click", function(e){
        e.preventDefault()
        e.stopPropagation()
        updateClient(id_client, new_name, new_email, new_phone)
    })

    $("#end_modal").on("click", function(){
        $("#delete_name").empty().append("Fullname: ")
        $("#delete_email").empty().append("Email: ")
        $("#delete_phone").empty().append("Phone: ")
    })

    $("#cancel").on("click", function(){
        $("#delete_name").empty().append("Fullname: ")
        $("#delete_email").empty().append("Email: ")
        $("#delete_phone").empty().append("Phone: ")
    })

    $(".table").delegate("#delete", "click", function(){
        $("#delete_name").empty().append("Fullname: ")
        $("#delete_email").empty().append("Email: ")
        $("#delete_phone").empty().append("Phone: ")
        delete_name = this.parentElement.parentElement.children[1].textContent
        delete_phone = this.parentElement.parentElement.children[2].textContent
        delete_email = this.parentElement.parentElement.children[3].textContent
        $("#delete_name").append(delete_name)
        $("#delete_email").append(delete_email)
        $("#delete_phone").append(delete_phone)
    })

    $("#confirm_delete").on("click", function(){
        ph = $("#delete_phone").text().slice(7).trim()
        let py = require("child_process").spawn("py", [filepy, "deleteClient", ph])
        py.stdout.on('data', function(data){
            if (confirm(data.toString())){
                window.location.reload()
            }
        })
    })

    $("#back_to_table").on("click", function(){
        window.location.reload()
    })
    
    $("#register").on("click", function(){
        let flag = false
        // Phone validation
        $(this).val().forEach(ch => {
            console.log(ch)
        });
        $("form").find("input").each(function(){
            if ($(this).val().trim() !== "" && $(this).prop("required")){
                $(this).css("box-shadow", "0 0 5px green")
            }
            else{
                $(this).css("box-shadow", "0 0 5px red")
                flag = true
            }
        })
        if (flag){
            alert("Be sure you don\'t have some field with only spaces")
        }
        else{
            let fullname = $("#fullname").val().trim()
            let phone = $("#phone").val().trim()
            let email = $("#email").val().trim()
            sendNewClient(fullname, phone, email)
        }
    })
    
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
})

function updateClient(id, name, email, phone){
    let py = require("child_process").spawn("py", [filepy, "updateClient", id, name, email, phone])
    py.stderr.on("data", function(data){
        alert(data)
    })
    py.stdout.on('data', function(data){
        if (confirm(data.toString())){
            window.location.reload()
        }
    })
}

function sendNewClient(fullname, phone, email){
    let py = require("child_process").spawn("py", [filepy, "newClient", fullname, phone, email])
    py.stderr.on("data", function(data){
        alert(data)
    })
    py.stdout.on('data', function(data){
        if (confirm(data.toString())){
            window.location.reload()
        }  
    })
}

function completeTable(){
    let py = require("child_process").spawn("py", [filepy, "getAllClients"])
    py.stderr.on("data", function(data){
        alert(data)
    })
    py.stdout.on('data', function(data){
        table.clients(data.toString().split("|"))
    })
}