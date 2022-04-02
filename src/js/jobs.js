var $ = jQuery = require("jquery")
const { cwd } = require("process")
const {shell, BrowserWindow} = require('electron')
var filepy = cwd() + "/resources/app/src/py/main.py"
const fs = require("fs")
var table = require("../js/tables.js")

$(document).ready(function(){
    var client = []
    var id_job = ""
    var ksink = new Map()
    var kbath = new Map()
    var quan_ksink = 0
    var quan_bath = 0
    var files_charged = []
    var need_contract = false
    completeTable()
    $("#general").fadeIn(800)
    
    try {
        // Table performance
        $(".table").delegate("#set_install", "click", function(e){
            e.preventDefault()
            e.stopPropagation()
            $(".modal-title").empty().append("Set Install day")
            $(".modal-body").empty().append("<input class='form-control' disabled id='id_job'/>").append("<input id='install_day' type='date' class='mt-2 form-control'/>")
            $("#id_job").val("Job: " + this.parentElement.parentElement.children[0].textContent)
            $("#accept").empty().text("Set installation day")
            $(".modal").modal("show")
        })

        $(".table").delegate("#add_plans", "click", function(e){
            e.preventDefault()
            e.stopPropagation()
            var id_job = this.parentElement.parentElement.children[0].textContent
            var name_client = this.parentElement.parentElement.children[1].textContent
            $(".modal-title").empty().append("Add plans")
            $(".modal-body").empty().append("<form id='modal_form'> </form>")
            $("#modal_form").append("<input disabled id='id_job' value='Job: " + id_job  + "' class='form-control'></input>")
            $("#modal_form").append("<input disabled id='name_client' class='form-control mt-2' value='Client: " + name_client + "'></input>" )
            $("#modal_form").append("<div class='custom-file mt-2' id='modal_file'/>")
            $("#modal_file").append('<label class="custom-file-label" for="customFile">Load images or plans of the job</label>')
            $("#modal-file").append("<input type='file' multiple class='custom-file-input form-control mt-2' id='customFile'>")
            $("#accept").empty().text("Add Plans")
            $(".modal").modal("show")
        })

        $(".table").delegate("#open_contract", "click", function(e){
            e.preventDefault()
            e.stopPropagation()
            var id_job = this.parentElement.parentElement.children[0].textContent.trim()
            var name_client = this.parentElement.parentElement.children[1].textContent.trim()
            path = cwd() + "/resources/app/docs/jobs/" + name_client.trim() + "/Job_" + id_job.trim() + "/contract_" + name_client.trim() + ".pdf"
            if (fs.existsSync(path)){
                shell.openPath(path)
            }
            else{
                if (confirm("OOPS! This folder does not exist\nDo you want to create it again?")){
                    //fs.mkdirSync(path)
                }
            }
        })

        $(".table").delegate("#open_plans", "click", function(e){
            e.preventDefault()
            e.stopPropagation()
            var id_job = this.parentElement.parentElement.children[0].textContent.trim()
            var name_client = this.parentElement.parentElement.children[1].textContent.trim()
            path = cwd() + "/resources/app/docs/jobs/" + name_client + "/Job_" + id_job
            if (fs.existsSync(path)){
                shell.openPath(path)
            }
            else{
                alert("This job have not a folder in the computer")
            }
        })

        $(".table").delegate("#more", "click", function(e){
            e.preventDefault()
            e.stopPropagation()
            $("#table").hide()
            $("#new_job").hide()
            $("#register").hide()
            $("#form").fadeIn(500)
            $("#update").fadeIn(500)
            $("#back_to_table").show()
            id_job = this.parentElement.children[0].textContent
            let res = require("child_process").spawn("py", [filepy, "getJobById", id_job])
            py.stderr.on("data", function(data){
                alert(data)
            })
            res.stdout.on("data", function(data){
                completeForm(data.toString().split(","))
            })
        })

        $("#update").on("click", function(e){
            e.preventDefault()
            e.stopPropagation()
            let some_req = false
            let vanity = false
            let total_money = 0
            let bath_sinks = ""
            let kitchen_sinks = ""
            let files_job = ""
            e.preventDefault()
            e.stopPropagation()
            $("form").find("input, select").each(function(){
                if ($(this).prop("required")){
                    if ($(this).val().trim() !== ""){
                        $(this).css("box-shadow", "0 0 5px green")
                    }
                    else{
                        $(this).css("box-shadow", "0 0 5px red")
                        some_req = true
                    }
                }
            })
            if (!some_req){
                client_name = $("#fullname").val().trim()
                phone = $("#phone").val().trim()
                address = $("#address").val()
                meas_day = $("#meas_day").val()
                materials = $("#materials").val()
                backsplash = String($("#backsplash").val())
                edge = $("#edge").val()
                sp_edge = String($("#sp_edge").val())
                if ($("#has_island").is(":checked")){
                    island = true
                }
                else{
                    island = false
                }
                i = 0
                if (kbath){
                    vanity = true
                    for (const [key, value] of kbath) {
                        if (i !== kbath.size -1){
                            bath_sinks += key.replace("-", "*") + " " + value.replace("-", "*") + " - "    
                        }
                        else{
                            bath_sinks += key.replace("-", "*") + " " + value.replace("-", "*")
                        }
                        i++
                    }
                }
                else{
                    bath_sinks = ""
                }
                i = 0
                if(ksink){
                    for (const [key, value] of ksink) {
                        if ( i !== ksink.size -1){
                            kitchen_sinks += key + " " + value + " - "
                        }
                        else{
                            kitchen_sinks += key + " " + value
                        }
                        i++
                    }
                }
                else{
                    kitchen_sinks = ""
                }
                total_money = $("#total_money").val()
                payed = $("#payed").val()
                rest = $("#rest").val()
                templates = String($("#quantity_template").val())
                description = String($("#desc").val())
                sp_parts = String($("#description_sp").val())
                need_contract = $("#contract").is(":checked")
                need_invoice = $("#invoice").is(":checked")
                method_pay = $("#method_pay").children("option:selected").val()
                method_sec = $("#method_pay_sec").children("option:selected").val()
                if (files_charged.length){
                    files_charged.forEach(file => {
                        files_job += file.path + " - "    
                    })
                }
                else{
                    files_job = "false"
                }
                updateJob(address, meas_day, materials, backsplash, edge, sp_edge, bath_sinks.toString(), kitchen_sinks.toString(), island, templates, description, sp_parts, need_contract, need_invoice, method_pay, files_job, client_name, total_money, payed, phone, vanity, method_sec, id_job) //23
            }
        })

        function completeForm(list){
            completeSelects()
            $("#phone").val(list[3].replaceAll("'", "").slice(0, -1).trim())
            $("#fullname").val(list[1].replaceAll("(", "").replaceAll("'", "").trim())
            $("#email").val(list[2].replaceAll("'", "").trim())
            $("#address").val(list[4].replaceAll("'", "").trim().replaceAll("/-/", ","))
            $("#meas_day").val(list[6].replaceAll("'","").trim())
            $("#materials").val(list[5].replaceAll("'", "").replaceAll("/-/", ",").replaceAll("�", '"'))
            $("#backsplash").val(list[9].replaceAll("'", "").replaceAll("/-/", ",").replaceAll("�", '"'))
            $("#edge").val(list[10].replaceAll("'", "").replaceAll("/-/", ",").replaceAll("�", '"'))
            $("#sp_edge").val(list[11].replaceAll("'", "").replaceAll("/-/", ",").replaceAll("�", '"'))
            if (list[14].split(" - ").length > 0){
                $("#bath_sink").attr("disabled", false)
                $("#quantity_vanity").attr("disabled", false).val(list[14].split(" - ").length)
                $("#vanity").prop("checked", true)
                list[14] = list[14].split(" - ")
                list[14].forEach(sink => {
                    sink = sink.replaceAll("'", "").trim().split(" ")
                    kbath.set(sink[0].replace("*", "-"), sink[1].replace("*", "-"))
                });
                completeListBath()
            }
            if(list[12].replaceAll("'", "").trim() === "true"){
                $("#has_island").prop("checked", true)
            }
            if (list[13].split(" - ").length > 0){
                $("#kitchen_sinks").attr("disabled", false)
                $("#quantity_sink").val(list[13].split(" - ").length)
                list[13] = list[13].split(" - ") 
                list[13].forEach(sink => {
                    sink = sink.replaceAll("'", "").trim().split(" ")
                    ksink.set(sink[0].replaceAll("*", "-"), sink[1].replaceAll("*", "-"))
                })
                completeListKitchen()
            }
            if (list[17].trim() > 0){
                $("#template").prop("checked", true)
                $("#quantity_template").attr("disabled", false).val(list[17].trim())
            }
            $("#desc").val(list[16].replaceAll("/-/", ",").replaceAll("'", "").replaceAll("/-/", ",").replaceAll("�", '"'))
            if (list[15].replaceAll("'", "").trim()){
                $("#has_special").prop("checked", true)
                $("#description_sp").attr("disabled", false).val(list[15].replaceAll("'", "").replaceAll("/-/", ",").trim())
            }
            if (list[19].replaceAll("'", "").trim() === "true"){
                $("#contract").prop("checked", true)
            }
            $("#total_money").val(parseFloat(list[21]))
            $("#payed").val(parseFloat(list[22]))
            $("#rest").val($("#total_money").val() - $("#payed").val())
            $("#method_pay option[value=" + list[20].replaceAll("'", "").replace("]", "").trim() + "]").prop("selected", true)
            $("#method_pay_sec option[value=" + list[24].replaceAll("'", "").replace("]", "").trim() + "]").prop("selected", true)
        }

        // show form and hide table 
        $("#new_job").on("click", function(){
            $("#table").hide()
            $("#new_job").hide()
            $("#form").fadeIn(500)
            $("#back_to_table").show()
            completeSelects()
        })

        // send new job
        $("#contract").on("change", function(){
            if ($("#contract").is(":checked")){
                $("#total_money").attr("disabled", false).prop("required", true)
                need_contract = true
            }
            else{
                need_contract = false
            }
        })

        $("#payed").on("change", function(){
            if (parseFloat($(this).val()) <= parseFloat($("#total_money").val())){
                $("#rest").val(parseFloat($("#total_money").val()) - parseFloat($(this).val()))
            }
            else{
                alert("Payed is more than Total")
            }
        })

        $("#total_money").on("change", function(){
            $("#payed").attr("disabled", false)
            if (isNaN(parseFloat($("#payed").val()))){
                $("#rest").val($(this).val())
            }
            else{
                if (parseFloat($(this).val()) >= parseFloat($("#payed").val())){
                    parseFloat($("#rest").val($(this).val()) - parseFloat($("#payed").val()))
                }
                else{
                    alert("Total is less than payed")
                }
            }
        })

        $("#register").on("click", function(e){
            let some_req = false
            let vanity = false
            let total_money = 0
            let bath_sinks = ""
            let kitchen_sinks = ""
            let files_job = ""
            e.preventDefault()
            e.stopPropagation()
            $("form").find("input, select").each(function(){
                if ($(this).prop("required")){
                    if ($(this).val().trim() !== ""){
                        $(this).css("box-shadow", "0 0 5px green")
                    }
                    else{
                        $(this).css("box-shadow", "0 0 5px red")
                        some_req = true
                    }
                }
            })
            if (!some_req){
                client_name = $("#fullname").val().trim()
                let phone = $("#phone").val().trim()
                if (client.length === 0){
                    client.push(getClientByPhone($("#phone").val().trim()))
                    client.push(getClientByPhone($("#fullname").val().trim()))
                    client.push(getClientByPhone($("#email").val().trim()))
                }
                job_client = client[0].replaceAll("(", "")
                address = $("#address").val()
                meas_day = $("#meas_day").val()
                materials = $("#materials").val()
                backsplash = String($("#backsplash").val())
                edge = $("#edge").val()
                sp_edge = String($("#sp_edge").val())
                if ($("#has_island").is(":checked")){
                    island = true
                }
                else{
                    island = false
                }
                i = 0
                if (kbath){
                    vanity = true
                    for (const [key, value] of kbath) {
                        if (i !== kbath.size -1){
                            bath_sinks += key.replace("-", "*") + " " + value.replace("-", "*") + " - "    
                        }
                        else{
                            bath_sinks += key.replace("-", "*") + " " + value.replace("-", "*")
                        }
                        i++
                    }
                }
                else{
                    bath_sinks = ""
                }
                i = 0
                if(ksink){
                    for (const [key, value] of ksink) {
                        if ( i !== ksink.size -1){
                            kitchen_sinks += key + " " + value + " - "
                        }
                        else{
                            kitchen_sinks += key + " " + value
                        }
                        i++
                    }
                }
                else{
                    kitchen_sinks = ""
                }
                total_money = $("#total_money").val()
                payed = $("#payed").val()
                rest = $("#rest").val()
                templates = String($("#quantity_template").val())
                description = String($("#desc").val())
                sp_parts = String($("#description_sp").val())
                need_contract = $("#contract").is(":checked")
                need_invoice = $("#invoice").is(":checked")
                method_pay = $("#method_pay").children("option:selected").val()
                method_sec = $("#method_pay_sec").children("option:selected").val()
                if (files_charged.length){
                    files_charged.forEach(file => {
                        files_job += file.path + " - "    
                    })
                }
                else{
                    files_job = "false"
                }
                sendNewJob(job_client, address, meas_day, materials, backsplash, edge, sp_edge, bath_sinks.toString(), kitchen_sinks.toString(), island, templates, description, sp_parts, need_contract, need_invoice, method_pay, files_job, client_name, total_money, payed, phone, vanity, method_sec) //23
            }
        })

        // Bath part
        $("#vanity").on("change", function(){
            if ( $(this).is(":checked")){
                $("#quantity_vanity").attr("disabled", false)
                $("#bath_sink").attr("disabled", false)
            }
            else{
                $("#quantity_vanity").attr("disabled", true)
                $("#bath_sink").attr("disabled", true)
            }
        })
        
        $("#quantity_vanity").on("change", function(){
            if ($(this).val() < kbath.size){
                if (confirm("You select less vanitys than registrated. To continue, please delete " + (kbath.size - $(this).val()) + " sinks.")){
                    $("input, select, textarea").attr("disabled", true)
                }

            }
        })

        $("#bath_sink").on("change", function(){
            quan_bath = $("#quantity_vanity").val()
            if (kbath.size < quan_bath){
                switch ($(this).children("option:selected").val()){
                    case "Other":
                        $("input").attr("disabled", true)
                        $("select").attr("disabled", true)
                        $("#other_sink").text("Other Sink: ")
                        $("#bath_by_client").attr("disabled", false)
                        $(this).attr("disabled", false)
                        kbath.set("Other"+kbath.size, undefined)
                        break;
                    case "Provided_by_Client":
                        $("#other_sink").text("Sink provided by client: ")
                        $("input").attr("disabled", true)
                        $("select").attr("disabled", true)
                        $("#bath_by_client").attr("disabled", false)
                        $(this).attr("disabled", false)
                        kbath.set("Provided_by_Client"+kbath.size, undefined)
                        break;
                    case "-":
                        break;
                    default:
                        $("#other_sink").text("Sink: ")
                        $("#bath_by_client").attr("disabled", true)
                        kbath.set("Sink"+kbath.size, $(this).children("option:selected").val())
                }
                completeListBath()
            } 
            else{
                alert("You choose " + quan_bath + " sinks for al vanitys. Please update the amount of vanitys, or delete some sink!")
            }  
            setTimeout(() => {$(this).val("option[' - ']")}, 500); 
        })

        $("#bath_by_client").on("change", function(e){
            e.preventDefault()
            e.stopPropagation()
            if($(this).val().trim()){
                $(this).css("box-shadow", "0 0 5px green")
                aux = Array.from(kbath)
                aux[aux.length - 1][1] = $(this).val()
                kbath = new Map(aux)
                completeListBath()
                $("input").attr("disabled", false)
                $("select").attr("disabled", false)
                $("#quantity_template, #kitchen_sinks, #rest, #payed, #kit_by_client").attr("disabled", true)
                $(this).attr("disabled", true)
                setTimeout(() => {$(this).val("")}, 500);
            }
            else{
                $(this).css("box-shadow", "0 0 5px red")
            }
        })

        function removeBSink(sink){
            if (confirm("Do you want delete the sink " + sink.id + " " + sink.textContent.replace("Delete:", "") + "?")){
                let aux = new Map()
                let i = 0
                kbath.delete(sink.id)
                $("#"+sink.id).remove()
                for (var [key, val] of kbath) {
                    aux.set(key.replace(/[0-9]+/, i), val)
                    kbath = aux
                    i++
                }
            }
            $("select, input, textarea").attr("disabled", false)
        }

        function completeListBath(){
            $("#Bsinks_list").empty().append("Sinks selected: ")
            kbath.forEach((val, key) => {
                if (val){
                    $("#Bsinks_list").append("<button type='button' class='btn mt-1 ml-1 btn-sm btn-info' id='" + key + "'>Delete: " + val +  "</button>")
                    $("#"+key).on("click", function(e){
                        e.preventDefault()
                        e.stopPropagation()
                        removeBSink(this)
                    })
                }
            });
        }

        // Kitchen part
        $("#quantity_sink").on("change", function(){
            if ($(this).val() > ksink.size){
                $("#kitchen_sinks").attr("disabled", false)
            }
            else{
                // if (confirm("You select less"))
                $("#kitchen_sinks").attr("disabled", true)
            }
        })

        $("#kitchen_sinks").on("change", function(e){
            e.preventDefault()
            e.stopPropagation()
            quan_ksink = $("#quantity_sink").val()
            if (ksink.size < quan_ksink){
                switch ($(this).children("option:selected").val()){
                    case "Other":
                        $("#other_kit").text("Other Sink:")
                        $("#kit_by_client").attr("disabled", false)
                        $("#form input").attr("disabled", true)
                        $(this).attr("disabled", false)
                        $("#form checkbox").attr("disabled", true)
                        $("#form textarea").attr("disabled", true)
                        $("#form select").attr("disabled", true)
                        $("#kit_by_client").attr("disabled", false)
                        ksink.set($(this).val() + ksink.size, undefined)
                        break;
                    case "Provided_by_Client":
                        $("#other_kit").text("Sink provided by client:")
                        $("#form input").attr("disabled", true)
                        $("#form checkbox").attr("disabled", true)
                        $("#form textarea").attr("disabled", true)
                        $("#form select").attr("disabled", true)
                        $("#kit_by_client").attr("disabled", false)
                        $(this).attr("disabled", false)
                        ksink.set($(this).val() + ksink.size, undefined) 
                        break;
                    case "-":
                        break;
                    default:
                        ksink.set("stock" + ksink.size, $(this).val())
                        $("#other_kit").text("Sink:")
                        $("#kit_by_client").attr("disabled", true)
                }
                completeListKitchen() 
            }
            else{
                alert("You choose that " + quan_ksink +" sinks. If you want to change some sink, just click the name!")
            }
            setTimeout(() => {$(this).val("option[' - ']")}, 500);
        })

        $("#kit_by_client").on("change", function(e){
            e.preventDefault()
            e.stopPropagation()
            if($(this).val().trim()){
                $(this).css("box-shadow", "0 0 5px green")
                aux = Array.from(ksink)
                aux[aux.length - 1][1] = $(this).val()
                $(this).val("")
                ksink = new Map(aux)
                completeListKitchen()
                $("input").attr("disabled", false)
                $("#desc").attr("disabled", false)
                $("select").attr("disabled", false)
                $("#quantity_template, #rest, #payed, #quantity_vanity, #bath_sink, #bath_by_client").attr("disabled", true)
                $(this).attr("disabled", true)
                setTimeout(() => {$(this).val("")}, 500);
            }
            else{
                $(this).css("box-shadow", "0 0 5px red")
            }
        })

        function completeListKitchen(){
            $("#Ksinks_list").empty().append("Sinks selected: ")
            for (var [key, val] of ksink) {
                if (val){
                    $("#Ksinks_list").append("<button type='button' class='btn mt-2 ml-1 btn-sm btn-info' id='"+ key +"'>" + val + "</button>")
                    $("#"+key).on("click", function(){
                        removeSink(this)
                    })
                }
            }
        }

        function removeSink(sink){
            if (confirm("Do you want delete the sink " + sink.id + " " + sink.textContent.replace("Delete:") + "?")){
                let aux = new Map()
                let i = 0
                ksink.delete(sink.id)
                $("#"+sink.id).remove()
                for (var [key, val] of ksink) {
                    aux.set(key.replace(/[0-9]+/, String(i)), val)
                    ksink = aux
                    i++
                }
            }
        }

        $("#customFile").on("change", function(){
            for (const f of this.files) {
                if (!files_charged.includes(f)){
                    files_charged.push(f)
                }  
            }
        })

        $("#phone").on("change", function(){
            if ($(this).val().trim().length){
                $(this).css("box-shadow", "0 0 5px #0cd808")
                ph = $(this).val().trim()
                let py = require("child_process").spawn("py", [filepy, "searchClientByPhone", ph])
                py.stdout.on('data', (data) => {getClientByPhone(data)})
            }
            else{
                $(this).css("box-shadow", "0 0 5px #f90000")
            }
        })
        $("#accept").on("click", function(){
            let py
            files_job = ""
            switch ($(this).text()){
                case "Register New Client":
                    let flag = false
                    if ($("#name_new").val().trim()){
                        fullname = $("#name_new").val().trim()
                    }
                    else{
                        flag = true
                    }
                    if ($("#phone_new").val().trim()){
                        phone = $("#phone_new").val().trim()
                    }
                    else{
                        flag = true
                    }
                    if ($("#email_new").val().trim()){
                        email = $("#email_new").val().trim()
                    }
                    else{
                        flag = true
                    }
                    if (flag){
                        alert("Be sure you don\'t have some field with only spaces")
                    }
                    else{
                        sendNewClient(fullname, phone, email)
                    }
                    break;
                case "Set installation day":
                    py = require("child_process").spawn("py", [filepy, "newInstallDay", $("#install_day").val().trim(), $("#id_job").val().replace("Job: ", "").trim()])
                    py.stdout.on("data", function(data){
                        if (confirm(data.toString())){
                            window.location.reload()
                        }
                    })
                    $(".modal").modal("hide")
                    break;
                case "Add Plans":
                    let id_job = $("#id_job").val().replace("Job: ", "").trim()
                    let client_name = $("#name_client").val().replace("Client: ", "").trim()
                    if (files_charged.length){
                        files_charged.forEach(file => {
                            files_job += file.path + " - "    
                        })
                    }
                    else{
                        files_job = "false"
                    }
                    py = require("child_process").spawn("py", [filepy, "addPlans", files_job, id_job, client_name])
                    py.stdout.on("data", function(data){
                        if (confirm(data.toString())){
                            window.location.reload()
                        }
                    })
                    $(".modal").modal("hide")
                    break;
            }
        })
    } catch (error) {
        if (confirm(error)){
            window.location.reload()
        }
    }

    $("#template").on("change", function(){
        if ($(this).is(":checked")){
            $("#quantity_template").attr("disabled", false)
        }
        else{
            $("#quantity_template").attr("disabled", true)
        }
    })

    //Special Part
    $("#has_special").on("change", function(){
        if ($(this).is(":checked")){
            $("#description_sp").attr("disabled", false)
        }
        else{
            $("#description_sp").attr("disabled", true)
        }
    })

    $("#back_to_table").on("click", function(){
        window.location.reload()
    })

    $("#menu-toggle").on("click", function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });

    function completeTable(){
        let py = require("child_process").spawn("py", [filepy, "getAllJobs"])
        py.stderr.on("data", function(data){
            alert(data)
        })
        py.stdout.on('data', function(data){
            data = data.toString().split("|")
            data.pop()
            data.forEach(element => {
                element = element.split(",")
                client.push([element[1].replace("(", "").trim(), element[2].replaceAll("'", "").trim()])
            })
            table.jobs(data)
        })
    }

    function getClientByPhone(aCLient){
        c = aCLient
        c = c.toString().split(",")
        if(c[0].includes("There are no some client with that phone")){
            $(".modal-title").empty().append("New Client")            
            $(".modal-body").empty().append(newClientForm())
            $(".modal-footer #accept").empty().append("Register New Client")
            $("#staticBackdrop").modal("show")
            $("#phone_new").val(ph)
            $("#name_new").val()
            $("#email_new").val()
        }
        else{
            $("#fullname").val(c[1].replaceAll("'", ""))
            $("#email").val(c[2].replaceAll("'", ""))
            client = c
        }
    }

    function sendNewJob(client, address, meas, materials, backsp, edge, sp_edge, island, bsink, ksink, templates, descr, special, contract, invoice, method, files, client_name, total, payed, phone, vanity, sec_pay){
        let py = require("child_process").spawn("py", [filepy, "newJob", client, address, meas, materials, backsp, edge, sp_edge, island, bsink, ksink, templates, descr, special, contract, invoice, method, files, client_name, total, payed, phone, vanity, sec_pay])
        py.stderr.on("data", function(data){
            alert(data)
        })
        py.stdout.on('data', function(data){
            alert(data.toString())
            window.location.reload()
        })
    }
})

