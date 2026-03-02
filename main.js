// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { productSchema, idOnlySchema } = require('./product.validator');  //traigo product.validatos
const logger = require('./Logger.js'); //Logger

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
        // Log de información: útil para saber que la consulta inició
        logger.info('Iniciando consulta a la tabla sistempost');

        const result = await pool.query('SELECT * FROM sistempost'); 
        
        logger.info(`PRODUCTO MOSTRADO`, { 
                audit: true,           // Esto hace que vaya al archivo de auditoría
                action: 'DELETE',      // Qué hizo
                target: 'sistempost',  // Sobre qué tabla 
                date: new Date()
            });

        return result.rows;

    } catch (error) {
        logger.error('Error crítico al obtener productos de la base de datos:', error);
        return [];
    }
}


//get W id
async function getProductsID(id) {
    try {
        logger.info('Iniciando consulta a la tabla sistempost');
        // Usamos $1 como marcador de posición y pasamos el id en un array
        const result = await pool.query('SELECT * FROM sistempost WHERE id = $1', [Number(id)]); 

        if (result.rows.length === 0) {
                logger.warn(`Producto no encontrado: El cliente buscó el ID ${id}`);
                return null; 
            } else{
                logger.info(`PRODUCTO ENCONTRADO CON EXITO`, { 
                audit: true,           // Esto hace que vaya al archivo de auditoría
                action: 'DELETE',      // Qué hizo
                target: 'sistempost',  // Sobre qué tabla
                targetId: id,          // Qué registro
                date: new Date()
            });
            }
        
        return result.rows[0];
    } catch (error) {
        logger.error(`Error en getProductsID para el ID ${id}:`, error);
        throw error;
    }
};

//delete
async function DeleteProductsID(id) {
    try {
        logger.info('Iniciando consulta (delete) a la tabla sistempost');
        const result = await pool.query('DELETE FROM sistempost WHERE id = $1', [Number(id)]); 

        //logger exitoso
        if(result.rowCount > 0){
            // REGISTRO DE AUDITORÍA
            logger.info(`PRODUCTO ELIMINADO`, { 
                audit: true,           // Esto hace que vaya al archivo de auditoría
                action: 'DELETE',      // Qué hizo
                target: 'sistempost',  // Sobre qué tabla
                targetId: id,          // Qué registro
                date: new Date()
            });
        }
        //.rowCount avisa si la accion afectó a alguna fila, 1 si lo hizo, por ende si es >0 es porque alguna fila resultó borrada
        return result.rowCount > 0;
    } catch (error) {
        logger.error('Error crítico al eliminar producto de la base de datos:', error);
        return false;
    }
};

//Update
async function updateProducts(id, name, price) {
    try {
        logger.info('Iniciando consulta (delete) a la tabla sistempost');
        // Usamos $1 como marcador de posición y pasamos el id en un array
        const result = await pool.query('UPDATE sistempost SET name = $1, price = $2 WHERE id = $3', [name, Number(price),Number(id)]); 

        //logger exitoso
        if(result.rowCount > 0){
            logger.info(`PRODUCTO MODIFICADO CON EXITO`, { 
                audit: true,           // Esto hace que vaya al archivo de auditoría
                action: 'DELETE',      // Qué hizo
                target: 'sistempost',  // Sobre qué tabla
                targetId: id,          // Qué registro
                date: new Date()
            });
        }
        
        return result.rowCount > 0;
    } catch (error) {
        logger.error('Error crítico al Modificar producto de la base de datos:', error);
        throw false;
    }
};

//Add element
async function AddElement(id, name, price) {
    try {
        logger.info(`Intentando añadir producto ID: ${id}`);
        // Usamos $1 como marcador de posición y pasamos el id en un array
        const result = await pool.query('INSERT INTO sistempost (id, name, price) VALUES ($1, $2, $3)', [Number(id), name,Number(price)]); 

        //logger exitoso
        if(result.rowCount > 0){
            logger.info(`PRODUCTO AÑADIDIO CON EXITO`, { 
                audit: true,           // Esto hace que vaya al archivo de auditoría
                action: 'DELETE',      // Qué hizo
                target: 'sistempost',  // Sobre qué tabla
                targetId: id,          // Qué registro
                date: new Date()
            });
        }
        
        return result.rowCount > 0;
    } catch (error) {
        logger.error(`Fallo al insertar producto ID ${id}:`, error);
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