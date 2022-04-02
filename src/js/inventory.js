const { cwd } = require("process")
const {shell, BrowserWindow} = require('electron')
var $ = jQuery = require("jquery")
var table = require(cwd() + "/resources/app/src/js/tables.js")
const fs = require("fs")
var filepy = cwd() + "/resources/app/src/py/main.py"

$(document).ready(function(){
    var images = []
    completeTable()
    $("#general").fadeIn(800)

    $("#new_supply").on("click", function(e){
        $(".table, #new_supply").hide()
        $("#form, #back_to_table").fadeIn(500)
        getSuppliers()
    })

    $("#type_sink").on("change", function(){
        if ($(this).children("option:selected").val() === "other"){
            $("#description").attr("disabled", false)
        }
    })

    $("#images").on("change", function(){
        for (const f of this.files) {
            if (!images.includes(f)){
                images.push(f)
            }  
        }
    })

    $("table").delegate("button", "click", function(){
        let id_sink = this.parentElement.parentElement.id.replaceAll("supply", "").trim()
        let brand = this.parentElement.parentElement.children[0].textContent
        let model = this.parentElement.parentElement.children[1].textContent
        let type = this.parentElement.parentElement.children[3].textContent
        path = __dirname + "../../../docs/sinks/" + type.replaceAll(" ", "_") + "/" + brand.replaceAll(" ", "_") + "/" + model.replaceAll(" ", "_") + "/" + ""
        if (fs.existsSync(path)){
            shell.openPath(path)
        }
        else{
            if (confirm("OOPS! The folder does not exists")){
                fs.mkdirSync(path)
            }
        }
    })

    $("#newSink").on("click", function(e){
        e.preventDefault()
        e.stopPropagation()
        let files = ""
        let descr = ""
        let some_error = false
        $("form").find("input[type=text], input[type=number], select").each(function(){
            if ($(this).val().trim() !== ""){
                $(this).css("box-shadow", "0 0 5px green")
            }
            else{
                if(!$(this).prop("disabled")){
                    $(this).css("box-shadow", "0 0 5px red")
                    some_error = true
                }
            }
        })
        if (!some_error){
            let brand = $("#brand").val().trim()
            let model = $("#model").val().trim()
            let supplier = $("#supplier").val().trim()
            let type = $("#type_sink").children("option:selected").val()
            if (!$("#description").prop("disabled")){
                descr = $("#description").val().trim()
            }
            let material = $("#material").val().trim()
            let color = $("#color").val().trim()
            let price = $("#price").val().trim()
            let size = $("#size").val().trim()
            images.forEach(f => {
                files += f.path + " - " 
            });
            sendNewSupply(brand, model, supplier, type, descr, material, color, price, files, size)
        }
    })

    $("#add_image").on("click", function(e){
        $(".modal-title").empty().append("Add Image")
        $(".modal-body").empty().append("<div class='container' id='data_sink'></div>")
    })

    $("#back_to_table").on("click", function(e){
        window.location.reload()
    })

    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
})

function sendNewSupply(brand, model, supplier, type, descr, material, color, price, files, size){
    let py = require("child_process").spawn("py", [filepy, "newSupply", brand, model, supplier, type, descr, material, color, price, files, size])
    py.stderr.on("data", function(data){
        alert("Error: " + data)
    })
    py.stdout.on("data", function(data){
        if (confirm(data.toString())){
            window.location.reload()
        }
    })
}

function completeTable(){
    let py = require("child_process").spawn("py", [filepy, "getAllSupplies"])
    py.stderr.on("data", function(data){
        alert(data)
    })
    py.stdout.on("data", function(data){
        if (data.toString().trim() !== "No Sinks are registered"){
            data = data.toString().split("|")
            table.supplies(data)
        }
    })
}

function getSuppliers(){
    let py = require("child_process").spawn("py", [filepy, "getAllSuppliers"])
    py.stderr.on("data", function(data){
        alert(data)
    })
    py.stdout.on("data", function(data){
        data = data.toString().split("|")
        data.pop()
        if(data.length){
            data.forEach(supplier => {
                supplier = supplier.split(",")
                $("#supplier").append("<option value='" +  supplier[0].replaceAll("(", "").trim() + "'>" + supplier[1].replaceAll("'", "").trim() + "</option>")
            });
        }
        else{
            if (confirm("You don't have some supplier registered. Please, first register the supplier.\n Click accept for go to \"Suppliers\" section")){
                window.location.href = __dirname + "/suppliers.html"
            }
        }
    })
}