function sendNewClient(fullname, phone, email){
    let py = require("child_process").spawn("py", [filepy, "newClient", fullname, phone, email])
    py.stderr.on("data", function(data){
        alert(data)
    })
    py.stdout.on('data', function(data){
        alert(data.toString())
        $("#staticBackdrop").modal("hide")
        $("#fullname").val(fullname)
        $("#email").val(email)
    })
}

function completeSelects(){
    let py = require("child_process").spawn("py", [filepy, "getAllSupplies"])
    py.stderr.on("data", function(data){
        alert(data)
    })
    py.stdout.on("data", function(data){
        data = data.toString().split("|")
        data.pop()
        data.forEach(sink => {
            sink = sink.split(",")
            let id_sink = sink[0].replaceAll("(", "").trim()
            let val = sink[1].replaceAll("'", "").trim() + " - " + sink[2].replaceAll("'", "").trim()
            if (sink[4].replaceAll("'", "").trim() == "kitchen"){
                $("#kitchen_sinks").append("<option value='" + id_sink.replaceAll("_", " ") + val.replaceAll("_", " ") +"'>" + val.replaceAll("_", " ") + "</option>" )
            }
            if (sink[4].replaceAll("'", "").trim() == "bath"){
                $("#bath_sink").append("<option value='" + id_sink.replaceAll("_", " ") + val.replaceAll("_", " ") + "'>" + val.replaceAll("_", " ") + "</option>" )
            }
        })
    })
}

