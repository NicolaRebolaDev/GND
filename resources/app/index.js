const { app, BrowserWindow, screen, autoUpdater, dialog} = require('electron')
require("update-electron-app")()

const {cwd} = require("process")
const fs = require("fs");

function createWindow () {
  const {width, height} = screen.getPrimaryDisplay().workAreaSize;
  let win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true,
    }
  })
  win.loadFile('./loading.html')
}

const sendStatusToWindow = (text) => {
  dialog.showMessageBox({
    type: "info",
    buttons: [],
    message: text
  })
}

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for updates... ")
});

autoUpdater.on("update-available", info => {
  sendStatusToWindow("Update available: ")
});

autoUpdater.on("update-not-available", info => {
  sendStatusToWindow("Your app it's updated")
});

autoUpdater.on("error", err => {
  sendStatusToWindow("Error in updating " + err.toString())
});

autoUpdater.on("update-downloaded", info => {
  sendStatusToWindow("Update downloaded. Will install now")
  autoUpdater.quitAndInstall()
});

app.whenReady().then(createWindow)

app.on("before-quit", () =>{
  if (!fs.existsSync(cwd() + "/resources/app/docs/backup")){
    fs.mkdirSync(cwd() + "/resources/app/docs/backup")
  }
  fs.copyFileSync(cwd() + "/resources/app/src/database/main.db", cwd() + "/resources/app/docs/backup/backup.db")
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
