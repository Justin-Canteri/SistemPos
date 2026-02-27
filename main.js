// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { productSchema, idOnlySchema } = require('./product.validator');  //traigo product.validatos

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


//API`S
/*-----------------------------------------------------------------------*/
// Function for interact w db

//getAll
async function getProducts() {
    try {
        // El pool maneja el connect y el end internamente por cada consulta
        const result = await pool.query('SELECT * FROM sistempost'); 
        
        return result.rows;
    } catch (error) {
        console.error('Error en la base de datos:', error.message);
        return [];
    }
};


//get W id
async function getProductsID(id) {
    try {
        // Usamos $1 como marcador de posición y pasamos el id en un array
        const result = await pool.query('SELECT * FROM sistempost WHERE id = $1', [Number(id)]); 
        
        return result.rows[0];
    } catch (error) {
        console.error('Error en la base de datos:', error.message);
        throw error;
    }
};

//delete
async function DeleteProductsID(id) {
    try {
        const result = await pool.query('DELETE FROM sistempost WHERE id = $1', [Number(id)]); 
        console.log(result.rowCount > 0);
        //.rowCount avisa si la accion afectó a alguna fila, 1 si lo hizo, por ende si es >0 es porque alguna fila resultó borrada
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error en la base de datos:', error.message);
        return false;
    }
};

//Update
async function updateProducts(id, name, price) {
    try {
        // Usamos $1 como marcador de posición y pasamos el id en un array
        const result = await pool.query('UPDATE sistempost SET name = $1, price = $2 WHERE id = $3', [name, Number(price),Number(id)]); 
        
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error al actualizar en BD:', error.message);
        throw false;
    }
};

//Add element
async function AddElement(id, name, price) {
    try {
        // Usamos $1 como marcador de posición y pasamos el id en un array
        const result = await pool.query('INSERT INTO sistempost (id, name, price) VALUES ($1, $2, $3)', [Number(id), name,Number(price)]); 
        
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error al agregar elemento en BD:', error.message);
        throw false;
    }
}
/*-----------------------------------------------------------------------*/


//Main
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

//conect getallProducts
ipcMain.handle('get-Products', async (event) => {
  const products = await getProducts();
  return products;
});

//conect getProduct W id
ipcMain.handle('get-Products-Whit-ID', async (event,id) => {

  const { error } = idOnlySchema.validate({ id }); 

    if (error) {
        console.error("Validación fallida:", error.details[0].message);
        // Devolvemos un objeto de error para que el Render sepa qué mostrar
        return { success: false, message: error.details[0].message };
    }
    
  const products = await getProductsID(id);
  return products;
});

//delete
ipcMain.handle('delete-Products', async (event, id) =>{

    const { error } = idOnlySchema.validate({ id }); 

    if (error) {
        console.error("Validación fallida:", error.details[0].message);
        // Devolvemos un objeto de error para que el Render sepa qué mostrar
        return { success: false, message: error.details[0].message };
    }

    const Delete = await DeleteProductsID(id);
    return Delete;
});

//Update
ipcMain.handle('update-Products', async (event, id, name, price) => {

    const { error } = productSchema.validate({ id, name, price }); 

    if (error) {
        console.error("Validación fallida:", error.details[0].message);
        // Devolvemos un objeto de error para que el Render sepa qué mostrar
        return { success: false, message: error.details[0].message };
    }

    const Update = await updateProducts(id, name, price);
    return Update;
})

//Add element
ipcMain.handle('Add-Element', async(event, id, name, price) =>{

    const { error } = productSchema.validate({ id, name, price }); 

    if (error) {
        console.error("Validación fallida:", error.details[0].message);
        // Devolvemos un objeto de error para que el Render sepa qué mostrar
        return { success: false, message: error.details[0].message };
    }
    
    const AddE = await AddElement(id, name, price);
    return AddE;
})