function updateJob(address, meas_day, materials, backsplash, edge, sp_edge, bath_sinks, kitchen_sinks, island, templates, description, sp_parts, need_contract, need_invoice, method_pay, files_job, client_name, total_money, payed, phone, vanity, method_sec, id_job){
    let py = require("child_process").spawn("py", [filepy, "updateJob", id_job, address, meas_day, materials, backsplash, edge, sp_edge, bath_sinks, kitchen_sinks, island, templates, description, sp_parts, need_contract, need_invoice, method_pay, files_job, client_name, total_money, payed, phone, vanity, method_sec])
    py.stderr.on("data", function(data){
        alert(data)
    })
    py.stdout.on("data", function(data){
        if (confirm(data.toString())){
            window.location.reload()
        }
    })
}

function newClientForm(){
    return '<form>\
        <div class="input-group mt-2">\
            <div class="input-group-prepend">\
                <span class="input-group-text">Phone: </span>\
            </div>\
            <input type="text" class="form-control" id="phone_new">\
        </div>\
        <div class="input-group mt-2">\
            <div class="input-group-prepend">\
                <span class="input-group-text">Fullname: </span>\
            </div>\
            <input type="text" class="form-control" id="name_new">\
        </div>\
        <div class="input-group mt-2">\
            <div class="input-group-prepend">\
                <span class="input-group-text">Email: </span>\
            </div>\
            <input type="email" class="form-control" id="email_new">\
        </div>\
    </form>'
}