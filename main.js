// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;


function createWindow() {   
    mainWindow = new BrowserWindow({
        width: 980,
        height: 700,
        /*
        Esta sección de código es el "corazón de la seguridad" en una aplicación de Electron.
        Básicamente, define cómo se va a comportar la ventana del navegador y qué permisos tendrá sobre tu computadora.
        */
        webPreferences: {
            // Ensure this filename matches your actual file
            preload: path.join(__dirname, 'preload.js'), 
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// This listens for the 'ping' request from the renderer
ipcMain.handle('ping', () => 'pong');