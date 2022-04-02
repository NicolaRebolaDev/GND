var $ = jQuery = require("jquery")
const { cwd } = require("process")
var filepy = cwd() + "/resources/app/src/py/main.py"

$(document).ready(function(){
    $("#general").fadeIn(800)
    calendarDiv = document.getElementById("calendar")
    var schedule = new FullCalendar.Calendar(calendarDiv, {
        initialView: "dayGridWeek",
        themeSystem: "bootstrap",
        aspectRatio: 1.8,
        expandRows: true,
        locale: "en",
        hiddenDays: [0],
    })

    schedule.render()
    getAllJobs()

    schedule.setOption("eventClick", function(e){
        $(".modal-title").empty().append(e.event._def.title)
        $(".modal-body").empty().append("<div class='container-fluid' id='eventData'></div>")
        $("#eventData").append("<p><strong>Client\'s name:</strong> " + e.event._def.extendedProps.client + "</p>")
        $("#eventData").append("<p><strong>Client\'s contact: </strong>" + e.event._def.extendedProps.phone + "</p")
        $("#eventData").append("<p><strong>Address: </strong>" + e.event._def.extendedProps.address.replaceAll("/-/", ",") + "</p")
        $(".modal").modal("show")
    })

    $("#menu-toggle").on("click", function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        schedule.updateSize()
    });

    function getAllJobs(){
        let py = require("child_process").spawn("py", [filepy, "getAllJobs"])
        py.stderr.on("data", function(data){
            alert(data)
        })
        py.stdout.on("data", function(data){
            list_jobs = data.toString().split("|")
            list_jobs.pop()
            list_jobs.forEach(aJob => {
                aJob = aJob.split(",")
                schedule.addEvent({
                    id: "M" + aJob[0].replaceAll("[", "").trim(),
                    title: "Measurment. Job: " + aJob[0].replaceAll("[", "").trim(),
                    start: aJob[7].replaceAll("'", ""),
                    color: "#6330FF",
                    display: "list-item",
                    extendedProps: {
                        client: aJob[2].replaceAll("'", ""),
                        address: aJob[5].replaceAll("'", ""),
                        phone: aJob[4].replaceAll("'", "").slice(0, -1)
                    }
                })
                schedule.addEvent({
                    id: "I" + aJob[0].replaceAll("[", "").trim(),
                    title: "Instalation. Job: " + aJob[0].replaceAll("[", "").trim(),
                    start: aJob[8].replaceAll("'", ""),
                    extendedProps: {
                        client: aJob[2].replaceAll("'", ""),
                        address: aJob[5].replaceAll("'", ""),
                        phone: aJob[4].replaceAll("'", "").slice(0, -1)
                    }
                })
            });
        })
    }

})

