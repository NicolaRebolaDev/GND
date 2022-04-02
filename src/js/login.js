const { BrowserWindow } = require("electron")
const crypto = require("crypto")
const { cwd } = require("process")
var $ = jQuery = require("jquery")
var filepy = cwd() + "/resources/app/src/py/main.py"

$(document).ready(function(){
    try{
        let py = require("child_process").spawn("py", [filepy, "getUsers"])
        py.stderr.on("data", function(err){
            alert(err)
        })
        py.stdout.on("data", function(data){
            let flag = false
            if (data.toString().trim() != "OK"){
                alert(data.toString().trim())
                $("#title").empty().append("New User")
                $("#submit").on("click", function(e){
                e.preventDefault()
                e.stopPropagation()
                if(validated()){
                    user = crypto.createHash("sha1").update($("#user").val().trim()).digest("base64")
                    pass = crypto.createHash("sha1").update($("#pass").val()).digest("base64")
                    let new_user = require("child_process").spawn("py", [filepy, "newUser", user, pass])
                    new_user.stderr.on("data", function(data){
                        alert(data)
                    })
                    new_user.stdout.on("data", (data) =>{
                        if (data.toString().trim() == "OK"){
                            alert("Welcome! Now you can Login")
                            setTimeout(()=>{window.location.reload()}, 500)
                        }
                        else{
                            alert(data.toString())
                            }
                        })
                    }
                })
            }
            else{
                $("#submit").on("click", function(e){
                    e.preventDefault()
                    e.stopPropagation()
                    console.log($("#customSwitchUser").prop("checked"))
                    if ($("#customSwitchUser").prop("checked")){
                        if(validated()){
                            user = crypto.createHash("sha1").update($("#user").val().trim()).digest("base64")
                            pass = crypto.createHash("sha1").update($("#pass").val()).digest("base64")
                            let new_user = require("child_process").spawn("py", [filepy, "newUser", user, pass])
                            new_user.stderr.on("data", function(data){
                                alert(data)
                            })
                            new_user.stdout.on("data", (data) =>{
                                if (data.toString().trim() == "OK"){
                                    alert("Welcome! Now you can Login")
                                    setTimeout(()=>{window.location.reload()}, 500)
                                }
                                else{
                                    alert(data.toString())
                                }
                            })
                        }
                    }
                    else{
                        e.preventDefault()
                        e.stopPropagation()
                        setTimeout(() => {}, 1000)
                        if (validated()){
                            let user = crypto.createHash("sha1").update($("#user").val().trim()).digest("base64")
                            let pass = crypto.createHash("sha1").update($("#pass").val()).digest("base64")
                            let confirm_user = require("child_process").spawn("py", [filepy, "confirmUser", user, pass])
                            confirm_user.stderr.on("data", function(data){
                                alert(data)
                            })
                            confirm_user.stdout.on("data", function(data){
                                if (data.toString().trim() == "OK"){
                                    alert("Login Succesfully. Let's Work ;)")
                                    setTimeout(()=>{window.location.href = cwd() + "/resources/app/src/html/schedular.html"})
                                }
                                else{
                                    alert(data.toString().trim())
                                }
                            })
                        }
                    }
                })
            }
        })
    }
    catch (error){
        console.log(error)
    } 
})

function validated(){
    let flag = true
    $("form").find("input").each(function(){
        if ($(this).val().trim() !== ""){
            $(this).css("box-shadow", "0 0 5px green")
        }
        else{
            $(this).css("box-shadow", "0 0 5px red")
            flag = false
            }
    })
    return flag
}
