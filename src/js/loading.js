var $ = jQuery = require("jquery")
const { cwd, stdout, stderr } = require("process")
var filepy = cwd() + "/resources/app/src/py/main.py"
const fs = require("fs-extra")
const { app, BrowserWindow } = require("electron")

$(document).ready(function(){  
    $("#main").fadeIn("slow")
    have_py = require("child_process").exec("py --version", (error, stdout, stderr) => {
        if (error){
            alert("Error: \n" + error.message)
            require("child_process").exec("cd " + cwd() + "/resources/app/requirements/ && py_interpreter.exe", (error, stdout, stderr) => {
                if (error){
                    alert(error.message)
                }
                if(stdout){
                    alert(stdout)
                }
                if(stderr){
                    alert(stderr)
                }
            })
        
        }
        if (stdout){
            if (stdout.includes("Can't") || stdout.includes("No se")){
                require("child_process").exec("cd " + cwd() + "/resources/app/requirements/ && py_interpreter.exe", (error, stdout, stderr) => {
                    if (error){
                        alert(error.message)
                    }
                    if(stdout){
                        alert(stdout)
                    }
                    if(stderr){
                        alert(stderr)
                    }
                })
                require("child_process").exec('py -c "import sys; print(sys.executable)"',(error, stdout, stderr) => {
                    if (error){
                        alert(error.message)
                    }
                    if(stdout){
                        folder = stdout.split('\\')
                        folder.pop()
                        folder = folder.join("\\")
                        fs.openSync()
                        fs.copySync(cwd() + "/resources/app/requirements/fitz", folder + "/Lib/")
                    }
                    if(stderr){
                        alert(stderr)
                    }
                })
            }
            else{
                /*require("child_process").exec('py -c "import sys; print(sys.executable)"',(error, stdout, stderr) => {
                    if (error){
                        alert(error.message)
                    }
                    if(stdout){
                        folder = stdout.split('\\')
                        folder.pop()
                        folder = folder.join("\\")
                        require("child_process").exec("xcopy " + cwd() + '\\resources\\app\\requirements\\fitz\ "' + folder + '\\Lib\\fitz" /i /e /h /k', (error, stdout, stderr) => {
                            if (error){
                                alert(error.message)
                            }
                            if (stdout){
                                let py = require("child_process").spawn("py", [filepy, "control"])
                                py.stderr.on("data", function(data){
                                    alert(data)
                                })
                                py.stdout.on("data", function(data){
                                    alert("All " + data.toString() + " for start using the software.")
                                })
                                setTimeout(() => {
                                    window.location.href = cwd() + "/resources/app/src/html/login.html"
                                }, 5000)
                            }
                            if(stderr){
                                alert(stderr)
                            }
                        })
                        let py = require("child_process").spawn("py", [filepy, "control"])
                                py.stderr.on("data", function(data){
                                    alert(data)
                                })
                                py.stdout.on("data", function(data){
                                    alert("All " + data.toString() + " for start using the software.")
                                })
                                setTimeout(() => {
                                    window.location.href = cwd() + "/resources/app/src/html/login.html"
                                }, 5000)
                    }
                    if(stderr){
                        alert(stderr)
                    }
                })*/
                let py = require("child_process").spawn("py", [filepy, "control"])
                    py.stderr.on("data", function(data){
                        alert(data)
                    })
                    py.stdout.on("data", function(data){
                        alert("All " + data.toString() + " for start using the software.")
                    })
                    setTimeout(() => {
                        window.location.href = cwd() + "/resources/app/src/html/login.html"
                    }, 5000)
            }   
        }
        if (stderr){
            alert(stderr)
        }
    })  
})