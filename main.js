// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

//DB
/*-----------------------------------------------------------------------*/

require('dotenv').config();
// Cambia Client por Pool
const { Pool } = require("pg");

// Configura el Pool (se queda abierto durante toda la vida de la app)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Función optimizada
async function getProducts() {
    try {
        // El pool maneja el connect y el end internamente por cada consulta
        const result = await pool.query('SELECT * FROM sistempost'); 
        // ¡OJO! Cambié 'sistempost' por 'productos' que es el nombre de la tabla que creamos
        return result.rows;
    } catch (error) {
        console.error('Error en la base de datos:', error.message);
        return [];
    }
}
/*-----------------------------------------------------------------------*/


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


//DB
// El canal IPC que se comunica con el renderer.js
ipcMain.handle('get-Products', async (event) => {
  const products = await getProducts();
  return products;
});