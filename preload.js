// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    //ping: () => ipcRenderer.invoke('ping'),
    getProducts: () => ipcRenderer.invoke('get-Products'),
    getProductsID: (id) => ipcRenderer.invoke('get-Products-Whit-ID',id),
    DeleteProducts: (id) => ipcRenderer.invoke('delete-Products',id),
    UpdateProducts: (id, name, price) => ipcRenderer.invoke('update-Products', id, name, price)
});