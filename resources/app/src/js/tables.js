completeClients = function(list) {
    send = ""
    $("#clients_list").empty()
    list.pop()
    list.forEach(aClient=> {
        cl = aClient.split(",")
        i = list.indexOf(aClient)
        $("#clients_list").append("<tr id='client_" + i + "'></tr>")
        $("#client_" + i).append("<td class='text-center' >" + cl[0].replaceAll("(", "") + "</td>")
        $("#client_" + i).append("<td class='text-center' >" + cl[1].replaceAll("'", "") + "</td>")
        $("#client_" + i).append("<td class='text-center' >" + cl[2].replaceAll("'", "") + "</td>")
        $("#client_" + i).append("<td class='text-center' >" + cl[3].replaceAll("'", "").replace(")", "") + "</td>")
        $("#client_" + i).append("<td class='text-center'><button class='btn btn-sm btn-light' id='update'>Update</button></td>")
        $("#client_" + i).append("<td class='text-center'><button class='btn btn-sm btn-light' id='delete' data-toggle='modal' data-target='#staticBackdrop'>Delete</button></td>")
    });
}

completeSuppliers = function(list){
    $("#suppliers_list").empty()
    list.pop()
    list.forEach(aSupplier => {
        sup = aSupplier.split(",")
        i = list.indexOf(aSupplier)
        $("#suppliers_list").append("<tr id='supplier_" + i + "'></tr>")
        $("#supplier_" + i).append("<td class='text-center' >" + sup[0].replace("(", "") + "</td>")
        $("#supplier_" + i).append("<td class='text-center' >" + sup[1].replaceAll("'", "") + "</td>")
        $("#supplier_" + i).append("<td class='text-center' >" + sup[2].replaceAll("'", "") + "</td>")
        $("#supplier_" + i).append("<td class='text-center' >" + sup[3].replaceAll("'", "").replace(")", "") + "</td>")
        $("#supplier_" + i).append("<td class='text-center'><button class='btn btn-sm btn-light' id='update'>Update</button></td>")
        $("#supplier_" + i).append("<td class='text-center'><button class='btn btn-sm btn-light' id='delete'>Delete</button></td>")
    })
}

completeJobs = function(list){
    $("#jobs_list").empty()
    list.forEach(aJob => {
        aJob = aJob.split(',')
        $("#jobs_list").append("<tr id='aJob"+ aJob[0].replace("[", "") + "'></tr>")
        $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>"+ aJob[0].replaceAll("[", "")+"</td>") // id
        $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>" + aJob[2].replaceAll("'", "") + "</td>") // client name
        $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>" + aJob[4].replaceAll("'", "").slice(0, -1) + "</td>") // client phone
        if (aJob[3].trim() === "''"){
            $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>No Email</td>") // client email
        }
        else{
            $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>" + aJob[3].replaceAll("'", "") + "</td>") // client email
        }

        $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>" + aJob[5].replaceAll("'", "").replaceAll("/-/", ",") + "</td>") // address
        $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>" + aJob[7].replaceAll("'", "").replaceAll("/-/", ",") + "</td>") // measurment day
        if (aJob[8].replaceAll("'", "").replaceAll("/-/", ",").trim() == "None"){
            $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'><button id='set_install' class='btn btn-light btn-sm'>Set Day</button></td>")    
        }
        else{
            $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>" + aJob[8].replaceAll("'", "").replaceAll("/-/", ",") + "</td>") // installation day
        }
        $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>" + aJob[18].replaceAll("'", "").replaceAll("/-/", ",") + "</td>") // templates
        $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>#" + aJob[0].replaceAll("'", "").replace("[", "") + "</td>") // invoice
        if (aJob[19].replaceAll("'", "").trim() == "false"){
            $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'><button class='btn btn-sm btn-light' id='add_plans'>Add Plans</button></td>")
        }
        else{
            $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'><button class='btn btn-sm btn-light' id='open_plans'>Open Plans</button></td>")
        }
        if (aJob[20].replaceAll("'", "").trim() == "false"){
            $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'>No contract</td>")
        }
        else{
            $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center'><button class='btn btn-sm btn-light' id='open_contract'>Open Contract</button></td>")
        }
        $("#aJob"+ aJob[0].replace("[", "")).append("<td class='text-center' id='more'><button class='btn btn-sm btn-light'>More Details</button></td>")
    })

}

completeSupplies = function(list){
    $("#supplies_list").empty()
    list.pop()
    list.forEach(supply => {
        supply = supply.split(",")
        let has_image = supply[9].replaceAll("'", "").replaceAll(")", "").trim()
        let id = supply[0].replace("(", "")
        $("#supplies_list").append("<tr id='supply" + id + "'></tr>")
        $("#supply" + id).append("<td class='text-center' id='brand'>" + supply[1].replaceAll("'", "").trim() + "</td>") // brand
        $("#supply" + id).append("<td class='text-center' id='brand'>" + supply[2].replaceAll("'", "").trim() + "</td>") // model
        $("#supply" + id).append("<td class='text-center' id='brand'>" + supply[3].replaceAll("'", "").trim() + "</td>") // supplier
        $("#supply" + id).append("<td class='text-center' id='brand'>" + supply[4].replaceAll("'", "").trim() + "</td>") // type
        $("#supply" + id).append("<td class='text-center' id='brand'>$ " + supply[5].replaceAll("'", "").trim() + "</td>") // price
        $("#supply" + id).append("<td class='text-center' id='brand'>" + supply[6].replaceAll("'", "").trim() + "</td>") // material 
        $("#supply" + id).append("<td class='text-center' id='brand'>" + supply[7].replaceAll("'", "").trim() + "</td>") // color
        $("#supply" + id).append("<td class='text-center' id='brand'>" + supply[8].replaceAll("'", "").trim() + "</td>") // size
        if (has_image == "1"){
            $("#supply" + id).append("<td class='text-center' id='brand'><button type='button' class='btn btn-sm btn-light'>Open Images</button></td>") // images
        }
        else{
            $("#supply" + id).append("<td class='text-center' id='brand'><button type='button' id='add_image' class='btn btn-sm btn-light'>Add Images</button></td>") // add images
        }
    });
}

module.exports = {
    clients: completeClients,
    suppliers: completeSuppliers,
    jobs: completeJobs,
    supplies: completeSupplies
}

